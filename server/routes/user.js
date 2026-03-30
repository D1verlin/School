const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { run, get, all, persistDB, recalcAttendance } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Multer — avatar uploads
const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.userId}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.includes(ext) ? cb(null, true) : cb(new Error('Только изображения'));
  }
});

// GET /api/user/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const profile = await get('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    if (!profile) return res.status(404).json({ error: 'Профиль не найден' });
    profile.favorite_subjects = JSON.parse(profile.favorite_subjects || '[]');
    res.json(profile);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/user/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const {
      first_name, last_name, middle_name, class_name, subject,
      bio, status_text, favorite_subjects, theme_color,
      show_grades, show_attendance, show_classmates
    } = req.body;

    const favJson = JSON.stringify(Array.isArray(favorite_subjects) ? favorite_subjects : []);

    await run(`UPDATE user_profiles SET
      first_name = COALESCE(?, first_name),
      last_name = COALESCE(?, last_name),
      middle_name = COALESCE(?, middle_name),
      class_name = COALESCE(?, class_name),
      subject = COALESCE(?, subject),
      bio = COALESCE(?, bio),
      status_text = COALESCE(?, status_text),
      favorite_subjects = ?,
      theme_color = COALESCE(?, theme_color),
      show_grades = COALESCE(?, show_grades),
      show_attendance = COALESCE(?, show_attendance),
      show_classmates = COALESCE(?, show_classmates),
      updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?`,
      [
        first_name ?? null, last_name ?? null, middle_name ?? null,
        class_name ?? null, subject ?? null, bio ?? null, status_text ?? null,
        favJson, theme_color ?? null,
        show_grades != null ? (show_grades ? 1 : 0) : null,
        show_attendance != null ? (show_attendance ? 1 : 0) : null,
        show_classmates != null ? (show_classmates ? 1 : 0) : null,
        req.user.userId
      ]
    );

    const updated = await get('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    updated.favorite_subjects = JSON.parse(updated.favorite_subjects || '[]');
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при обновлении профиля' });
  }
});

// POST /api/user/avatar
router.post('/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Delete old avatar
    const profile = await get('SELECT avatar_url FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    if (profile?.avatar_url?.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', profile.avatar_url);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await run('UPDATE user_profiles SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [avatarUrl, req.user.userId]);

    // Award badge only for students
    if (req.user.role === 'student') {
      await run('INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
        [req.user.userId, 'has_avatar', 'Своё лицо', '📸']);
    }
    persistDB();
    res.json({ avatar_url: avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при загрузке аватара' });
  }
});

// GET /api/user/achievements
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const ach = await all('SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_at DESC', [req.user.userId]);
    res.json(ach);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/user/achievements/award
router.post('/achievements/award', authMiddleware, async (req, res) => {
  try {
    const { badge_key, badge_name, badge_icon } = req.body;
    await run('INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
      [req.user.userId, badge_key, badge_name, badge_icon]);
    const ach = await all('SELECT * FROM user_achievements WHERE user_id = ?', [req.user.userId]);
    res.json(ach);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/user/notes
router.get('/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await all('SELECT * FROM user_notes WHERE user_id = ? ORDER BY updated_at DESC', [req.user.userId]);
    res.json(notes);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/user/notes
router.post('/notes', authMiddleware, async (req, res) => {
  try {
    const { title = 'Заметка', content = '', color = '#fffde7' } = req.body;
    const result = await run('INSERT INTO user_notes (user_id, title, content, color) VALUES (?, ?, ?, ?)',
      [req.user.userId, title, content, color]);
    const note = await get('SELECT * FROM user_notes WHERE id = ?', [result.lastID]);
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// PUT /api/user/notes/:id
router.put('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const note = await get('SELECT * FROM user_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!note) return res.status(404).json({ error: 'Заметка не найдена' });

    const { title, content, color } = req.body;
    await run('UPDATE user_notes SET title = ?, content = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title ?? note.title, content ?? note.content, color ?? note.color, req.params.id]);

    res.json(await get('SELECT * FROM user_notes WHERE id = ?', [req.params.id]));
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// DELETE /api/user/notes/:id
router.delete('/notes/:id', authMiddleware, async (req, res) => {
  try {
    const note = await get('SELECT * FROM user_notes WHERE id = ? AND user_id = ?', [req.params.id, req.user.userId]);
    if (!note) return res.status(404).json({ error: 'Заметка не найдена' });
    await run('DELETE FROM user_notes WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/user/grades
router.get('/grades', authMiddleware, async (req, res) => {
  try {
    const grades = await all('SELECT * FROM user_grades WHERE user_id = ? ORDER BY date DESC', [req.user.userId]);
    const bySubject = {};
    grades.forEach(g => {
      if (!bySubject[g.subject]) bySubject[g.subject] = [];
      bySubject[g.subject].push(g);
    });
    res.json({ grades, bySubject });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/user/classmates
router.get('/classmates', authMiddleware, async (req, res) => {
  try {
    const myProfile = await get('SELECT class_name FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    if (!myProfile?.class_name) return res.json([]);

    const classmates = await all(`
      SELECT u.id, u.email, up.first_name, up.last_name, up.avatar_url, up.status_text, up.theme_color
      FROM users u
      JOIN user_profiles up ON u.id = up.user_id
      WHERE up.class_name = ? AND u.id != ? AND u.role = 'student'
      LIMIT 20
    `, [myProfile.class_name, req.user.userId]);

    res.json(classmates);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// GET /api/user/attendance — посещаемость за последние N дней
router.get('/attendance', authMiddleware, async (req, res) => {
  try {
    const rows = await all(
      'SELECT date, present FROM attendance_records WHERE user_id = ? ORDER BY date DESC LIMIT 60',
      [req.user.userId]
    );
    const profile = await get('SELECT attendance_pct, absences FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    res.json({ records: rows, attendance_pct: profile?.attendance_pct || 0, absences: profile?.absences || 0 });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

// POST /api/user/attendance — отметить присутствие/отсутствие (демо)
router.post('/attendance', authMiddleware, async (req, res) => {
  try {
    const { date, present } = req.body;
    if (!date) return res.status(400).json({ error: 'date required' });
    await run('INSERT OR REPLACE INTO attendance_records (user_id, date, present) VALUES (?, ?, ?)',
      [req.user.userId, date, present ? 1 : 0]);
    await recalcAttendance(req.user.userId);
    const profile = await get('SELECT attendance_pct, absences FROM user_profiles WHERE user_id = ?', [req.user.userId]);
    res.json({ attendance_pct: profile.attendance_pct, absences: profile.absences });
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

module.exports = router;
