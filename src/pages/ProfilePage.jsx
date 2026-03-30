import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SUBJECTS = ['Математика','Физика','Химия','Биология','История','География','Литература','Английский язык','Информатика','ИЗО','Музыка','Физкультура'];

const ALL_BADGES = [
  { key: 'excellent', name: 'Отличник',       icon: '🏆', desc: 'Средний балл выше 4.5' },
  { key: 'bookworm',  name: 'Книголюб',        icon: '📚', desc: 'Любимый предмет — Литература' },
  { key: 'athlete',   name: 'Спортсмен',       icon: '⚽', desc: 'Занимается спортом в школе' },
  { key: 'creative',  name: 'Творческая личность', icon: '🎨', desc: 'Участвует в творческих конкурсах' },
  { key: 'techie',    name: 'Технарь',         icon: '💻', desc: 'Любимый предмет — Информатика' },
  { key: 'newcomer',  name: 'Новичок',         icon: '🌟', desc: 'Первая регистрация' },
  { key: 'has_avatar',name: 'Своё лицо',       icon: '📸', desc: 'Загрузил аватар' },
  { key: 'active',    name: 'Активист',        icon: '🚀', desc: 'Заполнил профиль полностью' },
];

const THEME_COLORS = [
  { color: '#000000', label: 'Классика' },
  { color: '#1565C0', label: 'Синий' },
  { color: '#2E7D32', label: 'Зелёный' },
  { color: '#6A1B9A', label: 'Фиолетовый' },
  { color: '#C62828', label: 'Красный' },
  { color: '#E65100', label: 'Оранжевый' },
  { color: '#00695C', label: 'Бирюза' },
  { color: '#4527A0', label: 'Индиго' },
];

const NOTE_COLORS = ['#fffde7','#f3e5f5','#e3f2fd','#e8f5e9','#fce4ec','#fff3e0'];

const TabBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
      active ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant hover:bg-surface-container'
    }`}>
    <span className="material-symbols-outlined text-base">{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const StatCard = ({ label, value, sub, accent }) => (
  <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
    className={`rounded-[1.5rem] p-6 flex flex-col justify-between min-h-[130px] shadow-sm ${
      accent ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest border border-outline-variant/10'
    }`}>
    <span className={`text-xs font-bold uppercase tracking-widest font-label ${accent ? 'opacity-60' : 'text-on-surface-variant'}`}>{label}</span>
    <div>
      <div className={`font-headline text-4xl font-black tracking-tighter ${accent ? '' : 'text-primary'}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${accent ? 'opacity-70' : 'text-on-surface-variant'}`}>{sub}</div>}
    </div>
  </motion.div>
);

export default function ProfilePage() {
  const { user, logout, apiRequest, refreshUser, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [notes, setNotes] = useState([]);
  const [grades, setGrades] = useState({ bySubject: {} });
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: NOTE_COLORS[0] });
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadAll();
  }, [user]);

  const loadAll = async () => {
    try {
      const isTeacher = user?.role === 'teacher' || user?.role === 'admin';
      const [p, a, n, g] = await Promise.all([
        apiRequest('/user/profile'),
        isTeacher ? Promise.resolve([]) : apiRequest('/user/achievements'),
        apiRequest('/user/notes'),
        isTeacher ? Promise.resolve({ bySubject: {} }) : apiRequest('/user/grades'),
      ]);
      setProfile(p);
      setEditForm({
        first_name: p.first_name, last_name: p.last_name, middle_name: p.middle_name || '',
        class_name: p.class_name || '', subject: p.subject || '',
        bio: p.bio || '', status_text: p.status_text || '',
        favorite_subjects: p.favorite_subjects || [],
        theme_color: p.theme_color || '#000000',
        show_grades: !!p.show_grades, show_attendance: !!p.show_attendance, show_classmates: !!p.show_classmates,
      });
      setAchievements(a);
      setNotes(n);
      setGrades(g);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const updated = await apiRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(editForm)
      });
      setProfile(updated);
      setEditing(false);
      showSuccess('Профиль обновлён!');
      // Check if profile is complete for achievement
      if (updated.bio && updated.bio.length > 10 && updated.favorite_subjects?.length > 0) {
        await apiRequest('/user/achievements/award', {
          method: 'POST',
          body: JSON.stringify({ badge_key: 'active', badge_name: 'Активист', badge_icon: '🚀' })
        });
        const a = await apiRequest('/user/achievements');
        setAchievements(a);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProfile(p => ({ ...p, avatar_url: data.avatar_url }));
      const a = await apiRequest('/user/achievements');
      setAchievements(a);
      showSuccess('Аватар обновлён!');
    } catch (err) {
      alert(err.message);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.content.trim()) return;
    try {
      const note = await apiRequest('/user/notes', {
        method: 'POST', body: JSON.stringify(newNote)
      });
      setNotes(n => [note, ...n]);
      setNewNote({ title: '', content: '', color: NOTE_COLORS[0] });
      setAddingNote(false);
      showSuccess('Заметка добавлена!');
    } catch (err) { alert(err.message); }
  };

  const handleUpdateNote = async (id) => {
    try {
      const updated = await apiRequest(`/user/notes/${id}`, {
        method: 'PUT', body: JSON.stringify(editingNote)
      });
      setNotes(n => n.map(x => x.id === id ? updated : x));
      setEditingNote(null);
    } catch (err) { alert(err.message); }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Удалить заметку?')) return;
    try {
      await apiRequest(`/user/notes/${id}`, { method: 'DELETE' });
      setNotes(n => n.filter(x => x.id !== id));
    } catch (err) { alert(err.message); }
  };

  const toggleFavSubject = (subj) => {
    setEditForm(f => ({
      ...f,
      favorite_subjects: f.favorite_subjects.includes(subj)
        ? f.favorite_subjects.filter(s => s !== subj)
        : [...f.favorite_subjects, subj]
    }));
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Compute grades chart
  const gradeEntries = Object.entries(grades.bySubject || {});
  const subjectAvgs = gradeEntries.map(([subj, gs]) => ({
    subject: subj,
    avg: gs.reduce((s, g) => s + g.grade, 0) / gs.length
  })).sort((a, b) => b.avg - a.avg);

  const overallAvg = subjectAvgs.length > 0
    ? (subjectAvgs.reduce((s, x) => s + x.avg, 0) / subjectAvgs.length).toFixed(2)
    : (profile?.grade_avg || 0).toFixed(2);

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const avatarSrc = profile.avatar_url
    ? (profile.avatar_url.startsWith('/uploads') ? `http://localhost:3001${profile.avatar_url}` : profile.avatar_url)
    : null;
  const fullName = [profile.last_name, profile.first_name, profile.middle_name].filter(Boolean).join(' ');
  const themeColor = profile.theme_color || '#000000';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Navbar />

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-primary text-on-primary px-6 py-3 rounded-full text-sm font-bold shadow-xl">
            ✓ {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-20">
        
        {/* ── HERO / PROFILE HEADER ── */}
        <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="mb-10">
          <div className="rounded-[2rem] overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
            {/* Banner */}
            <div className="h-28 sm:h-36 relative" style={{ backgroundColor: themeColor }}>
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: `radial-gradient(circle at 20% 50%, white 0%, transparent 60%), radial-gradient(circle at 80% 20%, white 0%, transparent 50%)` }} />
            </div>

            <div className="px-6 sm:px-10 pb-8 pt-0">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-6">
                {/* Avatar */}
                <div className="relative group w-28 h-28 flex-shrink-0">
                  <div className="w-28 h-28 rounded-[1.2rem] border-4 border-surface-container-lowest overflow-hidden bg-surface-container shadow-xl">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="Аватар" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-on-surface-variant font-headline"
                        style={{ backgroundColor: themeColor + '22' }}>
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </div>
                    )}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-[1.2rem] bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="material-symbols-outlined text-white text-2xl">
                      {avatarLoading ? 'sync' : 'photo_camera'}
                    </span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </div>

                <div className="flex-1 sm:mb-2">
                  <div className="flex flex-wrap items-start gap-3">
                    <div>
                      <h1 className="font-headline text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">{fullName}</h1>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant uppercase tracking-wider">
                          {user.role === 'student' ? `${profile.class_name || '—'} класс` : `Учитель · ${profile.subject || '—'}`}
                        </span>
                        {profile.status_text && (
                          <span className="px-3 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant italic">
                            {profile.status_text}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 sm:mb-2">
                  <button onClick={() => setEditing(v => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-base">{editing ? 'close' : 'edit'}</span>
                    {editing ? 'Отмена' : 'Редактировать'}
                  </button>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface text-sm font-bold hover:bg-error/10 hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-base">logout</span>
                  </button>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && !editing && (
                <p className="text-on-surface-variant text-sm font-body leading-relaxed max-w-2xl mb-4">{profile.bio}</p>
              )}

              {/* Favorite subjects tags */}
              {profile.favorite_subjects?.length > 0 && !editing && (
                <div className="flex flex-wrap gap-2">
                  {profile.favorite_subjects.map(s => (
                    <span key={s} className="px-3 py-1 rounded-full text-xs font-bold border border-outline-variant/30 text-on-surface-variant">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── EDIT FORM ── */}
        <AnimatePresence>
          {editing && (
            <motion.section key="edit-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
              className="mb-10 overflow-hidden">
              <div className="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-10 border border-outline-variant/10 shadow-sm space-y-6">
                <h2 className="font-headline text-xl font-bold tracking-tight">Редактирование профиля</h2>

                {/* Name fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[['Имя','first_name','Иван'],['Фамилия','last_name','Иванов'],['Отчество','middle_name','Иванович']].map(([label, key, ph]) => (
                    <div key={key}>
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">{label}</label>
                      <input value={editForm[key] || ''} onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                        placeholder={ph}
                        className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                    </div>
                  ))}
                </div>

                {/* Class / Subject */}
                {user.role === 'student' ? (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">Класс</label>
                    <input value={editForm.class_name || ''} onChange={e => setEditForm(f => ({ ...f, class_name: e.target.value }))}
                      placeholder="10А"
                      className="w-full sm:w-1/3 px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">Предмет</label>
                      <input value={editForm.subject || ''} onChange={e => setEditForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Математика"
                        className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">Ведёт класс (классный руководитель)</label>
                      <input value={editForm.class_name || ''} onChange={e => setEditForm(f => ({ ...f, class_name: e.target.value }))}
                        placeholder="10А (если классный руководитель)"
                        className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">Статус</label>
                  <input value={editForm.status_text || ''} onChange={e => setEditForm(f => ({ ...f, status_text: e.target.value }))}
                    placeholder="Живу, учусь, не сдаюсь 🚀" maxLength={80}
                    className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all" />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-1.5">О себе</label>
                  <textarea value={editForm.bio || ''} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))}
                    rows={3} maxLength={400} placeholder="Расскажи немного о себе..."
                    className="w-full px-4 py-3 rounded-[1rem] bg-surface-container border border-outline-variant/30 text-sm focus:outline-none focus:border-primary transition-all resize-none" />
                </div>

                {/* Student-only fields */}
                {user.role === 'student' && (<>
                  {/* Favorite subjects */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-2">Любимые предметы</label>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(s => (
                        <button key={s} type="button" onClick={() => toggleFavSubject(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                            editForm.favorite_subjects?.includes(s)
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy toggles */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-3">Приватность</label>
                    <div className="flex flex-col gap-3">
                      {[
                        ['show_grades','Показывать оценки','grade'],
                        ['show_attendance','Показывать посещаемость','event_available'],
                        ['show_classmates','Показывать одноклассников','group'],
                      ].map(([key, label, icon]) => (
                        <label key={key} className="flex items-center gap-3 cursor-pointer group">
                          <div className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${editForm[key] ? 'bg-primary' : 'bg-surface-container-high'}`}
                            onClick={() => setEditForm(f => ({ ...f, [key]: !f[key] }))}>
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${editForm[key] ? 'left-[22px]' : 'left-0.5'}`} />
                          </div>
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">{icon}</span>
                          <span className="text-sm font-body text-on-surface">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>)}

                {/* Theme color — for all */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label block mb-2">Цвет профиля</label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map(({ color, label }) => (
                      <button key={color} type="button" title={label} onClick={() => setEditForm(f => ({ ...f, theme_color: color }))}
                        className={`w-8 h-8 rounded-full transition-all duration-200 ${editForm.theme_color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold text-sm uppercase tracking-widest hover:opacity-80 transition-all disabled:opacity-50 shadow-lg">
                    {saving ? 'Сохраняем...' : 'Сохранить'}
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-6 py-3 rounded-full bg-surface-container text-on-surface text-sm font-bold hover:bg-surface-container-high transition-colors">
                    Отмена
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── TABS — только для учеников ── */}
        {user.role === 'student' && (
          <div className="flex flex-wrap gap-2 mb-8">
            <TabBtn active={activeTab==='overview'} onClick={() => setActiveTab('overview')} icon="dashboard" label="Обзор" />
            <TabBtn active={activeTab==='grades'} onClick={() => setActiveTab('grades')} icon="grade" label="Оценки" />
            <TabBtn active={activeTab==='achievements'} onClick={() => setActiveTab('achievements')} icon="emoji_events" label="Достижения" />
            <TabBtn active={activeTab==='notes'} onClick={() => setActiveTab('notes')} icon="edit_note" label="Заметки" />
          </div>
        )}

        {/* ── TEACHER INFO VIEW ── */}
        {user.role !== 'student' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

            {/* Info card */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm space-y-6">
              <h2 className="font-headline text-xl font-bold tracking-tight">Информация об учителе</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">school</span>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Предмет</div>
                    <div className="text-base font-bold">{profile.subject || 'Не указан'}</div>
                  </div>
                </div>

                {profile.class_name && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">groups</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Классный руководитель</div>
                      <div className="text-base font-bold">{profile.class_name} класс</div>
                    </div>
                  </div>
                )}

                {profile.bio && (
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant mt-0.5">person</span>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">О себе</div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{profile.bio}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes card for teacher */}
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 border border-outline-variant/10 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-xl font-bold tracking-tight">Заметки</h2>
                <button onClick={() => setAddingNote(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface text-xs font-bold hover:bg-primary hover:text-on-primary transition-all">
                  <span className="material-symbols-outlined text-sm">add</span>
                  Новая
                </button>
              </div>
              {notes.length === 0 && !addingNote && (
                <p className="text-sm text-on-surface-variant">Нет заметок</p>
              )}
              <div className="space-y-3">
                {notes.slice(0, 5).map(note => (
                  <div key={note.id} style={{ backgroundColor: note.color }}
                    className="rounded-[1rem] p-4 relative">
                    <div className="font-bold text-sm mb-1">{note.title}</div>
                    <div className="text-xs text-on-surface-variant">{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Средний балл" value={overallAvg} sub="за все предметы" />
                {profile.show_attendance ? (
                  <StatCard label="Посещаемость" value={`${profile.attendance_pct || 0}%`} sub="в этом году" />
                ) : null}
                <StatCard label="Пропусков" value={profile.absences ?? 0} sub="уроков" accent />
                <StatCard label="Достижений" value={achievements.length} sub="получено" />
              </div>

              {/* Mini grade chart */}
              {subjectAvgs.length > 0 && (
                <div className="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 border border-outline-variant/10 shadow-sm mb-8">
                  <h3 className="font-headline text-lg font-bold tracking-tight mb-6">Успеваемость по предметам</h3>
                  <div className="space-y-3">
                    {subjectAvgs.map(({ subject, avg }) => (
                      <div key={subject} className="flex items-center gap-4">
                        <span className="text-xs font-bold text-on-surface-variant w-24 sm:w-32 truncate flex-shrink-0">{subject}</span>
                        <div className="flex-1 bg-surface-container rounded-full h-2.5 overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: themeColor }}
                            initial={{ width: 0 }} animate={{ width: `${(avg / 5) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }} />
                        </div>
                        <span className="text-sm font-black font-headline w-8 text-right" style={{ color: themeColor }}>{avg.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent achievements mini */}
              {achievements.length > 0 && (
                <div className="bg-surface-container-lowest rounded-[2rem] p-6 sm:p-8 border border-outline-variant/10 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-lg font-bold tracking-tight">Последние достижения</h3>
                    <button onClick={() => setActiveTab('achievements')} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                      Все →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {achievements.slice(0, 6).map(a => (
                      <div key={a.id} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/20">
                        <span className="text-xl">{a.badge_icon}</span>
                        <span className="text-xs font-bold text-on-surface">{a.badge_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── GRADES TAB ── */}
          {activeTab === 'grades' && (
            <motion.div key="grades" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {!profile.show_grades ? (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-4 block">lock</span>
                  <p className="font-body">Оценки скрыты в настройках приватности</p>
                </div>
              ) : gradeEntries.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-4 block">school</span>
                  <p>Оценок пока нет</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(grades.bySubject).map(([subject, gs]) => {
                    const avg = gs.reduce((s, g) => s + g.grade, 0) / gs.length;
                    return (
                      <motion.div key={subject} whileHover={{ y: -2 }}
                        className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-outline-variant/10 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-headline font-bold">{subject}</h4>
                          <span className="text-2xl font-black font-headline" style={{ color: themeColor }}>
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {gs.map(g => (
                            <span key={g.id}
                              className={`w-9 h-9 rounded-[0.6rem] flex items-center justify-center text-sm font-bold ${
                                g.grade >= 5 ? 'bg-green-100 text-green-700' :
                                g.grade >= 4 ? 'bg-blue-100 text-blue-700' :
                                g.grade >= 3 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                              {g.grade}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 bg-surface-container rounded-full h-1.5 overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ backgroundColor: themeColor }}
                            initial={{ width: 0 }} animate={{ width: `${(avg / 5) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ACHIEVEMENTS TAB ── */}
          {activeTab === 'achievements' && (
            <motion.div key="achievements" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ALL_BADGES.map(badge => {
                  const earned = achievements.find(a => a.badge_key === badge.key);
                  return (
                    <motion.div key={badge.key} whileHover={{ y: -3 }}
                      className={`rounded-[1.5rem] p-6 flex flex-col items-center text-center gap-3 border transition-all duration-300 ${
                        earned
                          ? 'bg-surface-container-lowest border-outline-variant/10 shadow-md'
                          : 'bg-surface-container border-transparent opacity-40 grayscale'
                      }`}>
                      <div className="text-5xl">{badge.icon}</div>
                      <div>
                        <div className="font-headline font-bold text-sm">{badge.name}</div>
                        <div className="text-xs text-on-surface-variant mt-1 font-body">{badge.desc}</div>
                      </div>
                      {earned && (
                        <span className="text-xs text-on-surface-variant font-label">
                          {new Date(earned.earned_at).toLocaleDateString('ru-RU')}
                        </span>
                      )}
                      {!earned && (
                        <span className="text-xs text-on-surface-variant font-label">Не получено</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Self-award demo badges */}
              <div className="mt-8 bg-surface-container-lowest rounded-[2rem] p-6 border border-outline-variant/10">
                <h3 className="font-headline font-bold mb-4">Получить достижение</h3>
                <div className="flex flex-wrap gap-3">
                  {ALL_BADGES.filter(b => !achievements.find(a => a.badge_key === b.key)).map(badge => (
                    <button key={badge.key}
                      onClick={async () => {
                        await apiRequest('/user/achievements/award', {
                          method: 'POST',
                          body: JSON.stringify({ badge_key: badge.key, badge_name: badge.name, badge_icon: badge.icon })
                        });
                        const a = await apiRequest('/user/achievements');
                        setAchievements(a);
                        showSuccess(`Получено: ${badge.name}!`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-primary hover:text-on-primary transition-all duration-200">
                      {badge.icon} {badge.name}
                    </button>
                  ))}
                  {ALL_BADGES.every(b => achievements.find(a => a.badge_key === b.key)) && (
                    <p className="text-sm text-on-surface-variant font-body">🎉 Все достижения получены!</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── NOTES TAB ── */}
          {activeTab === 'notes' && (
            <motion.div key="notes" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {/* Add note button */}
              <div className="mb-6">
                <button onClick={() => setAddingNote(v => !v)}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary text-sm font-bold hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-base">{addingNote ? 'close' : 'add'}</span>
                  {addingNote ? 'Отмена' : 'Новая заметка'}
                </button>
              </div>

              {/* New note form */}
              <AnimatePresence>
                {addingNote && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }} className="mb-6 overflow-hidden">
                    <div className="rounded-[1.5rem] p-6 border border-outline-variant/20 shadow-sm space-y-3"
                      style={{ backgroundColor: newNote.color }}>
                      <input value={newNote.title} onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))}
                        placeholder="Заголовок..."
                        className="w-full px-0 py-1 bg-transparent border-b border-black/10 text-sm font-bold focus:outline-none placeholder:text-black/30" />
                      <textarea value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
                        rows={4} placeholder="Содержание заметки..."
                        className="w-full px-0 py-1 bg-transparent text-sm focus:outline-none resize-none placeholder:text-black/30" />
                      <div className="flex items-center gap-3 pt-2">
                        <div className="flex gap-1.5">
                          {NOTE_COLORS.map(c => (
                            <button key={c} onClick={() => setNewNote(n => ({ ...n, color: c }))}
                              className={`w-6 h-6 rounded-full transition-all ${newNote.color === c ? 'ring-2 ring-offset-1 ring-black/30 scale-110' : ''}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <button onClick={handleAddNote}
                          className="ml-auto px-5 py-2 rounded-full bg-primary text-on-primary text-xs font-bold hover:opacity-80 transition-all">
                          Добавить
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes grid */}
              {notes.length === 0 ? (
                <div className="text-center py-16 text-on-surface-variant">
                  <span className="material-symbols-outlined text-5xl mb-4 block">edit_note</span>
                  <p className="font-body">Пока нет заметок. Создай первую!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map(note => (
                    <motion.div key={note.id} layout whileHover={{ y: -3 }}
                      className="rounded-[1.5rem] p-5 relative group shadow-sm"
                      style={{ backgroundColor: note.color }}>
                      {editingNote?.id === note.id ? (
                        <div className="space-y-2">
                          <input value={editingNote.title} onChange={e => setEditingNote(n => ({ ...n, title: e.target.value }))}
                            className="w-full bg-transparent border-b border-black/10 text-sm font-bold focus:outline-none" />
                          <textarea value={editingNote.content} onChange={e => setEditingNote(n => ({ ...n, content: e.target.value }))}
                            rows={4} className="w-full bg-transparent text-sm focus:outline-none resize-none" />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleUpdateNote(note.id)}
                              className="px-4 py-1.5 rounded-full text-xs font-bold bg-primary text-on-primary">Сохранить</button>
                            <button onClick={() => setEditingNote(null)}
                              className="px-4 py-1.5 rounded-full text-xs font-bold bg-black/10">Отмена</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h4 className="font-bold text-sm mb-2 font-headline">{note.title}</h4>
                          <p className="text-sm text-black/70 font-body leading-relaxed whitespace-pre-wrap">{note.content}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-black/40">{new Date(note.updated_at).toLocaleDateString('ru-RU')}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingNote({ id: note.id, title: note.title, content: note.content, color: note.color })}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 hover:bg-black/20">
                                <span className="material-symbols-outlined text-xs">edit</span>
                              </button>
                              <button onClick={() => handleDeleteNote(note.id)}
                                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/10 hover:bg-red-200 text-error">
                                <span className="material-symbols-outlined text-xs">delete</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
      <Footer />
    </motion.div>
  );
}
