import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SUBJECTS = ['Математика','Физика','Химия','Биология','История','География',
  'Литература','Английский язык','Информатика','ИЗО','Музыка','Физкультура','Русский язык'];

const ALL_BADGES = [
  { key: 'excellent', name: 'Отличник',   icon: '🏆' },
  { key: 'bookworm',  name: 'Книголюб',   icon: '📚' },
  { key: 'athlete',   name: 'Спортсмен',  icon: '⚽' },
  { key: 'creative',  name: 'Творческая личность', icon: '🎨' },
  { key: 'techie',    name: 'Технарь',    icon: '💻' },
  { key: 'active',    name: 'Активист',   icon: '🚀' },
];

const GRADE_COLOR = (g) =>
  g >= 5 ? 'bg-green-100 text-green-700' :
  g >= 4 ? 'bg-blue-100 text-blue-700' :
  g >= 3 ? 'bg-yellow-100 text-yellow-700' :
           'bg-red-100 text-red-700';

// ── small helpers ─────────────────────────────────────────────
const Tag = ({ children, color = 'bg-surface-container text-on-surface-variant' }) => (
  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color}`}>{children}</span>
);

const SectionTitle = ({ children }) => (
  <h3 className="font-headline text-lg font-bold tracking-tight mb-4">{children}</h3>
);

const ActionBtn = ({ onClick, icon, label, variant = 'default', disabled }) => {
  const base = 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-40';
  const variants = {
    default: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
    primary: 'bg-primary text-on-primary hover:opacity-80',
    danger:  'bg-error/10 text-error hover:bg-error/20',
    success: 'bg-green-100 text-green-700 hover:bg-green-200',
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </button>
  );
};

const Input = ({ label, value, onChange, type = 'text', placeholder, small }) => (
  <div className={`flex flex-col gap-1 ${small ? '' : ''}`}>
    {label && <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">{label}</label>}
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
  </div>
);

// ── STAT CARD ─────────────────────────────────────────────────
const StatCard = ({ label, value, icon, accent }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
    className={`rounded-[1.5rem] p-6 flex flex-col gap-3 border ${
      accent ? 'bg-primary text-on-primary border-transparent' : 'bg-surface-container-lowest border-outline-variant/10'
    } shadow-sm`}>
    <span className={`material-symbols-outlined text-3xl ${accent ? 'opacity-60' : 'text-on-surface-variant'}`}>{icon}</span>
    <div>
      <div className={`font-headline text-4xl font-black tracking-tighter ${accent ? '' : 'text-primary'}`}>{value}</div>
      <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${accent ? 'opacity-60' : 'text-on-surface-variant'}`}>{label}</div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════
export default function TeacherPage() {
  const { user, apiRequest, token } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState('dashboard'); // dashboard | users | userDetail
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('info');

  // Filters
  const [filterRole, setFilterRole]   = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [search, setSearch] = useState('');

  // Grade form
  const [gradeForm, setGradeForm] = useState({ subject: SUBJECTS[0], grade: 5, date: new Date().toISOString().split('T')[0], comment: '' });
  const [gradeEdit, setGradeEdit] = useState(null);

  // User edit form
  const [userEditForm, setUserEditForm] = useState(null);

  // Toast
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Access check
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.role !== 'teacher' && user.role !== 'admin') { navigate('/profile'); return; }
    loadDashboard();
    loadClasses();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const s = await apiRequest('/admin/stats');
      setStats(s);
    } catch (err) { console.error(err); }
  };

  const loadUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole)  params.set('role', filterRole);
      if (filterClass) params.set('class', filterClass);
      if (search)      params.set('search', search);
      const data = await apiRequest(`/admin/users?${params.toString()}`);
      setUsers(data);
    } catch (err) { console.error(err); }
  }, [filterRole, filterClass, search, apiRequest]);

  const loadClasses = async () => {
    try {
      const c = await apiRequest('/admin/classes');
      setClasses(c);
    } catch (err) {}
  };

  useEffect(() => { if (view === 'users') loadUsers(); }, [view, loadUsers]);

  const openUser = async (id) => {
    try {
      const data = await apiRequest(`/admin/users/${id}`);
      setSelectedUser(data);
      setUserEditForm({
        first_name: data.first_name, last_name: data.last_name, middle_name: data.middle_name || '',
        class_name: data.class_name || '', subject: data.subject || '',
        bio: data.bio || '', status_text: data.status_text || '',
        role: data.role, attendance_pct: data.attendance_pct ?? 0, absences: data.absences ?? 0,
      });
      setActiveDetailTab('info');
      setView('userDetail');
    } catch (err) { console.error(err); }
  };

  const refreshUser = async () => {
    if (!selectedUser) return;
    const data = await apiRequest(`/admin/users/${selectedUser.id}`);
    setSelectedUser(data);
  };

  const saveUserEdit = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}`, { method: 'PUT', body: JSON.stringify(userEditForm) });
      await refreshUser();
      showToast('Профиль обновлён');
    } catch (err) { alert(err.message); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Удалить пользователя? Это действие необратимо!')) return;
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
      setView('users');
      loadUsers();
      showToast('Пользователь удалён');
    } catch (err) { alert(err.message); }
  };

  const addGrade = async () => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}/grades`, { method: 'POST', body: JSON.stringify(gradeForm) });
      await refreshUser();
      showToast('Оценка добавлена');
    } catch (err) { alert(err.message); }
  };

  const saveGradeEdit = async () => {
    try {
      await apiRequest(`/admin/grades/${gradeEdit.id}`, { method: 'PUT', body: JSON.stringify(gradeEdit) });
      setGradeEdit(null);
      await refreshUser();
      showToast('Оценка обновлена');
    } catch (err) { alert(err.message); }
  };

  const deleteGrade = async (gradeId) => {
    if (!confirm('Удалить оценку?')) return;
    try {
      await apiRequest(`/admin/grades/${gradeId}`, { method: 'DELETE' });
      await refreshUser();
      showToast('Оценка удалена');
    } catch (err) { alert(err.message); }
  };

  const awardBadge = async (badge) => {
    try {
      await apiRequest(`/admin/users/${selectedUser.id}/achievements`, {
        method: 'POST', body: JSON.stringify(badge)
      });
      await refreshUser();
      showToast(`Выдано: ${badge.badge_name}`);
    } catch (err) { alert(err.message); }
  };

  const deleteAchievement = async (achId) => {
    if (!confirm('Убрать достижение?')) return;
    try {
      await apiRequest(`/admin/achievements/${achId}`, { method: 'DELETE' });
      await refreshUser();
      showToast('Достижение убрано');
    } catch (err) { alert(err.message); }
  };

  const avatarSrc = (url) =>
    url ? (url.startsWith('/uploads') ? `http://localhost:3001${url}` : url) : null;

  const fullName = (u) => [u?.last_name, u?.first_name, u?.middle_name].filter(Boolean).join(' ') || u?.email || '—';

  // ── UI ───────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Navbar />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-xl">
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-20 min-h-[calc(100vh-80px)]">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {view !== 'dashboard' && (
                <button onClick={() => setView(view === 'userDetail' ? 'users' : 'dashboard')}
                  className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Назад
                </button>
              )}
            </div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tighter text-primary">
              {view === 'dashboard' ? 'Панель учителя'
               : view === 'users'  ? 'Все пользователи'
               : fullName(selectedUser)}
            </h1>
            {view === 'userDetail' && selectedUser && (
              <div className="flex items-center gap-2 mt-1">
                <Tag color={selectedUser.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                  {selectedUser.role === 'student' ? '👨‍🎓 Ученик' : '👨‍🏫 Учитель'}
                </Tag>
                {selectedUser.class_name && <Tag>{selectedUser.class_name} класс</Tag>}
                <Tag>ID: {selectedUser.id}</Tag>
              </div>
            )}
          </div>

          {/* NAV PILLS */}
          <div className="flex gap-2">
            <button onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                view === 'dashboard' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              <span className="material-symbols-outlined text-base">dashboard</span>
              <span className="hidden sm:inline">Дашборд</span>
            </button>
            <button onClick={() => setView('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                view === 'users' || view === 'userDetail' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}>
              <span className="material-symbols-outlined text-base">group</span>
              <span className="hidden sm:inline">Пользователи</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════
              DASHBOARD
          ══════════════════════════════════════════ */}
          {view === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {!stats ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Учеников"     value={stats.counts.students} icon="school"          />
                    <StatCard label="Учителей"     value={stats.counts.teachers} icon="person_pin"      />
                    <StatCard label="Оценок"       value={stats.counts.grades}   icon="grade"           />
                    <StatCard label="Заметок"      value={stats.counts.notes}    icon="edit_note"       />
                    <StatCard label="Средний балл" value={stats.avgGrade || '—'} icon="analytics" accent />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Recent registrations */}
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <SectionTitle>Новые пользователи</SectionTitle>
                        <ActionBtn onClick={() => setView('users')} icon="arrow_forward" label="Все" />
                      </div>
                      <div className="space-y-3">
                        {stats.recentUsers.map(u => (
                          <div key={u.id} onClick={() => openUser(u.id)}
                            className="flex items-center gap-3 p-3 rounded-[1rem] hover:bg-surface-container cursor-pointer transition-colors">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-high text-xs font-bold flex-shrink-0">
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold truncate">{fullName(u) || u.email}</div>
                              <div className="text-xs text-on-surface-variant">{u.email}</div>
                            </div>
                            <Tag color={u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                              {u.role === 'student' ? 'Ученик' : 'Учитель'}
                            </Tag>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top students */}
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                      <SectionTitle>🏆 Топ учеников</SectionTitle>
                      <div className="space-y-3">
                        {stats.topStudents.length === 0 && (
                          <p className="text-sm text-on-surface-variant">Пока нет данных об оценках</p>
                        )}
                        {stats.topStudents.map((s, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-lg w-6 text-center">{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
                            <div className="flex-1">
                              <div className="text-sm font-bold">{s.last_name} {s.first_name}</div>
                              <div className="text-xs text-on-surface-variant">{s.class_name || '—'}</div>
                            </div>
                            <span className="font-headline text-xl font-black text-primary">{(s.grade_avg || 0).toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Classes summary */}
                    {classes.length > 0 && (
                      <div className="md:col-span-2 bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                        <SectionTitle>Классы</SectionTitle>
                        <div className="flex flex-wrap gap-3">
                          {classes.map(c => (
                            <button key={c.class_name}
                              onClick={() => { setFilterClass(c.class_name); setFilterRole('student'); setView('users'); }}
                              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container hover:bg-primary hover:text-on-primary transition-all duration-200 text-sm font-bold">
                              <span className="material-symbols-outlined text-base">groups</span>
                              {c.class_name}
                              <span className="text-xs opacity-60">{c.count}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              USERS LIST
          ══════════════════════════════════════════ */}
          {view === 'users' && (
            <motion.div key="users" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* Filters */}
              <div className="bg-surface-container-lowest rounded-[1.5rem] p-5 border border-outline-variant/10 shadow-sm mb-5 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Поиск</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">search</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Имя, фамилия, email..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Роль</label>
                  <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
                    className="px-3 py-2.5 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none">
                    <option value="">Все роли</option>
                    <option value="student">Ученики</option>
                    <option value="teacher">Учителя</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Класс</label>
                  <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
                    className="px-3 py-2.5 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none">
                    <option value="">Все классы</option>
                    {classes.map(c => <option key={c.class_name} value={c.class_name}>{c.class_name}</option>)}
                  </select>
                </div>
                <ActionBtn onClick={() => { setFilterRole(''); setFilterClass(''); setSearch(''); }}
                  icon="filter_list_off" label="Сбросить" />
                <ActionBtn onClick={loadUsers} icon="refresh" label="Обновить" variant="primary" />
              </div>

              {/* Table */}
              <div className="bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container">
                        {['Пользователь','Email','Роль','Класс/Предмет','Ср. балл','Посещ.','Действия'].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-on-surface-variant text-sm">Нет пользователей</td></tr>
                      )}
                      {users.map(u => (
                        <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="border-b border-outline-variant/5 hover:bg-surface-container/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden"
                                style={{ backgroundColor: (u.theme_color || '#000') + '22', color: u.theme_color || '#000' }}>
                                {avatarSrc(u.avatar_url)
                                  ? <img src={avatarSrc(u.avatar_url)} className="w-full h-full object-cover" alt="" />
                                  : `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`
                                }
                              </div>
                              <span className="font-bold text-sm whitespace-nowrap">{fullName(u)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-on-surface-variant">{u.email}</td>
                          <td className="px-5 py-3">
                            <Tag color={u.role === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}>
                              {u.role === 'student' ? 'Ученик' : 'Учитель'}
                            </Tag>
                          </td>
                          <td className="px-5 py-3 text-sm">{u.class_name || u.subject || '—'}</td>
                          <td className="px-5 py-3">
                            {u.grade_avg > 0 ? (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${GRADE_COLOR(u.grade_avg)}`}>
                                {(u.grade_avg).toFixed(1)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-5 py-3 text-sm text-on-surface-variant">{u.attendance_pct ? `${u.attendance_pct}%` : '—'}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1.5">
                              <ActionBtn onClick={() => openUser(u.id)} icon="open_in_new" label="Открыть" variant="primary" />
                              <ActionBtn onClick={() => deleteUser(u.id)} icon="delete" label="" variant="danger" />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                  Найдено: {users.length}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════════════════════════
              USER DETAIL
          ══════════════════════════════════════════ */}
          {view === 'userDetail' && selectedUser && (
            <motion.div key="userDetail" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* User header card */}
              <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm mb-6 overflow-hidden">
                <div className="h-20" style={{ backgroundColor: selectedUser.theme_color || '#000' }} />
                <div className="px-6 pb-6 pt-0">
                  <div className="flex items-end gap-4 -mt-10 mb-4">
                    <div className="w-20 h-20 rounded-[1rem] border-3 border-white overflow-hidden flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-lg"
                      style={{ backgroundColor: (selectedUser.theme_color || '#000') + '22' }}>
                      {avatarSrc(selectedUser.avatar_url)
                        ? <img src={avatarSrc(selectedUser.avatar_url)} className="w-full h-full object-cover" alt="" />
                        : `${selectedUser.first_name?.[0] || ''}${selectedUser.last_name?.[0] || ''}`
                      }
                    </div>
                    <div className="flex-1 mb-1">
                      <div className="font-headline text-xl font-extrabold">{fullName(selectedUser)}</div>
                      <div className="text-sm text-on-surface-variant">{selectedUser.email}</div>
                    </div>
                    <div className="flex gap-2 mb-1">
                      <ActionBtn onClick={() => deleteUser(selectedUser.id)} icon="delete" label="Удалить" variant="danger" />
                    </div>
                  </div>
                  {selectedUser.bio && <p className="text-sm text-on-surface-variant mb-3">{selectedUser.bio}</p>}
                </div>
              </div>

              {/* Detail TABS */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  ['info', 'person', 'Профиль'],
                  ['grades', 'grade', 'Оценки'],
                  ['achievements', 'emoji_events', 'Достижения'],
                ].map(([key, icon, label]) => (
                  <button key={key} onClick={() => setActiveDetailTab(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      activeDetailTab === key ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">

                {/* ── INFO / EDIT TAB ── */}
                {activeDetailTab === 'info' && userEditForm && (
                  <motion.div key="info" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm space-y-4">
                      <SectionTitle>Редактировать профиль</SectionTitle>
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Имя"      value={userEditForm.first_name}  onChange={v => setUserEditForm(f => ({...f, first_name: v}))} />
                        <Input label="Фамилия"  value={userEditForm.last_name}   onChange={v => setUserEditForm(f => ({...f, last_name: v}))} />
                      </div>
                      <Input label="Отчество"   value={userEditForm.middle_name} onChange={v => setUserEditForm(f => ({...f, middle_name: v}))} />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Input label="Класс" value={userEditForm.class_name}  onChange={v => setUserEditForm(f => ({...f, class_name: v}))} placeholder="10А" />
                        <Input label="Предмет" value={userEditForm.subject}   onChange={v => setUserEditForm(f => ({...f, subject: v}))} placeholder="Математика" />
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Роль</label>
                        <select value={userEditForm.role} onChange={e => setUserEditForm(f => ({...f, role: e.target.value}))}
                          className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none">
                          <option value="student">Ученик</option>
                          <option value="teacher">Учитель</option>
                          <option value="admin">Администратор</option>
                        </select>
                      </div>

                      <Input label="Статус" value={userEditForm.status_text} onChange={v => setUserEditForm(f => ({...f, status_text: v}))} placeholder="Статус..." />

                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Биография</label>
                        <textarea value={userEditForm.bio || ''} onChange={e => setUserEditForm(f => ({...f, bio: e.target.value}))}
                          rows={3} className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none resize-none" />
                      </div>

                      <ActionBtn onClick={saveUserEdit} icon="save" label="Сохранить изменения" variant="primary" />
                    </div>

                    {/* Stats readonly */}
                    <div className="space-y-4">
                      <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm space-y-4">
                        <SectionTitle>Показатели посещаемости</SectionTitle>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Посещаемость %</label>
                            <input type="number" min="0" max="100" step="0.1"
                              value={userEditForm.attendance_pct}
                              onChange={e => setUserEditForm(f => ({...f, attendance_pct: parseFloat(e.target.value)}))}
                              className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Пропусков</label>
                            <input type="number" min="0"
                              value={userEditForm.absences}
                              onChange={e => setUserEditForm(f => ({...f, absences: parseInt(e.target.value)}))}
                              className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none" />
                          </div>
                        </div>
                        <ActionBtn onClick={saveUserEdit} icon="save" label="Сохранить" variant="primary" />
                      </div>

                      <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                        <SectionTitle>Любимые предметы</SectionTitle>
                        {selectedUser.favorite_subjects?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedUser.favorite_subjects.map(s => <Tag key={s}>{s}</Tag>)}
                          </div>
                        ) : <p className="text-sm text-on-surface-variant">Не указаны</p>}
                      </div>

                      <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                        <SectionTitle>Заметки</SectionTitle>
                        {selectedUser.notes?.length === 0
                          ? <p className="text-sm text-on-surface-variant">Нет заметок</p>
                          : <p className="text-sm text-on-surface-variant">{selectedUser.notes?.length} заметок</p>
                        }
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── GRADES TAB ── */}
                {activeDetailTab === 'grades' && (
                  <motion.div key="grades" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Add grade form */}
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm space-y-4">
                      <SectionTitle>Добавить оценку</SectionTitle>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Предмет</label>
                        <select value={gradeForm.subject} onChange={e => setGradeForm(f => ({...f, subject: e.target.value}))}
                          className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none">
                          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Оценка</label>
                          <input type="number" min="1" max="10" value={gradeForm.grade}
                            onChange={e => setGradeForm(f => ({...f, grade: parseFloat(e.target.value)}))}
                            className="w-full px-3 py-2 rounded-[0.75rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none" />
                        </div>
                        <Input label="Дата" type="date" value={gradeForm.date}
                          onChange={v => setGradeForm(f => ({...f, date: v}))} />
                      </div>
                      <Input label="Комментарий" value={gradeForm.comment}
                        onChange={v => setGradeForm(f => ({...f, comment: v}))} placeholder="Необязательно" />
                      <ActionBtn onClick={addGrade} icon="add_circle" label="Добавить оценку" variant="primary" />
                    </div>

                    {/* Grades by subject */}
                    <div className="lg:col-span-2 space-y-4">
                      {Object.entries(selectedUser.grades?.bySubject || {}).map(([subject, gs]) => {
                        const avg = gs.reduce((s, g) => s + g.grade, 0) / gs.length;
                        return (
                          <div key={subject} className="bg-surface-container-lowest rounded-[1.5rem] p-5 border border-outline-variant/10">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-sm">{subject}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-sm font-black ${GRADE_COLOR(avg)}`}>
                                Ср: {avg.toFixed(1)}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {gs.map(g => (
                                <div key={g.id} className="flex items-center gap-2">
                                  {gradeEdit?.id === g.id ? (
                                    <>
                                      <input type="number" min="1" max="10" value={gradeEdit.grade}
                                        onChange={e => setGradeEdit(f => ({...f, grade: parseFloat(e.target.value)}))}
                                        className="w-16 px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-sm text-center" />
                                      <input type="date" value={gradeEdit.date}
                                        onChange={e => setGradeEdit(f => ({...f, date: e.target.value}))}
                                        className="px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs" />
                                      <input value={gradeEdit.comment || ''} placeholder="Комментарий"
                                        onChange={e => setGradeEdit(f => ({...f, comment: e.target.value}))}
                                        className="flex-1 px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-xs" />
                                      <ActionBtn onClick={saveGradeEdit} icon="save" label="" variant="success" />
                                      <ActionBtn onClick={() => setGradeEdit(null)} icon="close" label="" />
                                    </>
                                  ) : (
                                    <>
                                      <span className={`w-9 h-9 rounded-[0.6rem] flex items-center justify-center text-sm font-black flex-shrink-0 ${GRADE_COLOR(g.grade)}`}>
                                        {g.grade}
                                      </span>
                                      <span className="text-xs text-on-surface-variant">{g.date}</span>
                                      {g.comment && <span className="text-xs text-on-surface-variant italic flex-1 truncate">{g.comment}</span>}
                                      <div className="ml-auto flex gap-1">
                                        <ActionBtn onClick={() => setGradeEdit({...g})} icon="edit" label="" />
                                        <ActionBtn onClick={() => deleteGrade(g.id)} icon="delete" label="" variant="danger" />
                                      </div>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                      {Object.keys(selectedUser.grades?.bySubject || {}).length === 0 && (
                        <div className="text-center py-10 text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl block mb-2">grade</span>
                          <p className="text-sm">Оценок пока нет</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── ACHIEVEMENTS TAB ── */}
                {activeDetailTab === 'achievements' && (
                  <motion.div key="achievements" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Current achievements */}
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                      <SectionTitle>Текущие достижения ({selectedUser.achievements?.length || 0})</SectionTitle>
                      {selectedUser.achievements?.length === 0 ? (
                        <p className="text-sm text-on-surface-variant">Нет достижений</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedUser.achievements?.map(a => (
                            <div key={a.id} className="flex items-center gap-3 p-3 rounded-[1rem] bg-surface-container-low">
                              <span className="text-2xl">{a.badge_icon}</span>
                              <div className="flex-1">
                                <div className="text-sm font-bold">{a.badge_name}</div>
                                <div className="text-xs text-on-surface-variant">{new Date(a.earned_at).toLocaleDateString('ru-RU')}</div>
                              </div>
                              <ActionBtn onClick={() => deleteAchievement(a.id)} icon="delete" label="" variant="danger" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Award badges */}
                    <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                      <SectionTitle>Выдать достижение</SectionTitle>
                      <div className="space-y-2">
                        {ALL_BADGES.map(badge => {
                          const alreadyHas = selectedUser.achievements?.find(a => a.badge_key === badge.key);
                          return (
                            <button key={badge.key} disabled={!!alreadyHas}
                              onClick={() => awardBadge({ badge_key: badge.key, badge_name: badge.name, badge_icon: badge.icon })}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-[1rem] text-sm font-bold transition-all duration-200 ${
                                alreadyHas
                                  ? 'bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed'
                                  : 'bg-surface-container hover:bg-primary hover:text-on-primary cursor-pointer'
                              }`}>
                              <span className="text-xl">{badge.icon}</span>
                              <span>{badge.name}</span>
                              {alreadyHas && <span className="ml-auto text-xs opacity-60">✓ Есть</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </motion.div>
  );
}
