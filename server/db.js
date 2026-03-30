const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'school.db');

let db = null;


function persistDB() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}


setInterval(persistDB, 5000);


process.on('exit', persistDB);
process.on('SIGINT', () => { persistDB(); process.exit(0); });
process.on('SIGTERM', () => { persistDB(); process.exit(0); });


function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      db.run(sql, params);
      const row = db.exec('SELECT last_insert_rowid() as id');
      const lastID = row[0]?.values[0][0] ?? null;
      resolve({ lastID });
    } catch (err) { reject(err); }
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        resolve(result);
      } else {
        stmt.free();
        resolve(undefined);
      }
    } catch (err) { reject(err); }
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(sql);
      stmt.bind(params);
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      resolve(rows);
    } catch (err) { reject(err); }
  });
}

async function initDB() {
  const SQL = await initSqlJs();


  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log('📦 Loaded existing database from disk');
  } else {
    db = new SQL.Database();
    console.log('📦 Created new database');
  }

  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    middle_name TEXT DEFAULT '',
    class_name TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    status_text TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    favorite_subjects TEXT DEFAULT '[]',
    theme_color TEXT DEFAULT '#000000',
    show_grades INTEGER DEFAULT 1,
    show_attendance INTEGER DEFAULT 1,
    show_classmates INTEGER DEFAULT 1,
    grade_avg REAL DEFAULT 0,
    attendance_pct REAL DEFAULT 0,
    absences INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_key TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_key)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL DEFAULT 'Заметка',
    content TEXT NOT NULL DEFAULT '',
    color TEXT DEFAULT '#fffde7',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS user_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    grade REAL NOT NULL,
    date TEXT NOT NULL,
    comment TEXT DEFAULT ''
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    present INTEGER NOT NULL DEFAULT 1,
    UNIQUE(user_id, date)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_name TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    lesson_index INTEGER NOT NULL,
    subject TEXT NOT NULL,
    teacher_name TEXT,
    room TEXT,
    UNIQUE(class_name, day_of_week, lesson_index)
  )`);

  persistDB();
  console.log('Database tables ready');
}

async function seedUserGrades(userId) {
  const row = await get('SELECT COUNT(*) as cnt FROM user_grades WHERE user_id = ?', [userId]);
  if (row && row.cnt > 0) return;

  const subjects = [
    { subject: 'Математика', grades: [5, 4, 5, 5, 4] },
    { subject: 'Русский язык', grades: [4, 5, 4, 4, 5] },
    { subject: 'Физика', grades: [5, 5, 4, 5, 5] },
    { subject: 'История', grades: [4, 4, 3, 4, 4] },
    { subject: 'Английский язык', grades: [5, 5, 5, 4, 5] },
    { subject: 'Химия', grades: [4, 3, 4, 4, 3] },
    { subject: 'Биология', grades: [5, 4, 5, 5, 4] },
  ];

  const now = new Date();
  for (const { subject, grades } of subjects) {
    for (let i = 0; i < grades.length; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (grades.length - i) * 7);
      await run('INSERT INTO user_grades (user_id, subject, grade, date) VALUES (?, ?, ?, ?)',
        [userId, subject, grades[i], date.toISOString().split('T')[0]]);
    }
  }

  const gradesAll = await all('SELECT grade FROM user_grades WHERE user_id = ?', [userId]);
  const avg = gradesAll.reduce((s, g) => s + g.grade, 0) / gradesAll.length;
  await run('UPDATE user_profiles SET grade_avg = ?, attendance_pct = ?, absences = ? WHERE user_id = ?',
    [avg || 0, 96.5, 3, userId]);

  persistDB();
}

async function recalcAttendance(userId) {
  const rows = await all('SELECT present FROM attendance_records WHERE user_id = ?', [userId]);
  if (rows.length === 0) return;
  const presentCount = rows.filter(r => r.present).length;
  const pct = Math.round((presentCount / rows.length) * 1000) / 10;
  const absences = rows.length - presentCount;
  await run('UPDATE user_profiles SET attendance_pct = ?, absences = ? WHERE user_id = ?',
    [pct, absences, userId]);
  persistDB();
}

module.exports = { run, get, all, initDB, seedUserGrades, persistDB, recalcAttendance };
