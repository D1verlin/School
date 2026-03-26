import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage = () => {
    const [loaded, setLoaded] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const dataPoints = [40, 60, 85, 70, 90, 55, 75];

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Navbar />
            <main className="max-w-7xl mx-auto px-8 pt-12">
                <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="mb-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="max-w-2xl">
                            <span className="font-label text-xs tracking-widest uppercase text-on-surface-variant mb-4 block">Обзор студента</span>
                            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-none mb-6">
                                Иван <br/>Иванов
                            </h1>
                            <p className="font-body text-lg text-on-surface-variant leading-relaxed opacity-80">
                                Ученик 10 "А" класса. Активный участник школьных олимпиад по математике и спортивных соревнований.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="w-48 h-48 rounded-lg overflow-hidden bg-surface-container">
                                <img alt="Портрет" className="w-full h-full object-cover grayscale transition-all duration-700 hover:scale-105 hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLqf6pSzfcpiEnpdafREPUQRZrvdGnG6lxeeVvy-hBJjcEXeWYSu_-YcV-J9EuRjZbdVkKL_zs6c_xhjUhYs7p-akQXyKPx5g7WJqmjJ0k7Oj4_4UbNgKyFXpiZWflnI5A7xF1cZOgVz_e3kdk7KEy_lcZmhWF3b9xiQym-2Un10HStQegun5YnITLBC6IvUybG-A4snq2Y2tKfbYGwlbkXBi4gyWjrep6b0ZdFF1kNhPkf5GZybw4le-QPhCZt4OXx77oLwCCkRs"/>
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold tracking-tighter uppercase shadow-lg">Выпуск 2026</div>
                        </div>
                    </div>
                </motion.section>

                <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-20">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="md:col-span-8 bg-surface-container-lowest rounded-lg p-10 flex flex-col justify-between min-h-[400px] shadow-sm">
                        <div className="flex justify-between items-start">
                            <div><h3 className="font-headline text-2xl font-bold tracking-tight mb-2">Успеваемость</h3></div>
                            <div className="bg-surface-container-high px-4 py-2 rounded-full shadow-sm hover:shadow transition-shadow"><span className="font-label text-xs font-bold uppercase tracking-widest">Средний балл: 8.5</span></div>
                        </div>
                        <div className="flex items-end gap-2 h-48 mt-8 border-b border-outline-variant/20 pb-1">
                            {dataPoints.map((h, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 rounded-t-lg transition-all duration-[1000ms] ease-out hover:bg-primary cursor-pointer ${i === 2 ? 'bg-primary' : 'bg-surface-container'}`} 
                                    style={{ height: loaded ? `${h}%` : '0%' }}
                                    title={`${h}%`}
                                ></div>
                            ))}
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="md:col-span-4 flex flex-col gap-6">
                        <div className="flex-1 bg-surface-container rounded-lg p-8 flex flex-col justify-center transition-all hover:-translate-y-1 hover:shadow-lg">
                            <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2">Посещаемость</span>
                            <div className="font-headline text-5xl font-black tracking-tighter">
                                {loaded ? '98.4%' : '0%'}
                            </div>
                        </div>
                        <div className="flex-1 bg-primary text-on-primary rounded-lg p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                            <span className="font-label text-xs uppercase tracking-widest opacity-60 mb-2">Пропусков</span>
                            <div className="font-headline text-5xl font-black tracking-tighter">
                                {loaded ? '12' : '0'}
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </motion.div>
    );
};

export default ProfilePage;
