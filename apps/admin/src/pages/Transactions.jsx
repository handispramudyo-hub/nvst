import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, Select, DataTable, Pagination, Badge, Spinner, Alert } from '../components/ui';
import { rupiah, formatDateTime } from '../lib/format';

const TYPE_FILTERS = [
  { value: '', label: 'Semua Tipe' },
  { value: 'deposit', label: 'Deposit' },
  { value: 'investment', label: 'Investasi' },
  { value: 'withdrawal', label: 'Penarikan' },
  { value: 'profit', label: 'Profit' },
  { value: 'commission', label: 'Komisi' },
  { value: 'adjustment', label: 'Penyesuaian' },
];

const TYPE_TONES = {
  deposit: 'green',
  investment: 'violet',
  withdrawal: 'red',
  profit: 'blue',
  commission: 'amber',
  adjustment: 'slate',
};

export default function Transactions() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [type, setType] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'transactions', { search: debounced, type, page }],
    queryFn: async () =>
      (
        await api.get('/admin/transactions', {
          params: { search: debounced || undefined, type: type || undefined, page, per_page: 20 },
        })
      ).data.data,
  });

  const columns = [
    { key: 'tx_id', header: 'Tx ID', render: (row) => <span className="font-mono text-xs">{row.tx_id}</span> },
    {
      key: 'user',
      header: 'Pengguna',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.user?.name || '-'}</p>
          <p className="text-xs text-slate-400">{row.user?.phone || '-'}</p>
        </div>
      ),
    },
    { key: 'type', header: 'Tipe', render: (row) => <Badge tone={TYPE_TONES[row.type] ?? 'slate'}>{row.type}</Badge> },
    { key: 'amount', header: 'Jumlah', render: (row) => <span className="font-semibold">{rupiah(row.amount)}</span> },
    { key: 'description', header: 'Deskripsi', render: (row) => <span className="text-slate-500">{row.description || '-'}</span> },
    { key: 'balance_after', header: 'Saldo Setelah', render: (row) => rupiah(row.balance_after) },
    { key: 'created_at', header: 'Waktu', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Transaksi" description="Riwayat transaksi wallet seluruh pengguna" />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari tx id, deskripsi, nama pengguna..."
              className="pl-9"
            />
          </div>
          <Select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-44"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <Card>
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada transaksi" />
            {data.pagination && (
              <Pagination
                page={data.pagination.current_page}
                lastPage={data.pagination.last_page}
                total={data.pagination.total}
                from={data.pagination.from}
                to={data.pagination.to}
                onChange={setPage}
              />
            )}
          </Card>
        )
      )}
    </div>
  );
}
