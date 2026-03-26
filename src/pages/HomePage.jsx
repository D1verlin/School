import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import schoolImg from '../assets/XXXL.webp';

const HomePage = () => {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-body"
        >
            <Navbar />
            <main>
                <section className="relative px-8 pt-20 pb-32 max-w-7xl mx-auto overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-7 space-y-8"
                        >
                            <motion.div variants={fadeUpVariants} className="inline-flex items-center px-4 py-2 bg-surface-container-highest rounded-full">
                                <span className="text-xs font-bold font-headline uppercase tracking-widest text-primary">Осн. 1985</span>
                            </motion.div>
                            <motion.h1 variants={fadeUpVariants} className="text-5xl sm:text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-[0.9] text-primary">
                                Качественное <br className="hidden md:block" /> <span className="text-outline">образование</span>.
                            </motion.h1>
                            <motion.p variants={fadeUpVariants} className="text-lg md:text-xl text-on-surface-variant max-w-lg leading-relaxed font-light">
                                Мы воспитываем новое поколение мыслящих, ответственных и творческих людей, готовых к вызовам современного мира.
                            </motion.p>
                            <motion.div variants={fadeUpVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/contacts" className="text-center bg-primary text-on-primary px-10 py-5 rounded-full font-bold text-lg hover:bg-primary-fixed transition-all duration-300 transform hover:-translate-y-1 shadow-lg shadow-primary/20">
                                    Приемная комиссия
                                </Link>
                                <Link to="/schedule" className="text-center bg-surface-container-high text-primary px-10 py-5 rounded-full font-bold text-lg hover:bg-surface-container-highest transition-all duration-300 transform hover:-translate-y-1">
                                    Расписание
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            className="lg:col-span-5 relative"
                        >
                            <div className="aspect-[4/5] rounded-lg overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 bg-surface-container shadow-2xl">
                                <img alt="Академическая архитектура" className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000" src="https://r2.diverlin.ru/XXXL.webp" />
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="absolute -bottom-8 -left-8 bg-surface-container-lowest p-8 rounded-lg shadow-xl max-w-[240px] hidden md:block border border-outline-variant/10"
                            >
                                <span className="material-symbols-outlined text-primary text-4xl mb-4">auto_awesome</span>
                                <p className="text-sm font-headline font-bold leading-tight">Высокие стандарты обучения и всестороннее развитие учащихся</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section className="bg-surface-container-low py-24 px-8 overflow-hidden">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                        className="max-w-7xl mx-auto"
                    >
                        <motion.div variants={fadeUpVariants} className="mb-16 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary mb-4">Наши преимущества</h2>
                            <p className="text-on-surface-variant text-lg max-w-2xl">Инновационный подход к обучению каждого ученика, направленный на всестороннее развитие.</p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: "menu_book",
                                    title: "Современные методики",
                                    desc: "Интерактивные технологии, цифровые лаборатории и индивидуальный подход обеспечивают глубокое погружение и максимальное вовлечение каждого ученика."
                                },
                                {
                                    icon: "diversity_3",
                                    title: "Опытные педагоги",
                                    desc: "Наши учителя — педагоги высшей категории, победители республиканских конкурсов, которые с душой и заботой относятся к своему делу."
                                },
                                {
                                    icon: "sports_baseball",
                                    title: "Спортивная база",
                                    desc: "Новейший стадион с современными беговыми дорожками, воркаут-площадками и бассейном для физического развития и укрепления здоровья."
                                }
                            ].map((adv, index) => (
                                <motion.div key={index} variants={fadeUpVariants} className="bg-surface-container-lowest p-10 rounded-xl flex flex-col justify-between h-80 group hover:bg-primary hover:text-white transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 border border-outline-variant/5">
                                    <div className="space-y-4">
                                        <span className="material-symbols-outlined text-4xl group-hover:text-white text-primary transition-colors duration-300">{adv.icon}</span>
                                        <h3 className="text-2xl font-headline font-bold w-3/4">{adv.title}</h3>
                                    </div>
                                    <p className="text-on-surface-variant group-hover:text-surface-container text-sm leading-relaxed transition-colors duration-300">{adv.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </motion.div>
    );
};

export default HomePage;
