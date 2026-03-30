const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { run, get, all, seedUserGrades } = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();


router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, middleName = '', role = 'student', className = '', subject = '' } = req.body;

    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Пароль должен быть не менее 6 символов' });

    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Пользователь с таким email уже существует' });

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, passwordHash, role]);
    const userId = result.lastID;

    await run(
      'INSERT INTO user_profiles (user_id, first_name, last_name, middle_name, class_name, subject) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, firstName, lastName, middleName, className, subject]
    );

    if (role === 'student') await seedUserGrades(userId);

    await run('INSERT OR IGNORE INTO user_achievements (user_id, badge_key, badge_name, badge_icon) VALUES (?, ?, ?, ?)',
      [userId, 'newcomer', 'Новичок', '🌟']);

    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
    const user = await get('SELECT id, email, role, created_at FROM users WHERE id = ?', [userId]);
    const profile = await get('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (profile) profile.favorite_subjects = JSON.parse(profile.favorite_subjects || '[]');

    res.status(201).json({ token, user: { ...user, profile } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Введите email и пароль' });

    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Неверный email или пароль' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return res.status(401).json({ error: 'Неверный email или пароль' });

    await run('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const profile = await get('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    if (profile) profile.favorite_subjects = JSON.parse(profile.favorite_subjects || '[]');
    const achievements = await all('SELECT * FROM user_achievements WHERE user_id = ?', [user.id]);

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, created_at: user.created_at, last_login: user.last_login, profile, achievements }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  try {
    const user = await get('SELECT id, email, role, created_at, last_login FROM users WHERE id = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });

    const profile = await get('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    if (profile) profile.favorite_subjects = JSON.parse(profile.favorite_subjects || '[]');
    const achievements = await all('SELECT * FROM user_achievements WHERE user_id = ?', [user.id]);

    res.json({ ...user, profile, achievements });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
