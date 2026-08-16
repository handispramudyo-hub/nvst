import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Briefcase, FolderOpen, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDate } from '../lib/format';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Spinner,
  StatCard,
  StatusBadge,
} from '../components/ui';

export default function Portfolio() {
  const summaryQuery = useQuery({
    queryKey: ['investments-summary'],
    queryFn: async () => {
      const { data } = await api.get('/investments/summary');
      return data.data;
    },
  });

  const investmentsQuery = useQuery({
    queryKey: ['investments'],
    queryFn: async () => {
      const { data } = await api.get('/investments', { params: { per_page: 50 } });
      return data.data.items ?? [];
    },
  });

  const summary = summaryQuery.data;
  const investments = investmentsQuery.data ?? [];

  const renderInvestment = (inv) => {
    const earningsPct =
      inv.expected_return_amount > 0 ? (inv.current_earnings / inv.expected_return_amount) * 100 : 0;

    return (
      <Card key={inv.id} className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={inv.status} />
              <Badge tone="slate">{inv.investment_no}</Badge>
            </div>
            <h3 className="mt-2 text-base font-bold text-slate-900">{inv.project?.name ?? 'Proyek tidak tersedia'}</h3>
            <p className="text-xs text-slate-400">
              {inv.project?.category ?? ''} · Dibuat {formatDate(inv.created_at)}
            </p>
          </div>
          {inv.project && (
            <Link
              to={`/projects/${inv.project.id}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              Detail
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
          <div>
            <p className="text-xs text-slate-400">Modal</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{rupiah(inv.amount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Return</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800">{rupiah(inv.expected_return_amount)}</p>
          </div>
        </div>

        {inv.status === 'active' && inv.expected_return_amount > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Profit Berjalan</span>
              <span className="font-semibold text-emerald-600">
                {rupiah(inv.current_earnings)} / {rupiah(inv.expected_return_amount)}
              </span>
            </div>
            <ProgressBar value={earningsPct} className="mt-1.5" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-400">
          <span>Mulai: {formatDate(inv.start_date)}</span>
          <span>Jatuh Tempo: {formatDate(inv.maturity_date)}</span>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Portofolio" description="Ringkasan seluruh investasi dan perolehan profit anda" />

      {summaryQuery.isLoading ? (
        <Spinner />
      ) : summaryQuery.error ? (
        <Alert tone="error">Gagal memuat ringkasan: {extractErrorMessage(summaryQuery.error)}</Alert>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={PiggyBank} label="Total Investasi" value={rupiah(summary?.total_invested ?? 0)} />
          <StatCard icon={Briefcase} label="Nilai Aktif" value={rupiah(summary?.active_amount ?? 0)} tone="blue" />
          <StatCard
            icon={Wallet}
            label="Total Return"
            value={rupiah(summary?.total_expected_return ?? 0)}
            tone="amber"
          />
          <StatCard icon={TrendingUp} label="Total Profit" value={rupiah(summary?.total_earned ?? 0)} tone="red" />
        </div>
      )}

      {investmentsQuery.isLoading ? (
        <Spinner />
      ) : investmentsQuery.error ? (
        <Alert tone="error">Gagal memuat investasi: {extractErrorMessage(investmentsQuery.error)}</Alert>
      ) : investments.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Belum ada investasi"
          description="Mulai investasi pertama anda pada proyek UMKM pilihan."
          action={
            <Link to="/projects">
              <Button>Lihat Proyek</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">{investments.map(renderInvestment)}</div>
      )}
    </div>
  );
}
