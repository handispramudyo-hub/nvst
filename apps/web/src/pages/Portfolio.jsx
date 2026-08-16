import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowUpRight, Briefcase, FolderOpen, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
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
      <Card key={inv.id} className="overflow-hidden">
        <div className="border-b border-outline-variant/20 bg-surface-container-low px-5 py-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={inv.status} />
            <Badge tone="slate">{inv.investment_no}</Badge>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-primary">{inv.project?.name ?? 'Proyek tidak tersedia'}</h3>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                {inv.project?.category ?? ''} · Dibuat {formatDate(inv.created_at)}
              </p>
            </div>
            {inv.project && (
              <Link
                to={`/projects/${inv.project.id}`}
                className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:opacity-70"
              >
                Detail
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-3">
              <p className="text-xs text-on-surface-variant">Modal</p>
              <p className="mt-0.5 font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                {rupiah(inv.amount)}
              </p>
            </div>
            <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-3">
              <p className="text-xs text-on-surface-variant">Total Return</p>
              <p className="mt-0.5 font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                {rupiah(inv.expected_return_amount)}
              </p>
            </div>
          </div>

          {inv.status === 'active' && inv.expected_return_amount > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-on-surface-variant">
                <span>Profit Berjalan</span>
                <span className="font-semibold text-secondary tabular-nums">
                  {rupiah(inv.current_earnings)} / {rupiah(inv.expected_return_amount)}
                </span>
              </div>
              <ProgressBar value={earningsPct} className="mt-1.5" />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-outline-variant/20 pt-3 text-xs text-on-surface-variant">
            <span>Mulai: {formatDate(inv.start_date)}</span>
            <span>Jatuh Tempo: {formatDate(inv.maturity_date)}</span>
          </div>
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
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={PiggyBank} label="Total Investasi" value={rupiah(summary?.total_invested ?? 0)} />
          <StatCard icon={Briefcase} label="Nilai Aktif" value={rupiah(summary?.active_amount ?? 0)} tone="green" />
          <StatCard
            icon={Wallet}
            label="Total Return"
            value={rupiah(summary?.total_expected_return ?? 0)}
            tone="amber"
          />
          <StatCard icon={TrendingUp} label="Total Profit" value={rupiah(summary?.total_earned ?? 0)} tone="green" />
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-primary">Holdings</h2>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-secondary">
            <ArrowUpRight size={15} />
            {investments.length} investasi
          </span>
        </div>

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
    </div>
  );
}
