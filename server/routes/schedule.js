const express = require('express');
const { all, run } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const TIME_SLOTS = [
  { start: '08:30', end: '09:15' },
  { start: '09:25', end: '10:10' },
  { start: '10:30', end: '11:15' },
  { start: '11:35', end: '12:20' },
  { start: '12:40', end: '13:25' },
  { start: '13:45', end: '14:30' },
  { start: '14:40', end: '15:25' },
];

const SUBJECTS_BY_GRADE = {
  5: ['Математика', 'Русский язык', 'Литература', 'История', 'Биология', 'Английский язык', 'ИЗО', 'Музыка', 'Физкультура'],
  6: ['Математика', 'Русский язык', 'Литература', 'История', 'Биология', 'Английский язык', 'Физкультура', 'Информатика'],
  7: ['Алгебра', 'Геометрия', 'Русский язык', 'Литература', 'История', 'Биология', 'Физика', 'Английский язык', 'Физкультура'],
  8: ['Алгебра', 'Геометрия', 'Русский язык', 'Литература', 'История', 'Биология', 'Физика', 'Химия', 'Английский язык', 'Физкультура'],
  9: ['Алгебра', 'Геометрия', 'Русский язык', 'Литература', 'История', 'Обществознание', 'Физика', 'Химия', 'Биология', 'Английский язык', 'Физкультура'],
  10: ['Математика', 'Русский язык', 'Литература', 'История', 'Обществознание', 'Физика', 'Химия', 'Биология', 'Английский язык', 'Информатика', 'Физкультура'],
  11: ['Математика', 'Русский язык', 'Литература', 'История', 'Обществознание', 'Физика', 'Химия', 'Биология', 'Английский язык', 'Информатика', 'Физкультура'],
};

router.get('/schedule', async (req, res) => {
  try {
    // Получаем список классов
    const classRows = await all(`
      SELECT DISTINCT up.class_name
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      WHERE u.role = 'student' AND up.class_name != ''
      ORDER BY up.class_name
    `);
    const classes = classRows.map(r => r.class_name);

    // Получаем все уроки из БД
    const scheduleRows = await all(`SELECT * FROM schedule ORDER BY class_name, day_of_week, lesson_index`);
    
    const schedule = {};
    // Инициализируем пустую структуру для каждого класса
    classes.forEach(cls => {
      schedule[cls] = {};
      DAYS.forEach(day => {
        schedule[cls][day] = [];
      });
    });

    // Заполняем данными из БД
    scheduleRows.forEach(row => {
      if (schedule[row.class_name]) {
        schedule[row.class_name][row.day_of_week].push({
          id: row.id,
          slot: row.lesson_index,
          time: TIME_SLOTS[row.lesson_index],
          subject: row.subject,
          teacher: row.teacher_name,
          room: row.room
        });
      }
    });

    res.json({ classes, schedule, timeSlots: TIME_SLOTS, days: DAYS, subjectsByGrade: SUBJECTS_BY_GRADE });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Обновление урока (только для учителей)
router.post('/schedule/update', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Access denied. Teachers only.' });
    }

    const { class_name, day_of_week, lesson_index, subject, teacher_name, room } = req.body;

    if (!class_name || !day_of_week || lesson_index === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Проверяем, существует ли уже запись
    const existing = await get('SELECT id FROM schedule WHERE class_name = ? AND day_of_week = ? AND lesson_index = ?', 
      [class_name, day_of_week, lesson_index]);

    if (existing) {
      await run(`
        UPDATE schedule 
        SET subject = ?, teacher_name = ?, room = ?
        WHERE id = ?
      `, [subject || '', teacher_name || '', room || '', existing.id]);
    } else {
      await run(`
        INSERT INTO schedule (class_name, day_of_week, lesson_index, subject, teacher_name, room)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [class_name, day_of_week, lesson_index, subject || '', teacher_name || '', room || '']);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
