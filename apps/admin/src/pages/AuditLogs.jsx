import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Input, DataTable, Pagination, Badge, Spinner, Alert } from '../components/ui';
import { formatDateTime } from '../lib/format';

export default function AuditLogs() {
  const [action, setAction] = useState('');
  const [debouncedAction, setDebouncedAction] = useState('');
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedAction(action);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [action]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'audit-logs', { action: debouncedAction, search: debounced, page }],
    queryFn: async () =>
      (
        await api.get('/admin/audit-logs', {
          params: { action: debouncedAction || undefined, search: debounced || undefined, page, per_page: 20 },
        })
      ).data.data,
  });

  const columns = [
    { key: 'id', header: 'ID', render: (row) => <span className="font-mono text-xs">#{row.id}</span> },
    {
      key: 'user',
      header: 'Admin',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.user?.name || 'Sistem'}</p>
          <p className="text-xs text-slate-400">{row.user?.phone || '-'}</p>
        </div>
      ),
    },
    { key: 'action', header: 'Aksi', render: (row) => <Badge tone="blue">{row.action}</Badge> },
    { key: 'entity', header: 'Entitas', render: (row) => <span className="font-medium">{row.entity || '-'}</span> },
    { key: 'entity_id', header: 'ID Entitas', render: (row) => row.entity_id ?? '-' },
    { key: 'ip_address', header: 'IP Address', render: (row) => <span className="font-mono text-xs">{row.ip_address || '-'}</span> },
    { key: 'created_at', header: 'Waktu', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Audit Log" description="Riwayat aktivitas administrator" />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-48 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari entitas, aksi, nama admin..."
              className="pl-9"
            />
          </div>
          <Input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="Filter aksi (contoh: deposit.approved)"
            className="w-72"
          />
        </div>
      </Card>

      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <Card>
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada audit log" />
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
