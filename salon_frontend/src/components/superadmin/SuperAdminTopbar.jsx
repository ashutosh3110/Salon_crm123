import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell } from 'lucide-react';

export default function SuperAdminTopbar({ onMenuClick }) {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface transition-colors"
                    >
                        <Menu className="w-5 h-5 text-text-secondary" />
                    </button>
                    <span className="text-sm font-medium text-text-secondary hidden sm:block">Platform Administration</span>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <button className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface transition-colors relative">
                        <Bell className="w-4.5 h-4.5 text-text-secondary" />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    </button>

                    <div className="flex items-center gap-2 pl-3 border-l border-border">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xs font-bold text-white shadow-sm">
                            SA
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-medium text-text leading-none">{user?.name || 'Super Admin'}</div>
                            <div className="text-[11px] text-text-muted mt-0.5">superadmin</div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
