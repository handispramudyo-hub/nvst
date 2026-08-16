import { Navigate, NavLink, Outlet, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bell, Home, Landmark, Leaf, PieChart, ReceiptText, User } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/projects', label: 'Projects', icon: Landmark },
  { to: '/portfolio', label: 'Portfolio', icon: PieChart },
  { to: '/transactions', label: 'History', icon: ReceiptText },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Layout() {
  const token = useAuthStore((s) => s.token);

  const { data: notif } = useQuery({
    queryKey: ['web-notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    staleTime: 60_000,
  });
  const unread = notif?.data?.unread_count ?? 0;

  if (!token) return <Navigate to="/login" replace />;

  const bottomItemClass = ({ isActive }) =>
    `flex flex-col items-center justify-center gap-0.5 rounded-full px-4 py-1 transition-all ${
      isActive
        ? 'bg-secondary-container text-on-secondary-container'
        : 'text-on-surface-variant hover:bg-surface-container'
    }`;

  return (
    <div className="min-h-screen bg-background pb-24 text-on-background">
      {/* Top app bar */}
      <header className="sticky top-0 z-30 w-full border-b border-outline-variant/30 bg-surface/80 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-lg items-center justify-between px-4 py-3.5">
          <span className="flex items-center gap-2 font-bold tracking-tight text-primary">
            <Leaf size={20} />
            NiVEST
          </span>
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

      {/* Content column */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-variant/30 bg-surface/80 px-2 py-1.5 shadow-lg backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-lg items-center justify-around">
          {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={bottomItemClass}>
              <Icon size={22} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
