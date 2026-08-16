import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, ChevronRight, LifeBuoy, XCircle } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDateTime } from '../lib/format';
import { Badge, Button, Card, EmptyState, Spinner } from '../components/ui';const TYPE_LABELS = {
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
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className={`text-right text-[13px] ${bold ? 'font-bold text-slate-900' : 'font-medium text-slate-900'}`}>
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
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft size={16} />
        Kembali ke Riwayat
      </Link>

      <div className="flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </span>
        <Badge tone={badge.tone}>{badge.label}</Badge>
        <p className={`text-[28px] font-bold tabular-nums ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
          {isCredit ? '+' : '-'}
          {rupiah(Math.abs(tx.amount))}
        </p>
      </div>

      <Card className="divide-y divide-slate-100 p-5">
        <DetailRow label="Jenis" value={TYPE_LABELS[tx.type] ?? tx.type} />
        <DetailRow label="Metode" value={methodLabel(tx)} />
        <DetailRow label="Tanggal" value={formatDateTime(tx.created_at)} />
        <DetailRow label="No. Referensi" value={tx.tx_id} bold />
        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-slate-500">Status</span>
          <Badge tone={badge.tone}>{badge.label}</Badge>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold text-slate-500">Bantuan</p>
        <div className="space-y-2">
          <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            Laporkan Masalah
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          <button type="button" className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
            <span className="inline-flex items-center gap-2">
              <LifeBuoy size={16} className="text-slate-400" />
              Hubungi CS
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </Card>
    </div>
  );
}
