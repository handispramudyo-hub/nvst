import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, HandCoins, Settings } from 'lucide-react';
import { formatDateTime, rupiah } from '../lib/format';

const TYPE_META = {
  deposit: { label: 'Deposit', icon: ArrowDownLeft, cls: 'bg-emerald-100 text-emerald-700' },
  investment: { label: 'Investasi', icon: Wallet, cls: 'bg-primary-100 text-primary-700' },
  withdrawal: { label: 'Penarikan', icon: ArrowUpRight, cls: 'bg-amber-100 text-amber-700' },
  profit: { label: 'Profit', icon: TrendingUp, cls: 'bg-emerald-100 text-emerald-700' },
  commission: { label: 'Komisi', icon: HandCoins, cls: 'bg-sky-100 text-sky-700' },
  adjustment: { label: 'Penyesuaian', icon: Settings, cls: 'bg-slate-100 text-slate-600' },
};

const STATUS_BADGES = {
  rejected: { label: 'Ditolak', cls: 'bg-red-100 text-red-700' },
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'Diproses', cls: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Berhasil', cls: 'bg-emerald-100 text-emerald-700' },
  approved: { label: 'Berhasil', cls: 'bg-emerald-100 text-emerald-700' },
};

function statusBadge(tx) {
  if (tx.type === 'withdrawal') {
    return STATUS_BADGES[tx.meta?.status] ?? STATUS_BADGES.pending;
  }
  return STATUS_BADGES.completed;
}

export default function TransactionItem({ tx }) {
  const meta = TYPE_META[tx.type] ?? TYPE_META.adjustment;
  const Icon = meta.icon;
  const isCredit = Number(tx.amount) >= 0;
  const sign = isCredit ? '+' : '-';
  const badge = statusBadge(tx);
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-0">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.cls}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{tx.description ?? meta.label}</p>
        <p className="text-xs text-slate-500">{formatDateTime(tx.created_at)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`text-sm font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
          {sign}
          {rupiah(Math.abs(tx.amount))}
        </span>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}
