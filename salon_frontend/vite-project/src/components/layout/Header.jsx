import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ROLE_LABELS } from '../../config/constants';
import {
    HiOutlineBell,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineSearch,
    HiOutlineLogout,
    HiOutlineUser,
    HiOutlineCog,
    HiOutlineMenu,
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMobileMenuToggle }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const profileRef = useRef(null);

    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) {
                setProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left - Mobile menu + Search */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMobileMenuToggle}
                        className="lg:hidden p-2 rounded-lg text-text-secondary hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                    >
                        <HiOutlineMenu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <div className="hidden sm:flex items-center relative">
                        <HiOutlineSearch className="absolute left-3 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-64 pl-10 pr-4 py-2 rounded-xl text-sm bg-gray-100 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-white/10 text-text-primary dark:text-white placeholder:text-gray-400 transition-all duration-200 outline-none"
                        />
                        <kbd className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-200 dark:bg-white/10 text-gray-400">
                            ⌘K
                        </kbd>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                    >
                        {isDark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer">
                        <HiOutlineBell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* Profile Dropdown */}
                    <div ref={profileRef} className="relative">
                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-text-primary dark:text-white leading-tight">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-[10px] text-text-secondary dark:text-gray-400">
                                    {ROLE_LABELS[user?.role] || user?.role}
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">{initials}</span>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-card rounded-xl border border-border-light dark:border-border-dark shadow-xl overflow-hidden z-50">
                                <div className="p-3 border-b border-border-light dark:border-border-dark">
                                    <p className="text-sm font-semibold text-text-primary dark:text-white">{user?.name}</p>
                                    <p className="text-xs text-text-secondary dark:text-gray-400">{user?.email}</p>
                                </div>
                                <div className="p-1.5">
                                    <button
                                        onClick={() => { setProfileOpen(false); navigate('/settings/general'); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <HiOutlineUser className="w-4 h-4" /> Profile
                                    </button>
                                    <button
                                        onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                    >
                                        <HiOutlineCog className="w-4 h-4" /> Settings
                                    </button>
                                </div>
                                <div className="p-1.5 border-t border-border-light dark:border-border-dark">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                                    >
                                        <HiOutlineLogout className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
