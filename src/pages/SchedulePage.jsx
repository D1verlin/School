import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SchedulePage = () => {
    const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
    const levels = ["Все классы", "1 класс", "2 класс", "3 класс", "4 класс", "5 класс", "6 класс", "7 класс", "8 класс", "9 класс", "10 класс", "11 класс"];

    const [activeFilter, setActiveFilter] = useState("10 класс");
    const [activeTerm, setActiveTerm] = useState("1 Четверть");

    const timeSlots = [
        { start: "08:30", end: "09:15" },
        { start: "09:25", end: "10:10" },
        { start: "10:30", end: "11:15" },
        { start: "11:35", end: "12:20" },
        { start: "12:40", end: "13:25" }
    ];

    const scheduleData = useMemo(() => {
        const data = [];
        const subjects1_4 = ["Математика", "Русский язык", "Белорусский язык", "Чтение", "Человек и мир", "ИЗО", "Физкультура", "Музыка", "Труд"];
        const subjects5_9 = ["Математика", "Русский язык", "Белорусский язык", "Литература", "История", "География", "Биология", "Английский", "Информатика", "Физкультура", "Физика", "Химия", "Труд"];
        const subjects10_11 = ["Алгебра", "Геометрия", "Русский язык", "Белорусский язык", "Литература", "История Беларуси", "Физика", "Астрономия", "Химия", "Биология", "Английский", "Информатика", "Обществоведение", "Физкультура", "Допризывная подготовка"];

        const teachers = ["Смирнова А.И.", "Иванова М.П.", "Козлов И.А.", "Петров П.П.", "Сидоров С.С.", "Васильева М.И.", "Николаев Н.Н.", "Кузнецова Е.В.", "Степанов В.Д.", "Морозова Н.Н."];

        const getSubjects = (grade) => {
            if (grade <= 4) return subjects1_4;
            if (grade <= 9) return subjects5_9;
            return subjects10_11;
        };

        const getRandomItem = (arr, seed) => arr[Math.abs(seed) % arr.length];

        ['1 Четверть', '2 Четверть'].forEach((term, termIndex) => {
            levels.filter(l => l !== "Все классы").forEach((levelStr, levelIndex) => {
                const grade = parseInt(levelStr);
                const subjects = getSubjects(grade);

                days.forEach((day, dayIndex) => {
                    // 4 lessons on certain days for younger grades, else 5
                    const numLessons = grade < 5 && dayIndex % 2 === 0 ? 4 : 5;

                    for (let i = 0; i < numLessons; i++) {
                        const time = timeSlots[i].start;
                        // Use a deterministic seed to generate a varied schedule
                        const seed = termIndex * 131 + levelIndex * 17 + dayIndex * 7 + i * 3;

                        let type = "Урок";
                        if (seed % 10 === 0) type = "Лабораторная";
                        else if (seed % 8 === 0) type = "Практика";

                        data.push({
                            term,
                            classLevel: levelStr,
                            day,
                            time,
                            subject: getRandomItem(subjects, seed),
                            teacher: getRandomItem(teachers, seed + 1),
                            type
                        });
                    }
                });
            });
        });
        return data;
    }, []);

    const getLessons = (day, time) => {
        return scheduleData.filter(item =>
            item.term === activeTerm &&
            item.day === day &&
            item.time === time &&
            (activeFilter === "Все классы" || item.classLevel === activeFilter)
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Navbar />
            <main className="max-w-7xl mx-auto px-8 pt-16 pb-24">
                <motion.header initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-20">
                    <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-primary mb-6 leading-[0.9]">
                        Расписание <br />занятий.
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <p className="max-w-xl text-on-surface-variant text-lg leading-relaxed">
                            Удобный просмотр расписания для каждого класса. Выберите нужный класс, чтобы увидеть подробную информацию на текущую четверть.
                        </p>
                        <div className="flex items-center gap-2 bg-surface-container-low p-1.5 rounded-full">
                            <button
                                onClick={() => setActiveTerm("1 Четверть")}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTerm === "1 Четверть" ? 'bg-primary text-on-primary shadow-sm scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                1 Четверть
                            </button>
                            <button
                                onClick={() => setActiveTerm("2 Четверть")}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeTerm === "2 Четверть" ? 'bg-primary text-on-primary shadow-sm scale-105' : 'text-on-surface-variant hover:bg-surface-container'}`}
                            >
                                2 Четверть
                            </button>
                        </div>
                    </div>
                </motion.header>

                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-12 flex justify-center">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mr-4">Класс:</span>
                        {levels.map((level, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveFilter(level)}
                                className={`px-5 py-2 rounded-full border transition-all duration-300 text-sm font-medium ${activeFilter === level ? 'bg-primary text-on-primary border-primary scale-105 shadow hover:opacity-90' : 'border-outline-variant border-opacity-20 hover:bg-surface-container-high'}`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="bg-surface-container-lowest rounded-lg overflow-hidden border border-outline-variant border-opacity-10 shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-surface-container-low">
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant w-[150px]">Время</th>
                                    {days.map(day => <th key={day} className="px-8 py-6 text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer w-[170px]">{day}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container">
                                {timeSlots.map((slot, index) => (
                                    <tr key={index} className="transition-colors hover:bg-surface-container-low/50 duration-300">
                                        <td className="px-8 py-8 align-top">
                                            <span className="text-xl font-bold block">{slot.start}</span>
                                            <span className="text-xs text-on-surface-variant font-medium uppercase tracking-tighter">{slot.end}</span>
                                        </td>
                                        {days.map(day => {
                                            const lessons = getLessons(day, slot.start);
                                            return (
                                                <td key={day} className="px-4 py-4 align-top border-l border-surface-container/50">
                                                    {lessons.length > 0 ? (
                                                        <div className="space-y-4">
                                                            {lessons.map((lesson, i) => (
                                                                <div key={i} className="group cursor-pointer p-4 rounded-lg hover:bg-surface-container-low transition-colors border border-transparent hover:border-outline-variant/10">
                                                                    <div className="mb-3 flex flex-wrap gap-2">
                                                                        <span className="bg-surface-container-highest px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{lesson.type}</span>
                                                                        {activeFilter === "Все классы" && (
                                                                            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{lesson.classLevel}</span>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="text-base font-bold mb-1 group-hover:underline underline-offset-4 leading-tight">{lesson.subject}</h3>
                                                                    <p className="text-xs text-on-surface-variant opacity-80">{lesson.teacher}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center min-h-[100px] opacity-40 italic text-xs text-on-surface-variant">
                                                            Нет занятий
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>
            <Footer />
        </motion.div>
    );
};

export default SchedulePage;
