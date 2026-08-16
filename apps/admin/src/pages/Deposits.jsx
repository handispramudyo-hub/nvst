import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Check, XCircle } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import {
  PageHeader,
  Card,
  Input,
  Select,
  Button,
  Textarea,
  Field,
  DataTable,
  Pagination,
  StatusBadge,
  Modal,
  Spinner,
  Alert,
  ConfirmDialog,
} from '../components/ui';
import { rupiah, formatDateTime } from '../lib/format';

const STATUS_FILTERS = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Deposits() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'deposits', { search: debounced, status, page }],
    queryFn: async () =>
      (
        await api.get('/admin/deposits', {
          params: { search: debounced || undefined, status: status || undefined, page, per_page: 15 },
        })
      ).data.data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'deposits'] });

  const approve = useMutation({
    mutationFn: (id) => api.post(`/admin/deposits/${id}/approve`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
      setApproveTarget(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const reject = useMutation({
    mutationFn: ({ id, note: rejectNote }) => api.post(`/admin/deposits/${id}/reject`, { note: rejectNote }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
      setRejectTarget(null);
      setNote('');
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const columns = [
    { key: 'deposit_no', header: 'No. Deposit', render: (row) => <span className="font-mono text-xs">{row.deposit_no}</span> },
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
    { key: 'payment_method', header: 'Metode', render: (row) => row.payment_method || '-' },
    { key: 'amount', header: 'Jumlah', render: (row) => rupiah(row.amount) },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'created_at', header: 'Diajukan', render: (row) => formatDateTime(row.created_at) },
    {
      key: 'actions',
      header: 'Aksi',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setApproveTarget(row)}>
              <Check size={14} className="text-emerald-600" />
              Setujui
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRejectTarget(row)}>
              <XCircle size={14} className="text-red-600" />
              Tolak
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">-</span>
        ),
    },
  ];

  return (
    <div>
      <PageHeader title="Deposit" description="Kelola deposit masuk pengguna" />
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. deposit, nama, no. HP..."
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
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada deposit" />
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
        open={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => approve.mutate(approveTarget.id)}
        title="Setujui Deposit?"
        description={`Deposit ${approveTarget?.deposit_no} sebesar ${rupiah(approveTarget?.amount)} akan disetujui dan saldo pengguna ditambahkan.`}
        confirmLabel="Setujui"
        tone="primary"
        loading={approve.isPending}
      />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Deposit">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reject.mutate({ id: rejectTarget.id, note });
          }}
          className="space-y-4"
        >
          <Field label="Catatan" hint="Alasan penolakan akan dilihat oleh pengguna.">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: bukti transfer tidak valid"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setNote('');
              }}
              disabled={reject.isPending}
            >
              Batal
            </Button>
            <Button type="submit" variant="danger" loading={reject.isPending}>
              Tolak Deposit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
