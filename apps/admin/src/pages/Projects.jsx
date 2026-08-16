import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import {
  PageHeader,
  Card,
  Input,
  Select,
  Button,
  DataTable,
  Pagination,
  StatusBadge,
  ProgressBar,
  Badge,
  Spinner,
  Alert,
  ConfirmDialog,
} from '../components/ui';
import { rupiah, formatPercent, formatDate } from '../lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'fully_funded', label: 'Fully Funded' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
];

export default function Projects() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'projects', { search: debounced, status, page }],
    queryFn: async () =>
      (
        await api.get('/admin/projects', {
          params: { search: debounced || undefined, status: status || undefined, page, per_page: 10 },
        })
      ).data.data,
  });

  const remove = useMutation({
    mutationFn: (projectId) => api.delete(`/admin/projects/${projectId}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'projects'] });
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const columns = [
    {
      key: 'name',
      header: 'Proyek',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image && (
            <img src={row.image} alt={row.name} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-400">{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="inline-flex items-center gap-2">
          <StatusBadge status={row.status} />
          {row.is_featured && <Badge tone="blue">Unggulan</Badge>}
        </span>
      ),
    },
    {
      key: 'funding',
      header: 'Pendanaan',
      render: (row) => (
        <div className="min-w-32">
          <p className="text-xs text-slate-500">
            {rupiah(row.current_funding)} / {rupiah(row.funding_target)}
          </p>
          <ProgressBar value={row.funding_progress} className="mt-1" />
        </div>
      ),
    },
    {
      key: 'estimated_return',
      header: 'Estimasi',
      render: (row) => formatPercent(row.estimated_return),
    },
    {
      key: 'duration_days',
      header: 'Durasi',
      render: (row) => `${row.duration_days} hari`,
    },
    {
      key: 'min_investment',
      header: 'Min Investasi',
      render: (row) => rupiah(row.min_investment),
    },
    {
      key: 'start_date',
      header: 'Periode',
      render: (row) => `${formatDate(row.start_date)} – ${formatDate(row.end_date)}`,
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${row.id}/edit`)}>
            <Pencil size={14} />
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
            <Trash2 size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Proyek"
        description="Kelola proyek investasi"
        actions={
          <Button onClick={() => navigate('/projects/new')}>
            <Plus size={16} />
            Buat Proyek
          </Button>
        }
      />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama proyek..."
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
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada proyek" />
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => remove.mutate(deleteTarget.id)}
        title="Hapus Proyek?"
        description={`Proyek "${deleteTarget?.name}" akan dihapus permanen.`}
        confirmLabel="Hapus"
        loading={remove.isPending}
      />
    </div>
  );
}
