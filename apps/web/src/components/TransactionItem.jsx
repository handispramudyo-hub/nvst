import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp, HandCoins, Settings } from 'lucide-react';
import { formatDateTime, rupiah } from '../lib/format';

const TYPE_META = {
  deposit: { label: 'Deposit', icon: ArrowDownLeft, cls: 'bg-secondary-container/40 text-on-secondary-container' },
  investment: { label: 'Investasi', icon: Wallet, cls: 'bg-primary-container/10 text-primary' },
  withdrawal: { label: 'Penarikan', icon: ArrowUpRight, cls: 'bg-tertiary-fixed text-tertiary-container' },
  profit: { label: 'Profit', icon: TrendingUp, cls: 'bg-secondary-container/40 text-on-secondary-container' },
  commission: { label: 'Komisi', icon: HandCoins, cls: 'bg-surface-variant text-surface-tint' },
  adjustment: { label: 'Penyesuaian', icon: Settings, cls: 'bg-surface-container text-on-surface-variant' },
};

const STATUS_BADGES = {
  rejected: { label: 'Ditolak', cls: 'bg-error-container text-on-error-container' },
  pending: { label: 'Pending', cls: 'bg-tertiary-fixed text-tertiary-container' },
  processing: { label: 'Diproses', cls: 'bg-tertiary-fixed text-tertiary-container' },
  completed: { label: 'Berhasil', cls: 'bg-secondary-container/40 text-on-secondary-container' },
  approved: { label: 'Berhasil', cls: 'bg-secondary-container/40 text-on-secondary-container' },
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
    <div className="flex items-center gap-3 border-b border-outline-variant/20 py-3 last:border-0">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.cls}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-on-surface">{tx.description ?? meta.label}</p>
        <p className="text-xs text-on-surface-variant">{formatDateTime(tx.created_at)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className={`font-financial-data text-financial-data tabular-nums ${isCredit ? 'text-secondary' : 'text-error'}`}>
          {sign}
          {rupiah(Math.abs(tx.amount))}
        </span>
        <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold ${badge.cls}`}>
          {badge.label}
        </span>
      </div>
    </div>
  );
}
