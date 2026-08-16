import { Link } from 'react-router-dom';
import { Leaf, TrendingUp } from 'lucide-react';
import { rupiah } from '../lib/format';

function Stat({ label, value, accent = false }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 px-1">
      <span className={`font-financial-data text-financial-data tabular-nums ${accent ? 'text-secondary-fixed' : 'text-on-primary'}`}>
        {value}
      </span>
      <span className="text-[11px] text-center text-primary-fixed-dim">{label}</span>
    </div>
  );
}

export default function WalletCard({ wallet, todayProfit = 0 }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-float">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-[#004d34] opacity-90" />
      <div
        className="absolute inset-0 opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')",
        }}
      />

      <div className="relative z-10 flex flex-col gap-5 p-6 md:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary-fixed-dim">
              Total Saldo
            </p>
            <p className="font-display text-4xl font-bold tracking-tight text-on-primary tabular-nums md:text-5xl">
              {rupiah(wallet.balance)}
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-secondary-container backdrop-blur-md">
            <Leaf size={20} />
          </span>
        </div>

        <div className="flex divide-x divide-white/15 border-t border-white/10 pt-4">
          <Stat label="Total Deposit" value={rupiah(wallet.total_deposited)} />
          <Stat label="Total Investasi" value={rupiah(wallet.total_invested)} accent />
          <Stat label="Total Profit" value={rupiah(wallet.total_profit)} accent />
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="mb-1 text-xs font-semibold text-primary-fixed-dim">Keuntungan Hari Ini</p>
            <p className="flex items-center gap-1.5 font-financial-data text-financial-data text-secondary-fixed tabular-nums">
              <TrendingUp size={16} />
              +{rupiah(todayProfit)}
            </p>
          </div>
          <Link
            to="/deposit"
            className="rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-on-secondary shadow-sm transition-colors hover:bg-[#005a3d] active:scale-95"
          >
            Top Up
          </Link>
        </div>
      </div>
    </div>
  );
}
