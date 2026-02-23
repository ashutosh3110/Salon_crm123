import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Topbar({ onMenuClick }) {
    const { user } = useAuth();

    const initials = user?.name
        ? user.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        : 'U';

    return (
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
            {/* Left */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
                >
                    <Menu className="w-5 h-5 text-text-secondary" />
                </button>

                {/* Search */}
                <div className="hidden sm:flex items-center bg-surface rounded-lg px-3 py-2 w-64">
                    <Search className="w-4 h-4 text-text-muted mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-transparent text-sm text-text placeholder-text-muted outline-none w-full"
                    />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                    <Bell className="w-5 h-5 text-text-secondary" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
                </button>

                {/* Avatar */}
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {initials}
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-sm font-medium text-text leading-tight">{user?.name || 'User'}</div>
                        <div className="text-xs text-text-muted capitalize">{user?.role || 'admin'}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
