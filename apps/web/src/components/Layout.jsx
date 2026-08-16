import { Navigate, NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Bell,
  Home,
  Landmark,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  PieChart,
  ReceiptText,
  Rocket,
  Settings,
  User,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

const DESKTOP_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Investments', icon: Rocket },
  { to: '/portfolio', label: 'Holdings', icon: Wallet },
  { to: '/transactions', label: 'Logs', icon: ArrowLeftRight },
];

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: Landmark },
  { to: '/portfolio', label: 'Portfolio', icon: PieChart },
  { to: '/transactions', label: 'History', icon: ReceiptText },
  { to: '/profile', label: 'Profile', icon: User },
];

function Initials({ name }) {
  const parts = (name ?? 'U').trim().split(/\s+/);
  const initial = (parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '');
  return initial.toUpperCase();
}

export default function Layout() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: notif } = useQuery({
    queryKey: ['web-notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    staleTime: 60_000,
  });
  const unread = notif?.data?.unread_count ?? 0;

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-container font-bold text-on-primary-container'
        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
    }`;

  const bottomItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-1 transition-all ${
      isActive
        ? 'bg-secondary-container text-on-secondary-container'
        : 'text-on-surface-variant hover:bg-surface-container'
    }`;

  return (
    <div className="min-h-screen bg-background pb-20 text-on-background md:pb-0">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-outline-variant/20 bg-surface p-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary">
            <Leaf size={20} />
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-primary">NiVEST</span>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-lg bg-surface-container-low p-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container font-bold text-primary-fixed">
            <Initials name={user?.name} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-primary">{user?.name ?? 'Investor'}</p>
            <p className="text-xs text-on-surface-variant">Premium Member</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {DESKTOP_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navItemClass}>
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 border-t border-outline-variant/20 pt-4">
          <NavLink to="/profile" className={navItemClass}>
            <Settings size={20} />
            <span>Account Settings</span>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-screen w-full flex-1 flex-col md:ml-72">
        {/* Top app bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant/30 bg-surface/80 px-4 py-3.5 shadow-sm backdrop-blur-xl md:px-10">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-full p-2 text-primary transition-colors hover:bg-surface-container-high"
              aria-label="Menu"
            >
              <Menu size={22} />
            </button>
            <span className="font-bold tracking-tight text-primary">NiVEST</span>
          </div>
          <div className="hidden md:block">
            <span className="text-sm text-on-surface-variant">Ikhtisar Akun</span>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
              aria-label="Notifikasi"
            >
              <Bell size={22} />
              {unread > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
              )}
            </Link>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-10 md:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-outline-variant/30 bg-surface/80 px-2 py-1.5 shadow-lg backdrop-blur-xl md:hidden">
        {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={bottomItemClass}>
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
