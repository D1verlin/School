const express = require('express');
const { run, get, all, persistDB, recalcAttendance } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function teacherOnly(req, res, next) {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ только для учителей' });
  }
  next();
}

router.get('/stats', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const totalStudents = await get("SELECT COUNT(*) as cnt FROM users WHERE role='student'");
    const totalTeachers = await get("SELECT COUNT(*) as cnt FROM users WHERE role='teacher'");
    const totalNotes = await get("SELECT COUNT(*) as cnt FROM user_notes");
    const totalGrades = await get("SELECT COUNT(*) as cnt FROM user_grades");
    const avgGrade = await get("SELECT ROUND(AVG(grade), 2) as avg FROM user_grades");

    const recentUsers = await all(`
      SELECT u.id, u.email, u.role, u.created_at, up.first_name, up.last_name, up.class_name
      FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id
      ORDER BY u.created_at DESC LIMIT 5
    `);

    const topStudents = await all(`
      SELECT up.first_name, up.last_name, up.class_name, up.grade_avg, up.avatar_url
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      WHERE u.role = 'student' AND up.grade_avg > 0
      ORDER BY up.grade_avg DESC LIMIT 5
    `);

    res.json({
      counts: {
        students: totalStudents.cnt,
        teachers: totalTeachers.cnt,
        notes: totalNotes.cnt,
        grades: totalGrades.cnt,
      },
      avgGrade: avgGrade.avg || 0,
      recentUsers,
      topStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.get('/users', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { role, class: cls, search } = req.query;
    let sql = `
      SELECT u.id, u.email, u.role, u.created_at, u.last_login,
             up.first_name, up.last_name, up.middle_name, up.class_name,
             up.subject, up.avatar_url, up.grade_avg, up.attendance_pct,
             up.absences, up.theme_color, up.status_text
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role) { sql += ` AND u.role = ?`; params.push(role); }
    if (cls) { sql += ` AND up.class_name = ?`; params.push(cls); }
    if (search) {
      sql += ` AND (up.first_name LIKE ? OR up.last_name LIKE ? OR u.email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    sql += ` ORDER BY u.created_at DESC`;

    const users = await all(sql, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.get('/users/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const user = await get(`
      SELECT u.id, u.email, u.role, u.created_at, u.last_login,
             up.first_name, up.last_name, up.middle_name, up.class_name,
             up.subject, up.avatar_url, up.grade_avg, up.attendance_pct,
             up.absences, up.theme_color, up.status_text, up.bio,
             up.favorite_subjects, up.show_grades, up.show_attendance
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ?
    `, [req.params.id]);

    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    user.favorite_subjects = JSON.parse(user.favorite_subjects || '[]');

    const grades = await all('SELECT * FROM user_grades WHERE user_id = ? ORDER BY date DESC', [req.params.id]);
    const achievements = await all('SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_at DESC', [req.params.id]);
    const notes = await all('SELECT id, title, color, created_at FROM user_notes WHERE user_id = ? ORDER BY updated_at DESC', [req.params.id]);

    const bySubject = {};
    grades.forEach(g => {
      if (!bySubject[g.subject]) bySubject[g.subject] = [];
      bySubject[g.subject].push(g);
    });

    res.json({ ...user, grades: { all: grades, bySubject }, achievements, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


router.put('/users/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const targetUser = await get('SELECT role FROM users WHERE id = ?', [req.params.id]);
    const isTeacher = targetUser?.role === 'teacher';

    const { first_name, last_name, middle_name, class_name, subject,
      bio, status_text, role } = req.body;

    if (role) {
      await run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    }

    await run(`
      UPDATE user_profiles SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        middle_name = COALESCE(?, middle_name),
        class_name = COALESCE(?, class_name),
        subject = COALESCE(?, subject),
        bio = COALESCE(?, bio),
        status_text = COALESCE(?, status_text),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `, [first_name ?? null, last_name ?? null, middle_name ?? null,
    class_name ?? null, subject ?? null, bio ?? null, status_text ?? null,
    req.params.id]);

    persistDB();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении' });
  }
});


router.delete('/users/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {

    if (parseInt(req.params.id) === req.user.userId) {
      return res.status(400).json({ error: 'Нельзя удалить свой аккаунт' });
    }
    await run('DELETE FROM users WHERE id = ?', [req.params.id]);
    persistDB();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении' });
  }
});


router.post('/users/:id/grades', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { subject, grade, date, comment = '' } = req.body;
    if (!subject || grade == null || !date)
      return res.status(400).json({ error: 'Заполните subject, grade, date' });

    const result = await run(
      'INSERT INTO user_grades (user_id, subject, grade, date, comment) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, subject, grade, date, comment]
    );

    const rows = await all('SELECT grade FROM user_grades WHERE user_id = ?', [req.params.id]);
    const avg = rows.reduce((s, r) => s + r.grade, 0) / rows.length;
    await run('UPDATE user_profiles SET grade_avg = ? WHERE user_id = ?', [avg, req.params.id]);

    persistDB();
    const newGrade = await get('SELECT * FROM user_grades WHERE id = ?', [result.lastID]);
    res.status(201).json(newGrade);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при добавлении оценки' });
  }
});

router.put('/grades/:gradeId', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const g = await get('SELECT * FROM user_grades WHERE id = ?', [req.params.gradeId]);
    if (!g) return res.status(404).json({ error: 'Оценка не найдена' });

    const { subject, grade, date, comment } = req.body;
    await run('UPDATE user_grades SET subject = ?, grade = ?, date = ?, comment = ? WHERE id = ?',
      [subject ?? g.subject, grade ?? g.grade, date ?? g.date, comment ?? g.comment, req.params.gradeId]);

    const rows = await all('SELECT grade FROM user_grades WHERE user_id = ?', [g.user_id]);
    const avg = rows.reduce((s, r) => s + r.grade, 0) / rows.length;
    await run('UPDATE user_profiles SET grade_avg = ? WHERE user_id = ?', [avg, g.user_id]);

    persistDB();
    res.json(await get('SELECT * FROM user_grades WHERE id = ?', [req.params.gradeId]));
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при редактировании оценки' });
  }
});


router.delete('/grades/:gradeId', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const g = await get('SELECT * FROM user_grades WHERE id = ?', [req.params.gradeId]);
    if (!g) return res.status(404).json({ error: 'Оценка не найдена' });

    await run('DELETE FROM user_grades WHERE id = ?', [req.params.gradeId]);

    const rows = await all('SELECT grade FROM user_grades WHERE user_id = ?', [g.user_id]);
    const avg = rows.length > 0 ? rows.reduce((s, r) => s + r.grade, 0) / rows.length : 0;
    await run('UPDATE user_profiles SET grade_avg = ? WHERE user_id = ?', [avg, g.user_id]);

    persistDB();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении оценки' });
  }
});

router.post('/users/:id/achievements', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { badge_key, badge_name, badge_icon } = req.body;
    await run('INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
      [req.params.id, badge_key, badge_name, badge_icon]);
    persistDB();
    const ach = await all('SELECT * FROM user_achievements WHERE user_id = ?', [req.params.id]);
    res.json(ach);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/achievements/:achId', authMiddleware, teacherOnly, async (req, res) => {
  try {
    await run('DELETE FROM user_achievements WHERE id = ?', [req.params.achId]);
    persistDB();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при удалении достижения' });
  }
});

router.get('/classes', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const classes = await all(`
      SELECT up.class_name, COUNT(*) as count,
             ROUND(AVG(up.grade_avg), 2) as avg_grade,
             ROUND(AVG(up.attendance_pct), 1) as avg_attendance
      FROM user_profiles up
      JOIN users u ON u.id = up.user_id
      WHERE u.role = 'student' AND up.class_name != ''
      GROUP BY up.class_name
      ORDER BY up.class_name
    `);
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.get('/users/:id/attendance', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const records = await all(
      'SELECT date, present FROM attendance_records WHERE user_id = ? ORDER BY date DESC LIMIT 90',
      [req.params.id]
    );
    const profile = await get('SELECT attendance_pct, absences FROM user_profiles WHERE user_id = ?', [req.params.id]);
    res.json({ records, attendance_pct: profile?.attendance_pct || 0, absences: profile?.absences || 0 });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.post('/users/:id/attendance', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { date, present } = req.body;
    if (!date) return res.status(400).json({ error: 'date required' });
    await run('INSERT OR REPLACE INTO attendance_records (user_id, date, present) VALUES (?, ?, ?)',
      [req.params.id, date, present ? 1 : 0]);
    await recalcAttendance(req.params.id);
    const profile = await get('SELECT attendance_pct, absences FROM user_profiles WHERE user_id = ?', [req.params.id]);
    res.json({ attendance_pct: profile.attendance_pct, absences: profile.absences });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

module.exports = router;
