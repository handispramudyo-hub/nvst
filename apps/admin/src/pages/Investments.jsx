import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, Select, DataTable, Pagination, StatusBadge, Spinner, Alert } from '../components/ui';
import { rupiah, formatDate } from '../lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Investments() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'investments', { search: debounced, status, page }],
    queryFn: async () =>
      (
        await api.get('/admin/investments', {
          params: { search: debounced || undefined, status: status || undefined, page, per_page: 15 },
        })
      ).data.data,
  });

  const columns = [
    {
      key: 'investment_no',
      header: 'No. Investasi',
      render: (row) => <span className="font-mono text-xs">{row.investment_no}</span>,
    },
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
    { key: 'project', header: 'Proyek', render: (row) => <span className="font-medium">{row.project?.name || '-'}</span> },
    { key: 'amount', header: 'Jumlah', render: (row) => rupiah(row.amount) },
    {
      key: 'current_earnings',
      header: 'Earnings',
      render: (row) => <span className="font-semibold text-emerald-600">{rupiah(row.current_earnings)}</span>,
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'start_date', header: 'Mulai', render: (row) => formatDate(row.start_date) },
    { key: 'maturity_date', header: 'Jatuh Tempo', render: (row) => formatDate(row.maturity_date) },
  ];

  return (
    <div>
      <PageHeader title="Investasi" description="Kelola seluruh investasi pengguna" />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. investasi, pengguna, proyek..."
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-44"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
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
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada investasi" />
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
