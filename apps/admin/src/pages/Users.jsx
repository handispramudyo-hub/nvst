import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, Select, Button, DataTable, Pagination, Badge, Spinner, Alert } from '../components/ui';
import { formatDateTime } from '../lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'active', label: 'Aktif' },
  { value: 'suspended', label: 'Nonaktif' },
];

export default function Users() {
  const navigate = useNavigate();
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
    queryKey: ['admin', 'users', { search: debounced, status, page }],
    queryFn: async () =>
      (
        await api.get('/admin/users', {
          params: { search: debounced || undefined, status: status || undefined, page, per_page: 20 },
        })
      ).data.data,
  });

  const columns = [
    { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    { key: 'name', header: 'Nama', render: (row) => <span className="font-medium text-slate-900">{row.name || '-'}</span> },
    { key: 'phone', header: 'No. HP' },
    { key: 'email', header: 'Email', render: (row) => row.email || '-' },
    { key: 'referral_code', header: 'Kode Referral', render: (row) => row.referral_code || '-' },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => <Badge tone={row.is_active ? 'green' : 'red'}>{row.is_active ? 'Aktif' : 'Nonaktif'}</Badge>,
    },
    { key: 'created_at', header: 'Terdaftar', render: (row) => formatDateTime(row.created_at) },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/users/${row.id}`)}>
          <Eye size={14} />
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Pengguna" description="Kelola seluruh pengguna NiVEST" />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, no. HP, email, kode referral..."
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
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada pengguna" />
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
