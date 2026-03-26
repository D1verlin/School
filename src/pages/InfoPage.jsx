import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InfoPage = () => {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-6 sm:px-8 py-16 md:py-32">
                <motion.header initial="hidden" animate="visible" variants={fadeUpVariants} className="mb-20 md:mb-32">
                    <span className="font-headline font-extrabold text-sm uppercase tracking-widest text-secondary mb-4 block">Документы и ресурсы</span>
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-headline font-extrabold text-primary mb-8 tracking-tighter leading-[0.85]">
                        Информация.
                    </h1>
                    <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-2xl font-light">
                        Важные ресурсы, доступ к электронным сервисам школы, а также юридическая и организационная информация для учеников и их родителей.
                    </p>
                </motion.header>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl space-y-12 md:space-y-16">
                    <motion.section variants={fadeUpVariants} id="diary" className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant border-opacity-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                            <span className="material-symbols-outlined text-4xl text-primary bg-primary/10 p-4 rounded-2xl w-fit">import_contacts</span>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">Электронный дневник</h2>
                        </div>
                        <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-10 opacity-90">
                            Следите за успеваемостью, расписанием занятий и комментариями учителей в режиме реального времени. Доступ осуществляется через сервис НАЦИОНАЛЬНОГО ОБРАЗОВАТЕЛЬНОГО ПОРТАЛА. В случае потери пароля обратитесь к классному руководителю.
                        </p>
                        <button className="w-full sm:w-auto bg-primary text-on-primary px-10 py-5 rounded-full font-bold text-sm tracking-widest uppercase hover:bg-primary-fixed transition-all shadow-lg shadow-primary/10 transform hover:scale-105 active:scale-95">
                            Перейти на портал
                        </button>
                    </motion.section>

                    <motion.section variants={fadeUpVariants} id="admission" className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant border-opacity-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                            <span className="material-symbols-outlined text-4xl text-primary bg-primary/10 p-4 rounded-2xl w-fit">assignment_ind</span>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">Правила приема</h2>
                        </div>
                        <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 opacity-90">
                            Прием документов для зачисления осуществляется ежегодно <strong>с 12 июня по 15 августа</strong> согласно утвержденному графику.
                        </p>
                        <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                            <span className="w-8 h-[2px] bg-primary"></span>
                            Необходимые документы:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {[
                                "Заявление на имя директора",
                                "Медицинская справка о здоровье",
                                "Копия свидетельства о рождении",
                                "Паспорт родителя (удостоверение личности)"
                            ].map((doc, i) => (
                                <li key={i} className="flex gap-4 text-on-surface-variant items-start">
                                    <span className="material-symbols-outlined text-primary text-xl flex-shrink-0">check_circle</span>
                                    <span className="text-sm font-medium leading-snug">{doc}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.section>

                    <motion.section variants={fadeUpVariants} id="charter" className="bg-surface-container-lowest rounded-2xl p-8 md:p-12 border border-outline-variant border-opacity-10 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                            <span className="material-symbols-outlined text-4xl text-primary bg-primary/10 p-4 rounded-2xl w-fit">gavel</span>
                            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">Устав школы</h2>
                        </div>
                        <div className="space-y-6 text-on-surface-variant text-base md:text-lg leading-relaxed opacity-90">
                            <p>
                                Деятельность Государственного учреждения образования «Средняя школа №1 г. Минска» основана на Кодексе Республики Беларусь об образовании.
                            </p>
                            <p>
                                Главная задача школы — формирование высокообразованной и высоконравственной личности, готовой к труду и общественно-полезной деятельности.
                            </p>
                        </div>
                    </motion.section>
                </motion.div>
            </main>
            <Footer />
        </motion.div>
    );
};

export default InfoPage;
