/**
 * seed.js — Скрипт заполнения БД тестовыми данными
 * Запуск: node seed.js
 *
 * Создаёт учеников и учителей для каждого класса с оценками, посещаемостью и расписанием
 */

const bcrypt = require('bcryptjs');
const { initDB, run, get, all, persistDB } = require('./db');

// ── Данные для генерации ──────────────────────────────────────
const LAST_NAMES = [
  'Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов',
  'Новиков','Фёдоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Егоров',
  'Павлов','Козлов','Степанов','Николаев','Орлов','Андреев','Макаров','Никитин',
  'Захаров','Зайцев','Соловьёв','Борисов','Яковлев','Григорьев','Романов','Воробьёв',
];

const FIRST_NAMES_M = [
  'Александр','Дмитрий','Максим','Сергей','Андрей','Алексей','Артём','Илья',
  'Кирилл','Михаил','Никита','Матвей','Роман','Егор','Арсений','Иван',
  'Денис','Евгений','Тимур','Владислав','Антон','Даниил','Виктор','Олег',
];

const FIRST_NAMES_F = [
  'Анастасия','Екатерина','Мария','Анна','Дарья','Елена','Юлия','Ксения',
  'Полина','Татьяна','Наталья','Ирина','Алина','Виктория','Валерия','Алёна',
  'Диана','София','Вероника','Ольга','Кристина','Александра','Надежда','Яна',
];

const MIDDLE_NAMES_M = [
  'Александрович','Дмитриевич','Сергеевич','Андреевич','Алексеевич',
  'Михайлович','Николаевич','Иванович','Владимирович','Павлович',
];
const MIDDLE_NAMES_F = [
  'Александровна','Дмитриевна','Сергеевна','Андреевна','Алексеевна',
  'Михайловна','Николаевна','Ивановна','Владимировна','Павловна',
];

const CLASSES = [
  '5А','5Б','5В',
  '6А','6Б','6В',
  '7А','7Б','7В',
  '8А','8Б','8В',
  '9А','9Б','9В',
  '10А','10Б',
  '11А','11Б',
];

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const SUBJECTS_BY_GRADE = {
  '5': ['Математика','Русский язык','Литература','История','Биология','Английский язык','ИЗО','Музыка','Физкультура'],
  '6': ['Математика','Русский язык','Литература','История','Биология','Английский язык','Физкультура','Информатика'],
  '7': ['Алгебра','Геометрия','Русский язык','Литература','История','Биология','Физика','Английский язык','Физкультура'],
  '8': ['Алгебра','Геометрия','Русский язык','Литература','История','Биология','Физика','Химия','Английский язык','Физкультура'],
  '9': ['Алгебра','Геометрия','Русский язык','Литература','История','Обществознание','Физика','Химия','Биология','Английский язык','Физкультура'],
  '10': ['Математика','Русский язык','Литература','История','Обществознание','Физика','Химия','Биология','Английский язык','Информатика','Физкультура'],
  '11': ['Математика','Русский язык','Литература','История','Обществознание','Физика','Химия','Биология','Английский язык','Информатика','Физкультура'],
};

// Все уникальные предметы для учителей
const ALL_SUBJECTS = Array.from(new Set(Object.values(SUBJECTS_BY_GRADE).flat()));

const STUDENTS_PER_CLASS = 14; 

// ── Утилиты ───────────────────────────────────────────────────
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randGrade(bias = 0) {
  const weights = bias >= 1 ? [0, 2, 15, 40, 43] :
                  bias <= -1 ? [5, 20, 40, 25, 10] :
                               [0, 5, 25, 40, 30];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i + 1;
  }
  return 4;
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/[а-я]/g, c => ({а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'j',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'}[c] || c));
}

function generateDates(count, monthsBack = 5) {
  const dates = new Set();
  const now = new Date();
  const msPerDay = 86400000;
  const totalDays = monthsBack * 30;

  while (dates.size < count) {
    const daysAgo = randInt(1, totalDays);
    const d = new Date(now - daysAgo * msPerDay);
    const weekday = d.getDay();
    if (weekday === 0 || weekday === 6) continue; 
    dates.add(d.toISOString().split('T')[0]);
  }
  return [...dates].sort();
}

function seededRandom(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ── Комментарии к оценкам ──────────────────────────────────────
const COMMENTS = {
  5: ['Отлично!', 'Молодец!', 'Превосходно!', 'Блестящий ответ', ''],
  4: ['Хорошо', 'Небольшие недочёты', 'Хорошая работа', ''],
  3: ['Удовлетворительно', 'Нужно доработать', 'Слабое знание темы', ''],
  2: ['Неудовлетворительно', 'Не готов к уроку', 'Требуется повторение', ''],
  1: ['Отказ отвечать', 'Не выполнена работа', ''],
};

// ── Генерация ученика ─────────────────────────────────────────
async function createStudent({ firstName, lastName, middleName, className, email, bias }) {
  const password_hash = await bcrypt.hash('school123', 8);

  const userResult = await run(
    'INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, password_hash, 'student']
  );
  if (!userResult.lastID) {
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    return { userId: existing.id, isExisting: true };
  }

  const userId = userResult.lastID;

  await run(
    `INSERT INTO user_profiles (user_id, first_name, last_name, middle_name, class_name, attendance_pct, absences)
     VALUES (?, ?, ?, ?, ?, 0, 0)`,
    [userId, firstName, lastName, middleName, className]
  );

  const gradeNum = className.replace(/[^0-9]/g, '');
  const subjects = SUBJECTS_BY_GRADE[gradeNum] || SUBJECTS_BY_GRADE['8'];
  const gradeCount = randInt(3, 6); 

  const gradeDates = generateDates(subjects.length * gradeCount, 5);
  let di = 0;

  for (const subject of subjects) {
    for (let i = 0; i < gradeCount; i++) {
      const grade = randGrade(bias);
      const date = gradeDates[di % gradeDates.length];
      di++;
      const comment = rand(COMMENTS[grade] || ['']);
      await run(
        'INSERT INTO user_grades (user_id, subject, grade, date, comment) VALUES (?, ?, ?, ?, ?)',
        [userId, subject, grade, date, comment]
      );
    }
  }

  const gradeRows = await all('SELECT grade FROM user_grades WHERE user_id = ?', [userId]);
  const avgGrade = gradeRows.reduce((s, r) => s + r.grade, 0) / (gradeRows.length || 1);

  const totalDays = generateDates(55, 3); 
  const absenceProbability = bias >= 1 ? 0.02 : bias <= -1 ? 0.15 : 0.05;

  let presentCount = 0;
  for (const date of totalDays) {
    const present = Math.random() > absenceProbability ? 1 : 0;
    if (present) presentCount++;
    await run(
      'INSERT OR IGNORE INTO attendance_records (user_id, date, present) VALUES (?, ?, ?)',
      [userId, date, present]
    );
  }

  const attendancePct = Math.round((presentCount / totalDays.length) * 100 * 10) / 10;
  const absences = totalDays.length - presentCount;

  await run(
    'UPDATE user_profiles SET grade_avg = ?, attendance_pct = ?, absences = ? WHERE user_id = ?',
    [Math.round(avgGrade * 100) / 100, attendancePct, absences, userId]
  );

  await run(
    'INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
    [userId, 'newcomer', 'Новичок', '🌟']
  );

  if (avgGrade >= 4.5) {
    await run(
      'INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
      [userId, 'excellent', 'Отличник', '🏆']
    );
  }
  if (attendancePct >= 98) {
    await run(
      'INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
      [userId, 'active', 'Активист', '🚀']
    );
  }

  return { userId, firstName, lastName, className, avgGrade: Math.round(avgGrade * 10) / 10 };
}

// ── Генерация учителя ─────────────────────────────────────────
async function createTeacher({ firstName, lastName, middleName, subject }) {
  const email = `${slugify(lastName)}.${slugify(firstName[0])}@school.ru`;
  const password_hash = await bcrypt.hash('teacher123', 8);

  const userResult = await run(
    'INSERT OR IGNORE INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, password_hash, 'teacher']
  );
  
  let userId;
  if (!userResult.lastID) {
    const row = await get('SELECT id FROM users WHERE email = ?', [email]);
    userId = row.id;
  } else {
    userId = userResult.lastID;
  }

  await run(
    `INSERT OR IGNORE INTO user_profiles (user_id, first_name, last_name, middle_name, subject, bio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, firstName, lastName, middleName, subject, `Преподаватель предмета: ${subject}`]
  );

  return { userId, firstName, lastName, subject };
}

// ── Генерация расписания ──────────────────────────────────────
async function seedSchedule() {
  console.log('📅 Заполнение расписания...');
  
  await run('DELETE FROM schedule'); // Очищаем старое расписание

  const teacherRows = await all(`
    SELECT up.first_name, up.last_name, up.subject
    FROM user_profiles up
    JOIN users u ON u.id = up.user_id
    WHERE u.role = 'teacher'
  `);

  const teacherBySubject = {};
  teacherRows.forEach(t => {
    if (!teacherBySubject[t.subject]) teacherBySubject[t.subject] = [];
    teacherBySubject[t.subject].push(`${t.last_name} ${t.first_name[0]}.`);
  });

  for (const className of CLASSES) {
    const gradeNum = parseInt(className.replace(/[^0-9]/g, ''));
    const subjects = SUBJECTS_BY_GRADE[gradeNum] || SUBJECTS_BY_GRADE['8'];
    const lessonsPerDay = gradeNum <= 6 ? 5 : 7;

    for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
      const day = DAYS[dayIdx];
      const count = dayIdx === 4 ? lessonsPerDay - 1 : lessonsPerDay;

      for (let i = 0; i < count; i++) {
        const seed = gradeNum * 100 + dayIdx * 10 + i;
        const subjectIdx = Math.floor(seededRandom(seed) * subjects.length);
        const subject = subjects[subjectIdx];
        
        const teachers = teacherBySubject[subject] || ['Школьный учитель'];
        const teacher = teachers[seed % teachers.length];

        await run(
          'INSERT INTO schedule (class_name, day_of_week, lesson_index, subject, teacher_name, room) VALUES (?, ?, ?, ?, ?, ?)',
          [className, day, i, subject, teacher, randInt(10, 50) * 10 + randInt(1, 9)]
        );
      }
    }
  }
}

// ── MAIN ─────────────────────────────────────────────────────
async function seed() {
  console.log('\n🌱 Запуск скрипта заполнения базы данных...\n');

  await initDB();

  // 1. Создаём учителей
  console.log('👨‍🏫 Создание учителей...');
  for (const subject of ALL_SUBJECTS) {
    const isFemale = Math.random() > 0.5;
    const firstName = isFemale ? rand(FIRST_NAMES_F) : rand(FIRST_NAMES_M);
    const lastName   = rand(LAST_NAMES) + (isFemale ? 'а' : '');
    const middleName = isFemale ? rand(MIDDLE_NAMES_F) : rand(MIDDLE_NAMES_M);
    await createTeacher({ firstName, lastName, middleName, subject });
  }

  // 2. Создаём учеников
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const className of CLASSES) {
    const gradeNum = parseInt(className.replace(/[^0-9]/g, ''));
    const classBias = gradeNum >= 10 ? 0.5 : gradeNum >= 8 ? 0.1 : 0;
    const studentsInClass = [];

    for (let i = 0; i < STUDENTS_PER_CLASS; i++) {
      const isFemale = i % 2 === 0;
      const firstName = isFemale ? rand(FIRST_NAMES_F) : rand(FIRST_NAMES_M);
      const lastName   = rand(LAST_NAMES) + (isFemale ? 'а' : '');
      const middleName = isFemale ? rand(MIDDLE_NAMES_F) : rand(MIDDLE_NAMES_M);
      const studentBias = classBias + (Math.random() * 2 - 1) * 0.8;
      const emailSlug = `${slugify(lastName)}.${slugify(firstName[0])}.${className.toLowerCase()}${i + 1}`;
      const email = `${emailSlug}@school.ru`;

      const result = await createStudent({
        firstName, lastName, middleName, className, email, bias: studentBias,
      });

      if (result && !result.isExisting) {
        studentsInClass.push(result);
        totalCreated++;
      } else {
        totalSkipped++;
      }
    }
    console.log(`✅ ${className.padEnd(4)} — ${studentsInClass.length || 'готово'} учеников`);
  }

  // 3. Заполняем расписание
  await seedSchedule();

  persistDB();

  console.log(`\n📊 Итого:`);
  console.log(`   Создано учеников: ${totalCreated}`);
  console.log(`   Классов: ${CLASSES.length}`);

  const totalS = await get('SELECT COUNT(*) as cnt FROM users WHERE role = "student"');
  const totalT = await get('SELECT COUNT(*) as cnt FROM users WHERE role = "teacher"');
  console.log(`🏫 Всего в БД: ${totalS.cnt} учеников, ${totalT.cnt} учителей`);
  
  console.log('\n✨ Готово!\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Ошибка:', err);
  process.exit(1);
});
