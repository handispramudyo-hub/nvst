import { Link } from 'react-router-dom';
import { ArrowDownLeft, History, Plus, TrendingUp } from 'lucide-react';

const ACTIONS = [
  { key: 'deposit', to: '/deposit', label: 'Deposit', icon: Plus, tint: 'text-emerald-600', bg: 'bg-emerald-50' },
  { key: 'invest', to: '/projects', label: 'Investasi', icon: TrendingUp, tint: 'text-primary-600', bg: 'bg-primary-50' },
  { key: 'withdraw', to: '/withdraw', label: 'Tarik Dana', icon: ArrowDownLeft, tint: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'history', to: '/transactions', label: 'Riwayat', icon: History, tint: 'text-sky-600', bg: 'bg-sky-50' },
];

export default function QuickActions() {
  return (
    <div className="flex justify-between gap-2">
      {ACTIONS.map(({ key, to, label, icon: Icon, tint, bg }) => (
        <Link
          key={key}
          to={to}
          className="group flex flex-1 flex-col items-center gap-1.5 transition-transform hover:-translate-y-0.5"
        >
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${bg} ${tint} shadow-sm transition-shadow group-hover:shadow-md`}
          >
            <Icon size={22} strokeWidth={2.2} />
          </span>
          <span className="text-xs font-semibold text-slate-700 group-hover:text-primary-700">{label}</span>
        </Link>
      ))}
    </div>
  );
}
