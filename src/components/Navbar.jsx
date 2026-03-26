import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const isActive = (path) => location.pathname === path;
    const linkClasses = (path) => `font-['Manrope'] font-bold tracking-tight text-sm uppercase transition-colors duration-200 ease-in-out ${isActive(path) ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-1' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`;
    const mobileLinkClasses = (path) => `block px-4 py-3 text-lg font-bold uppercase transition-colors duration-200 ${isActive(path) ? 'text-black bg-surface-container' : 'text-gray-600 hover:text-black hover:bg-surface-container-low'}`;
    
    return (
        <nav className="w-full top-0 sticky z-50 bg-[#f9f9f9] dark:bg-black border-b border-outline-variant border-opacity-10 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center px-6 md:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full">
                <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-black dark:text-white font-headline z-50 relative">
                    Средняя школа №1
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className={linkClasses('/')}>Главная</Link>
                    <Link to="/schedule" className={linkClasses('/schedule')}>Расписание</Link>
                    <Link to="/contacts" className={linkClasses('/contacts')}>Контакты</Link>
                </div>
                
                <div className="hidden md:block">
                    <Link to="/contacts" className="inline-block bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity duration-200">
                        Приемная комиссия
                    </Link>
                </div>

                <button 
                    className="md:hidden z-50 relative p-2 -mr-2 text-primary focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <span className="material-symbols-outlined text-3xl">
                        {isMobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>
            </div>

            <div className={`md:hidden absolute top-full left-0 w-full bg-[#f9f9f9] border-b border-outline-variant border-opacity-10 shadow-lg origin-top transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="flex flex-col py-4 px-2 space-y-1">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/')}>Главная</Link>
                    <Link to="/schedule" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/schedule')}>Расписание</Link>
                    <Link to="/contacts" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/contacts')}>Контакты</Link>
                    <div className="px-4 pt-4 pb-2">
                        <Link to="/contacts" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200">
                            Приемная комиссия
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
