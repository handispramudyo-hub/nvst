import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRightLeft } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { Alert, Card, EmptyState, PageHeader, Spinner } from '../components/ui';
import TransactionItem from '../components/TransactionItem';

const FILTERS = [
  { key: '', label: 'Semua' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'investment', label: 'Investasi' },
  { key: 'withdrawal', label: 'Penarikan' },
  { key: 'profit', label: 'Profit' },
  { key: 'commission', label: 'Komisi' },
];

export default function Transactions() {
  const [type, setType] = useState('');

  const txsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data } = await api.get('/transactions', { params: { per_page: 100 } });
      return data.data.items ?? [];
    },
  });

  const txs = txsQuery.data ?? [];
  const filtered = type ? txs.filter((tx) => tx.type === type) : txs;

  return (
    <div className="space-y-4">
      <PageHeader title="Riwayat Transaksi" description="Semua pergerakan saldo wallet anda" />

      <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setType(f.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              type === f.key ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {txsQuery.isLoading ? (
        <Spinner />
      ) : txsQuery.error ? (
        <Alert tone="error">Gagal memuat transaksi: {extractErrorMessage(txsQuery.error)}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ArrowRightLeft}
          title="Tidak ada transaksi"
          description="Belum ada transaksi yang tercatat pada filter ini."
        />
      ) : (
        <Card className="px-4">
          {filtered.map((tx) => (
            <Link key={tx.id} to={`/transactions/${tx.id}`} className="block transition-colors hover:bg-slate-50/60">
              <TransactionItem tx={tx} />
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
