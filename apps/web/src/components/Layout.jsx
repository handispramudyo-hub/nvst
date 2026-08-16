import { Navigate, NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftRight,
  Bell,
  FolderOpen,
  HandCoins,
  Landmark,
  LayoutDashboard,
  Leaf,
  LogOut,
  UserRound,
  Wallet,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import { rupiah } from '../lib/format';

const NAV = [
  { to: '/', label: 'Beranda', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Proyek', icon: FolderOpen },
  { to: '/portfolio', label: 'Portofolio', icon: Wallet },
  { to: '/deposit', label: 'Deposit', icon: Landmark },
  { to: '/withdraw', label: 'Tarik Dana', icon: HandCoins },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/profile', label: 'Profil', icon: UserRound },
];

export default function Layout() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const wallet = useAuthStore((s) => s.wallet);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: notif } = useQuery({
    queryKey: ['web-notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
    staleTime: 60_000,
  });
  const unread = notif?.data?.unread_count ?? 0;

  if (!token) return <Navigate to="/login" replace />;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  })();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Leaf size={20} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-extrabold text-slate-900">NiVEST</p>
              <p className="text-xs text-slate-400">Investasi Digital</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/deposit"
              className="hidden items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 shadow-pill sm:flex"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white">
                <Wallet size={13} />
              </span>
              <span className="text-xs font-semibold text-primary-700">Saldo</span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">{rupiah(wallet?.balance ?? 0)}</span>
            </Link>
            <Link
              to="/notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-red-600"
              title="Keluar"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-3xl px-2 pb-2">
          <div className="scrollbar-none flex gap-1 overflow-x-auto">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="mb-1 text-[13px] text-slate-500">{greeting},</p>
        <p className="mb-5 truncate text-xl font-extrabold text-slate-900">{user?.name ?? 'Pengguna'}</p>
        <Outlet />
      </main>
    </div>
  );
}
