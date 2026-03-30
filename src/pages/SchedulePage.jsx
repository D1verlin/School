import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
const DAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];

const TYPE_BY_SUBJECT = {
  'Физкультура': 'Практика',
  'Химия': 'Лаборатория',
  'Биология': 'Лаборатория',
  'Информатика': 'Практика',
};

export default function SchedulePage() {
  const { user, apiRequest } = useAuth();

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState({});
  const [activeClass, setActiveClass] = useState('');
  const [activeDay, setActiveDay] = useState(DAYS[new Date().getDay() - 1] || DAYS[0]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null); // { day, slot, lesson }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [user]);

  const loadSchedule = () => {
    setLoading(true);
    fetch('/api/schedule')
      .then(r => r.json())
      .then(data => {
        setClasses(data.classes || []);
        setSchedule(data.schedule || {});
        setTimeSlots(data.timeSlots || []);
        setSubjectsByGrade(data.subjectsByGrade || {});

        if (!activeClass) {
          const defaultClass =
            (user?.profile?.class_name && data.classes.includes(user.profile.class_name))
              ? user.profile.class_name
              : data.classes[0] || '';
          setActiveClass(defaultClass);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.target);
      const data = {
        class_name: activeClass,
        day_of_week: editingLesson.day,
        lesson_index: editingLesson.slot,
        subject: formData.get('subject'),
        teacher_name: formData.get('teacher'),
        room: formData.get('room')
      };

      await apiRequest('/api/schedule/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      setEditingLesson(null);
      loadSchedule(); // Перезагружаем данные
    } catch (err) {
      alert('Ошибка при сохранении: ' + (err.message || 'Неизвестная ошибка'));
    } finally {
      setSaving(false);
    }
  };

  const gradeGroups = {};
  classes.forEach(cls => {
    const grade = cls.replace(/[^0-9]/g, '');
    if (!gradeGroups[grade]) gradeGroups[grade] = [];
    gradeGroups[grade].push(cls);
  });

  const currentDayLessons = (activeClass && schedule[activeClass])
    ? schedule[activeClass][activeDay] || []
    : [];

  // Создаем массив из всех возможных слотов для текущего дня
  const allSlots = timeSlots.map((time, index) => {
    const existingLesson = currentDayLessons.find(l => l.slot === index);
    return {
      slot: index,
      time,
      lesson: existingLesson || null
    };
  });

  const today = DAYS[new Date().getDay() - 1];
  const isTeacher = user?.role === 'teacher';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-24">

        <motion.header initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }} className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-headline text-5xl sm:text-7xl font-extrabold tracking-tighter text-primary mb-4 leading-[0.9]">
              Расписание<br />занятий.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Расписание сформировано на основе актуальных данных школы.
              {user?.profile?.class_name && (
                <span className="font-bold text-primary"> Ваш класс: {user.profile.class_name}</span>
              )}
            </p>
          </div>

          {isTeacher && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
                isEditMode 
                ? 'bg-error text-on-error shadow-lg shadow-error/20' 
                : 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {isEditMode ? 'close' : 'edit_calendar'}
              </span>
              {isEditMode ? 'Выйти из режима правки' : 'Редактировать'}
            </button>
          )}
        </motion.header>

        {loading ? (
          <div className="flex justify-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} className="mb-10">
              <div className="flex flex-col gap-4">
                {Object.entries(gradeGroups).map(([grade, clsArr]) => (
                  <div key={grade} className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant w-16 flex-shrink-0">
                      {grade} кл.
                    </span>
                    {clsArr.map(cls => (
                      <button key={cls} onClick={() => setActiveClass(cls)}
                        className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all duration-200 ${
                          activeClass === cls
                            ? 'bg-primary text-on-primary border-primary shadow'
                            : 'border-outline-variant/30 text-on-surface hover:bg-surface-container-high'
                        } ${cls === user?.profile?.class_name ? 'ring-2 ring-primary/30' : ''}`}>
                        {cls}
                        {cls === user?.profile?.class_name && (
                          <span className="ml-1 text-[10px] opacity-60">мой</span>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.section>

            <AnimatePresence mode="wait">
              {activeClass && (
                <motion.section key={activeClass} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="font-headline text-2xl font-bold tracking-tight">{activeClass} класс</h2>
                    <span className="px-3 py-1 rounded-full bg-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                      {isEditMode ? 'Режим редактирования' : 'Текущее расписание'}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-6 flex-wrap">
                    {DAYS.map((day, i) => (
                      <button key={day} onClick={() => setActiveDay(day)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                          activeDay === day
                            ? 'bg-primary text-on-primary shadow'
                            : day === today
                              ? 'bg-surface-container-high text-primary border border-primary/20'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                        }`}>
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{DAYS_SHORT[i]}</span>
                        {day === today && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/10 shadow-sm overflow-hidden">
                    {allSlots.length === 0 ? (
                      <div className="py-20 text-center text-on-surface-variant">
                        <span className="material-symbols-outlined text-5xl block mb-3 opacity-40">event_busy</span>
                        <p className="text-sm">Нет данных о слотах времени</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-outline-variant/5">
                        {allSlots.map(({ slot, time, lesson }, i) => {
                          const lessonType = lesson ? (TYPE_BY_SUBJECT[lesson.subject] || 'Урок') : null;
                          
                          return (
                            <motion.div key={slot}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.25 }}
                              className={`flex items-stretch gap-0 hover:bg-surface-container/40 transition-colors group ${
                                isEditMode ? 'cursor-pointer' : ''
                              }`}
                              onClick={() => isEditMode && setEditingLesson({ day: activeDay, slot, lesson })}
                            >
                              <div className="flex flex-col items-center justify-center px-6 py-5 min-w-[90px] text-center border-r border-outline-variant/10 bg-surface-container/30">
                                <span className="font-headline text-lg font-black leading-none">{time.start}</span>
                                <span className="text-xs text-on-surface-variant mt-0.5">{time.end}</span>
                                <span className="text-[10px] font-bold text-on-surface-variant mt-2 opacity-60">{slot + 1} ур.</span>
                              </div>

                              <div className="flex flex-1 items-center gap-4 px-6 py-5 relative">
                                {lesson ? (
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-surface-container text-on-surface-variant">
                                        {lessonType}
                                      </span>
                                      {lesson.room && (
                                         <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                                          каб. {lesson.room}
                                        </span>
                                      )}
                                    </div>
                                    <h3 className="font-bold text-base group-hover:text-primary transition-colors leading-tight">
                                      {lesson.subject}
                                    </h3>
                                    {lesson.teacher && (
                                      <p className="text-xs text-on-surface-variant mt-0.5">{lesson.teacher}</p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex-1 text-on-surface-variant/40 italic text-sm">
                                    {isEditMode ? 'Нажмите, чтобы добавить урок' : 'Окно'}
                                  </div>
                                )}

                                {isEditMode && (
                                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-primary">edit</span>
                                  </div>
                                )}

                                {!isEditMode && lesson && (
                                  <div className="text-right hidden sm:block">
                                    <div className="text-xs text-on-surface-variant font-bold">
                                      {time.start} - {time.end}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 text-xs text-on-surface-variant text-right">
                    Всего слотов: {timeSlots.length} | Уроков: {currentDayLessons.length}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Modal for editing */}
      <AnimatePresence>
        {editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingLesson(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface-container-high rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/20"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-headline text-2xl font-bold tracking-tight">Правка урока</h3>
                  <button onClick={() => setEditingLesson(null)} className="p-2 hover:bg-surface-container-highest rounded-full transition-colors">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="mb-6 p-4 bg-surface-container rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                    {editingLesson.slot + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">{editingLesson.day}</div>
                    <div className="text-sm font-bold opacity-60">Класс: {activeClass}</div>
                  </div>
                </div>

                <form onSubmit={handleSaveLesson} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Предмет</label>
                    <select
                      name="subject"
                      defaultValue={editingLesson.lesson?.subject || ''}
                      className="w-full px-5 py-3.5 rounded-2xl bg-surface-container-highest border border-outline-variant/30 focus:border-primary outline-none transition-all font-bold"
                    >
                      <option value="">Выберите предмет</option>
                      {(subjectsByGrade[activeClass.replace(/[^0-9]/g, '')] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="Другой">Другой...</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Преподаватель</label>
                    <input
                      name="teacher"
                      type="text"
                      placeholder="ФИО преподавателя"
                      defaultValue={editingLesson.lesson?.teacher || ''}
                      className="w-full px-5 py-3.5 rounded-2xl bg-surface-container-highest border border-outline-variant/30 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant ml-2">Кабинет</label>
                    <input
                      name="room"
                      type="text"
                      placeholder="Номер кабинета"
                      defaultValue={editingLesson.lesson?.room || ''}
                      className="w-full px-5 py-3.5 rounded-2xl bg-surface-container-highest border border-outline-variant/30 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 px-6 py-4 bg-primary text-on-primary rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingLesson(null)}
                      className="px-6 py-4 bg-surface-container-highest text-on-surface rounded-2xl font-bold hover:bg-surface-container-highest/80 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </motion.div>
  );
}
