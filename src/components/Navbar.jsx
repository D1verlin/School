import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    const isActive = (path) => location.pathname === path;
    const linkClasses = (path) => `font-['Manrope'] font-bold tracking-tight text-sm uppercase transition-colors duration-200 ease-in-out ${isActive(path) ? 'text-black dark:text-white border-b-2 border-black dark:border-white pb-1' : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'}`;
    const mobileLinkClasses = (path) => `block px-4 py-3 text-lg font-bold uppercase transition-colors duration-200 ${isActive(path) ? 'text-black bg-surface-container' : 'text-gray-600 hover:text-black hover:bg-surface-container-low'}`;

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    // Avatar or initials for nav
    const avatarSrc = user?.profile?.avatar_url
        ? (user.profile.avatar_url.startsWith('/uploads') ? `http://localhost:3001${user.profile.avatar_url}` : user.profile.avatar_url)
        : null;
    const initials = user?.profile
        ? `${user.profile.first_name?.[0] || ''}${user.profile.last_name?.[0] || ''}`
        : '?';
    const themeColor = user?.profile?.theme_color || '#000000';
    
    return (
        <nav className="w-full top-0 sticky z-50 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-outline-variant border-opacity-10 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center px-6 md:px-8 py-4 md:py-6 max-w-7xl mx-auto w-full">
                <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter text-black dark:text-white font-headline z-50 relative">
                    Средняя школа №1
                </Link>
                
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/" className={linkClasses('/')}>Главная</Link>
                    <Link to="/schedule" className={linkClasses('/schedule')}>Расписание</Link>
                    <Link to="/contacts" className={linkClasses('/contacts')}>Контакты</Link>
                </div>
                
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        /* USER MENU */
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(v => !v)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20"
                            >
                                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold"
                                    style={{ backgroundColor: themeColor + '22', color: themeColor }}>
                                    {avatarSrc
                                        ? <img src={avatarSrc} alt="Аватар" className="w-full h-full object-cover" />
                                        : initials
                                    }
                                </div>
                                <span className="text-sm font-bold font-headline text-on-surface">
                                    {user.profile?.first_name || 'Профиль'}
                                </span>
                                <span className="material-symbols-outlined text-sm text-on-surface-variant">
                                    {showUserMenu ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-surface-container-lowest rounded-[1.2rem] shadow-xl border border-outline-variant/10 overflow-hidden z-50">
                                    <div className="px-4 py-3 border-b border-outline-variant/10">
                                        <p className="text-xs font-bold text-on-surface truncate">{user.profile?.first_name} {user.profile?.last_name}</p>
                                        <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                                    </div>
                                    {(user.role === 'teacher' || user.role === 'admin') && (
                                        <Link to="/teacher" onClick={() => setShowUserMenu(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary hover:bg-surface-container transition-colors border-b border-outline-variant/10">
                                            <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                                            Панель учителя
                                        </Link>
                                    )}
                                    <Link to="/profile" onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-surface-container transition-colors">
                                        <span className="material-symbols-outlined text-base text-on-surface-variant">person</span>
                                        Мой профиль
                                    </Link>
                                    <button onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">logout</span>
                                        Выйти
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* LOGIN BUTTON */
                        <Link to="/login"
                            className="inline-flex items-center gap-2 bg-primary text-on-primary px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:opacity-70 transition-opacity duration-200">
                            <span className="material-symbols-outlined text-base">login</span>
                            Войти
                        </Link>
                    )}
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

            {/* Mobile menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-outline-variant border-opacity-10 shadow-lg origin-top transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                <div className="flex flex-col py-4 px-2 space-y-1">
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/')}>Главная</Link>
                    <Link to="/schedule" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/schedule')}>Расписание</Link>
                    <Link to="/contacts" onClick={() => setIsMobileMenuOpen(false)} className={mobileLinkClasses('/contacts')}>Контакты</Link>
                    <div className="px-4 pt-4 pb-2">
                        {user ? (
                            <div className="space-y-2">
                                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-2 w-full text-center bg-surface-container px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors">
                                    <span className="material-symbols-outlined text-base">person</span>
                                    Профиль
                                </Link>
                                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                                    className="w-full text-center bg-error/10 text-error px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest">
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}
                                className="block text-center w-full bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity duration-200">
                                Войти
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
