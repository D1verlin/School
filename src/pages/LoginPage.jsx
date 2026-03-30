import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CLASSES = ['5А','5Б','5В','6А','6Б','6В','7А','7Б','7В','8А','8Б','8В','9А','9Б','9В','10А','10Б','11А','11Б'];

const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-on-surface font-body text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200 placeholder:text-outline/50"
    />
  </div>
);

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', middleName: '',
    email: '', password: '', confirmPassword: '',
    role: 'student', className: '', subject: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regData.password !== regData.confirmPassword) {
      return setError('Пароли не совпадают');
    }
    setLoading(true);
    try {
      await register(regData);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-16 bg-surface">
        <div className="w-full max-w-md">
          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <span className="material-symbols-outlined text-5xl text-primary mb-3 block">school</span>
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary">Средняя школа №1</h1>
            <p className="text-on-surface-variant text-sm mt-2 font-body">Личный кабинет</p>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-surface-container-lowest rounded-[2rem] shadow-xl border border-outline-variant/10 overflow-hidden"
          >
            {/* Tabs */}
            <div className="flex border-b border-outline-variant/20">
              {[['login', 'Вход'], ['register', 'Регистрация']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setMode(key); setError(''); }}
                  className={`flex-1 py-4 text-sm font-bold font-headline uppercase tracking-widest transition-all duration-200 ${
                    mode === key
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                {/* LOGIN FORM */}
                {mode === 'login' && (
                  <motion.form key="login" variants={tabVariants} initial="hidden" animate="visible" exit="exit"
                    onSubmit={handleLogin} className="space-y-5"
                  >
                    <InputField label="Email" type="email" value={loginEmail} onChange={setLoginEmail}
                      placeholder="your@email.com" required />
                    <InputField label="Пароль" type="password" value={loginPassword} onChange={setLoginPassword}
                      placeholder="••••••••" required />

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-3 rounded-[1rem] bg-error/10 border border-error/20 text-error text-sm font-body">
                        {error}
                      </motion.div>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:opacity-80 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/10 mt-2">
                      {loading ? 'Входим...' : 'Войти'}
                    </button>

                    <p className="text-center text-xs text-on-surface-variant font-body">
                      Нет аккаунта?{' '}
                      <button type="button" onClick={() => setMode('register')}
                        className="text-primary font-bold hover:underline">
                        Зарегистрируйтесь
                      </button>
                    </p>
                  </motion.form>
                )}

                {/* REGISTER FORM */}
                {mode === 'register' && (
                  <motion.form key="register" variants={tabVariants} initial="hidden" animate="visible" exit="exit"
                    onSubmit={handleRegister} className="space-y-4"
                  >
                    {/* Role toggle */}
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-2">Кто вы?</label>
                      <div className="flex gap-2">
                        {[['student', '👨‍🎓 Ученик'], ['teacher', '👨‍🏫 Учитель']].map(([val, label]) => (
                          <button key={val} type="button"
                            onClick={() => setRegData(d => ({ ...d, role: val }))}
                            className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                              regData.role === val
                                ? 'bg-primary text-on-primary shadow-md'
                                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                            }`}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Имя" value={regData.firstName} required
                        onChange={v => setRegData(d => ({ ...d, firstName: v }))} placeholder="Иван" />
                      <InputField label="Фамилия" value={regData.lastName} required
                        onChange={v => setRegData(d => ({ ...d, lastName: v }))} placeholder="Иванов" />
                    </div>
                    <InputField label="Отчество" value={regData.middleName}
                      onChange={v => setRegData(d => ({ ...d, middleName: v }))} placeholder="Иванович (необязательно)" />

                    {regData.role === 'student' ? (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Класс</label>
                        <select value={regData.className} onChange={e => setRegData(d => ({ ...d, className: e.target.value }))}
                          className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-on-surface text-sm focus:outline-none focus:border-primary transition-all">
                          <option value="">Выберите класс</option>
                          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    ) : (
                      <InputField label="Предмет" value={regData.subject}
                        onChange={v => setRegData(d => ({ ...d, subject: v }))} placeholder="Математика" />
                    )}

                    <InputField label="Email" type="email" value={regData.email} required
                      onChange={v => setRegData(d => ({ ...d, email: v }))} placeholder="your@email.com" />
                    <div className="grid grid-cols-2 gap-3">
                      <InputField label="Пароль" type="password" value={regData.password} required
                        onChange={v => setRegData(d => ({ ...d, password: v }))} placeholder="••••••••" />
                      <InputField label="Повтор" type="password" value={regData.confirmPassword} required
                        onChange={v => setRegData(d => ({ ...d, confirmPassword: v }))} placeholder="••••••••" />
                    </div>

                    {error && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-3 rounded-[1rem] bg-error/10 border border-error/20 text-error text-sm font-body">
                        {error}
                      </motion.div>
                    )}

                    <button type="submit" disabled={loading}
                      className="w-full py-4 rounded-full bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:opacity-80 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-primary/10">
                      {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}
