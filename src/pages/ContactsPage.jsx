import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactsPage = () => {
    const [submitted, setSubmitted] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative min-h-screen font-body text-on-surface">
            <Navbar />

            <div className="absolute top-0 left-0 w-full h-[600px] z-0 overflow-hidden pointer-events-none">
                <img
                    src="src/assets/XXXL.webp"
                    alt="school"
                    className="w-full h-full object-cover grayscale opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface/40 to-surface"></div>
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-32">
                <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24 md:mb-32 items-end">
                    <div className="md:col-span-8">
                        <span className="font-headline font-extrabold text-sm uppercase tracking-widest text-secondary mb-4 block">Свяжитесь с нами</span>
                        <h1 className="font-headline font-extrabold text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tighter text-primary leading-[0.85]">
                            Свяжитесь с <br /> приемной комиссией.
                        </h1>
                    </div>
                    <div className="md:col-span-4 md:pl-8 pb-4">
                        <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed max-w-sm font-light">Мы всегда рады ответить на ваши вопросы и помочь с обучением.</p>
                    </div>
                </motion.section>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    <div className="lg:col-span-7 bg-surface-container-lowest p-8 md:p-12 rounded-lg shadow-[0_20px_40px_rgba(0,0,0,0.04)]">
                        {submitted ? (
                            <div className="py-20 text-center animate-pulse">
                                <span className="material-symbols-outlined text-6xl text-primary mb-4">check_circle</span>
                                <h3 className="text-2xl font-bold">Сообщение отправлено!</h3>
                            </div>
                        ) : (
                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant ml-4">ФИО</label>
                                        <input className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary rounded-md px-6 py-4 outline-none transition-shadow" placeholder="Иван Иванов" type="text" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant ml-4">Почта</label>
                                        <input className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary rounded-md px-6 py-4 outline-none transition-shadow" placeholder="ivan@example.com" type="email" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant ml-4">Тема</label>
                                    <select className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary rounded-md px-6 py-4 outline-none appearance-none transition-shadow cursor-pointer">
                                        <option>Прием и зачисление</option>
                                        <option>Доступ к электронному дневнику</option>
                                        <option>Общие вопросы</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="font-label font-semibold text-xs uppercase tracking-wider text-on-surface-variant ml-4">Сообщение</label>
                                    <textarea className="w-full bg-surface-container-lowest border-0 ring-1 ring-outline-variant/15 focus:ring-2 focus:ring-primary rounded-md px-6 py-4 outline-none resize-none transition-shadow" placeholder="Чем мы можем вам помочь?" rows="6"></textarea>
                                </div>
                                <button className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-full font-headline font-bold text-lg hover:bg-primary-fixed transition-colors duration-300 shadow-xl shadow-black/5 hover:-translate-y-0.5" type="submit">
                                    Отправить сообщение
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-surface-container p-10 rounded-lg space-y-12">
                            <h3 className="font-headline font-extrabold text-2xl mb-8 tracking-tight">Кампус</h3>
                            <div className="space-y-8">
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary">location_on</span>
                                    <div><p className="font-bold text-sm uppercase tracking-tighter">Адрес</p><p className="text-on-surface-variant">Минск, ул. Чкалова, 3А</p></div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <span className="material-symbols-outlined text-primary">call</span>
                                    <div><p className="font-bold text-sm uppercase tracking-tighter">Телефон</p><p className="text-on-surface-variant">+375 17 343-88-33</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="relative rounded-lg overflow-hidden h-[300px] bg-surface-container-high border-0 ring-1 ring-outline-variant/10">
                            <iframe src="https://yandex.by/map-widget/v1/org/srednyaya_shkola_1_imeni_v_p_chkalova/67255625982/?ll=27.536059%2C53.879976&z=16" className="w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" allowFullScreen="" loading="lazy"></iframe>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </motion.div>
    );
};

export default ContactsPage;
