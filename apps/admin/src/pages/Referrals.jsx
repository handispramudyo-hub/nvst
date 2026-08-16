import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, Select, DataTable, Pagination, StatusBadge, Badge, Spinner, Alert } from '../components/ui';
import { rupiah, formatDateTime } from '../lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'qualified', label: 'Terkualifikasi' },
];

const TABS = [
  { key: 'referrals', label: 'Referral' },
  { key: 'commissions', label: 'Komisi' },
];

export default function Referrals() {
  const [tab, setTab] = useState('referrals');
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

  const queryKey = tab === 'referrals' ? ['admin', 'referrals', { search: debounced, status, page }] : ['admin', 'referrals', 'commissions', { page }];

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const params =
        tab === 'referrals'
          ? { search: debounced || undefined, status: status || undefined, page, per_page: 15 }
          : { page, per_page: 15 };
      return (await api.get(`/admin/${tab === 'referrals' ? 'referrals' : 'referrals/commissions'}`, { params })).data.data;
    },
  });

  const referralColumns = [
    {
      key: 'referred',
      header: 'Pengguna Direferensikan',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.referred?.name || '-'}</p>
          <p className="text-xs text-slate-400">{row.referred?.phone || '-'}</p>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'commission_amount', header: 'Komisi', render: (row) => <span className="font-semibold">{rupiah(row.commission_amount)}</span> },
    { key: 'created_at', header: 'Waktu', render: (row) => formatDateTime(row.created_at) },
  ];

  const commissionColumns = [
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
    { key: 'amount', header: 'Jumlah', render: (row) => <span className="font-semibold">{rupiah(row.amount)}</span> },
    { key: 'status', header: 'Status', render: (row) => <Badge tone={row.status === 'credited' ? 'green' : 'slate'}>{row.status}</Badge> },
    { key: 'credited_at', header: 'Dikreditkan', render: (row) => formatDateTime(row.credited_at) },
    { key: 'created_at', header: 'Dibuat', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Referral" description="Pantau program referral dan komisi" />
      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'referrals' && (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-56 flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / no. HP pengguna..."
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
      )}

      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <Card>
            <DataTable
              columns={tab === 'referrals' ? referralColumns : commissionColumns}
              rows={data.items}
              keyField="id"
              emptyTitle={tab === 'referrals' ? 'Tidak ada referral' : 'Tidak ada komisi'}
            />
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
