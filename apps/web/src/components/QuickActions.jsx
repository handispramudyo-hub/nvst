import { Link } from 'react-router-dom';
import { ArrowDownLeft, History, Plus, TrendingUp } from 'lucide-react';

const ACTIONS = [
  { key: 'deposit', to: '/deposit', label: 'Deposit', icon: Plus },
  { key: 'invest', to: '/projects', label: 'Investasi', icon: TrendingUp },
  { key: 'withdraw', to: '/withdraw', label: 'Tarik Dana', icon: ArrowDownLeft },
  { key: 'history', to: '/transactions', label: 'Riwayat', icon: History },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4">
      {ACTIONS.map(({ key, to, label, icon: Icon }) => (
        <Link
          key={key}
          to={to}
          className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-3 shadow-sm transition-all hover:shadow-float active:scale-95 md:p-4"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/5 text-primary transition-colors group-hover:bg-primary-container/10">
            <Icon size={22} strokeWidth={2.2} />
          </span>
          <span className="text-xs font-medium text-on-surface">{label}</span>
        </Link>
      ))}
    </div>
  );
}
