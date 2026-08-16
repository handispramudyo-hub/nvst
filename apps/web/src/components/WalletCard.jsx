import { Leaf } from 'lucide-react';
import { rupiah } from '../lib/format';

function Stat({ label, value, accent = false }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5 px-1">
      <span className={`text-sm font-bold tabular-nums ${accent ? 'text-emerald-200' : 'text-white'}`}>{value}</span>
      <span className="text-[11px] text-center text-white/70">{label}</span>
    </div>
  );
}

export default function WalletCard({ wallet, todayProfit = 0 }) {
  const positive = Number(todayProfit) > 0;
  return (
    <div className="overflow-hidden rounded-2xl border border-primary-900/10 bg-white shadow-card">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-primary-600 to-primary-800 px-6 pb-6 pt-6">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-sky-400/50 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-8 h-44 w-44 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[13px] font-semibold text-white/80">Total Saldo</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight text-white tabular-nums">
              {rupiah(wallet.balance)}
            </p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur">
            <Leaf size={18} />
          </span>
        </div>

        <div className="relative mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-white/80">Profit hari ini</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
              positive ? 'bg-emerald-100 text-emerald-700' : 'bg-white/20 text-white'
            }`}
          >
            +{rupiah(todayProfit)}
          </span>
        </div>

        <div className="relative mt-6 flex divide-x divide-white/15">
          <Stat label="Total Deposit" value={rupiah(wallet.total_deposited)} />
          <Stat label="Total Investasi" value={rupiah(wallet.total_invested)} accent />
          <Stat label="Total Profit" value={rupiah(wallet.total_profit)} accent />
        </div>
      </div>
    </div>
  );
}
