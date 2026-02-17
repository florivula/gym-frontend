import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Utensils, Dumbbell, LogOut, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import ProfileModal from './ProfileModal';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/weight', label: 'Weight', icon: Scale },
  { to: '/food', label: 'Food', icon: Utensils },
  { to: '/gym', label: 'Gym', icon: Dumbbell },
];

export default function Navigation() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center gap-1 border-b border-border bg-card px-6 py-3">
        <span className="mr-6 text-lg font-bold text-primary">GymTracker</span>
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              pathname === to
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <UserCircle className="h-4 w-4" />
            Profile
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-card px-2 py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              pathname === to
                ? 'text-primary'
                : 'text-muted-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5', pathname === to && 'drop-shadow-[0_0_6px_hsl(217,91%,60%)]')} />
            {label}
          </Link>
        ))}
        <button
          onClick={() => setProfileOpen(true)}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors"
        >
          <UserCircle className="h-5 w-5" />
          Profile
        </button>
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>

      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
