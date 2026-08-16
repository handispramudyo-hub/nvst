import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ChevronRight, LifeBuoy, XCircle } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDateTime } from '../lib/format';
import { Badge, Button, Card, EmptyState, Spinner } from '../components/ui';

const TYPE_LABELS = {
  deposit: 'Deposit',
  investment: 'Investasi',
  withdrawal: 'Penarikan',
  profit: 'Profit',
  commission: 'Komisi',
  adjustment: 'Penyesuaian',
};

function statusBadge(tx) {
  if (tx.type === 'withdrawal') {
    const status = tx.meta?.status;
    if (status === 'rejected') return { label: 'Ditolak', tone: 'red' };
    if (status === 'pending' || status === 'processing') return { label: 'Diproses', tone: 'amber' };
    return { label: 'Berhasil', tone: 'green' };
  }
  return { label: 'Berhasil', tone: 'green' };
}

function methodLabel(tx) {
  if (tx.type === 'deposit') return 'QRIS';
  if (tx.type === 'withdrawal') {
    const provider = tx.meta?.provider;
    return provider ? String(provider).toUpperCase() : 'Bank Transfer';
  }
  return '-';
}

function DetailRow({ label, value, bold = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-[13px] text-on-surface-variant">{label}</span>
      <span className={`text-right text-[13px] ${bold ? 'font-bold text-primary' : 'font-medium text-on-surface'}`}>
        {value}
      </span>
    </div>
  );
}

export default function TransactionDetail() {
  const { id } = useParams();
  const txQuery = useQuery({
    queryKey: ['transaction', id],
    queryFn: async () => {
      const { data } = await api.get(`/transactions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  if (txQuery.isLoading) return <Spinner />;

  if (txQuery.error || !txQuery.data) {
    return (
      <EmptyState
        icon={XCircle}
        title="Transaksi tidak ditemukan"
        description={txQuery.error ? extractErrorMessage(txQuery.error) : 'Data transaksi tidak tersedia.'}
        action={
          <Link to="/transactions">
            <Button variant="secondary">Kembali ke Riwayat</Button>
          </Link>
        }
      />
    );
  }

  const tx = txQuery.data;
  const isCredit = Number(tx.amount) >= 0;
  const badge = statusBadge(tx);

  return (
    <div className="space-y-5">
      <Link
        to="/transactions"
        className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft size={16} />
        Kembali ke Riwayat
      </Link>

      <div className="flex flex-col items-center gap-3">
        <span className={`flex h-14 w-14 items-center justify-center rounded-full ${isCredit ? 'bg-secondary-container/40 text-on-secondary-container' : 'bg-error-container text-on-error-container'}`}>
          <CheckCircle2 size={28} />
        </span>
        <Badge tone={badge.tone}>{badge.label}</Badge>
        <p className={`font-display text-4xl font-bold tabular-nums ${isCredit ? 'text-secondary' : 'text-error'}`}>
          {isCredit ? '+' : '-'}
          {rupiah(Math.abs(tx.amount))}
        </p>
      </div>

      <Card className="divide-y divide-outline-variant/20 p-5">
        <DetailRow label="Jenis" value={TYPE_LABELS[tx.type] ?? tx.type} />
        <DetailRow label="Metode" value={methodLabel(tx)} />
        <DetailRow label="Tanggal" value={formatDateTime(tx.created_at)} />
        <DetailRow label="No. Referensi" value={tx.tx_id} bold />
        <div className="flex items-center justify-between py-2.5">
          <span className="text-[13px] text-on-surface-variant">Status</span>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-on-surface-variant">Bantuan</p>
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3.5 text-sm font-semibold text-primary hover:bg-surface-container"
          >
            Laporkan Masalah
            <ChevronRight size={18} className="text-outline" />
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low px-4 py-3.5 text-sm font-semibold text-primary hover:bg-surface-container"
          >
            <span className="inline-flex items-center gap-2">
              <LifeBuoy size={16} className="text-outline" />
              Hubungi CS
            </span>
            <ChevronRight size={18} className="text-outline" />
          </button>
        </div>
      </Card>
    </div>
  );
}
