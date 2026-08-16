import { Navigate, NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Landmark,
  HandCoins,
  TrendingUp,
  ArrowLeftRight,
  FileText,
  UserPlus,
  ScrollText,
  Bell,
  Settings,
  UserRound,
  LogOut,
  Leaf,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Pengguna', icon: Users },
  { to: '/projects', label: 'Proyek', icon: FolderOpen },
  { to: '/deposits', label: 'Deposit', icon: Landmark },
  { to: '/withdrawals', label: 'Penarikan', icon: HandCoins },
  { to: '/investments', label: 'Investasi', icon: TrendingUp },
  { to: '/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { to: '/reports', label: 'Laporan', icon: FileText },
  { to: '/referrals', label: 'Referral', icon: UserPlus },
  { to: '/audit-logs', label: 'Audit Log', icon: ScrollText },
  { to: '/notifications', label: 'Notifikasi', icon: Bell },
  { to: '/settings', label: 'Pengaturan', icon: Settings },
];

export default function AdminLayout() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  if (!token) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
        <Link to="/" className="flex items-center gap-2 px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Leaf size={20} />
          </div>
          <div>
            <p className="text-base font-bold leading-tight text-slate-900">NiVEST</p>
            <p className="text-xs text-slate-400">Admin Panel</p>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <UserRound size={16} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.phone}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex-1 bg-slate-50">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-3 border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <UserRound size={18} />
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="px-6 py-6 md:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
