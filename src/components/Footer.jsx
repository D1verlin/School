import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-surface border-t border-outline-variant/10 py-20 px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
                <div className="max-w-xs space-y-6">
                    <h3 className="text-xl font-headline font-extrabold tracking-tighter text-primary">Средняя школа №1</h3>
                    <p className="text-on-surface-variant text-sm leading-relaxed font-light">
                        Профессиональное образование с заботой о будущем каждого ученика. Мы создаем возможности для роста и развития.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 md:gap-24">
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Ресурсы</h4>
                        <div className="flex flex-col gap-4">
                            <Link to="/info#diary" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Электронный дневник</Link>
                            <Link to="/info#admission" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Правила приема</Link>
                            <Link to="/info#charter" className="text-sm text-on-surface-variant hover:text-primary transition-colors">Устав школы</Link>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Контакты</h4>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-on-surface-variant">Минск, ул. Чкалова, 3А</p>
                            <p className="text-sm text-on-surface-variant">+375 17 343-88-33</p>
                            <p className="text-sm text-on-surface-variant">school1@minsk.edu.by</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/10">
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest text-center">© 2024 Государственное учреждение образования «Средняя школа №1 г. Минска»</p>
            </div>
        </footer>
    );
};

export default Footer;
