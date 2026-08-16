import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, XCircle, Play, CheckCircle2 } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import {
  PageHeader,
  Card,
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
  { value: 'processing', label: 'Diproses' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'completed', label: 'Selesai' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export default function Withdrawals() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [confirmAction, setConfirmAction] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'withdrawals', { status, page }],
    queryFn: async () =>
      (await api.get('/admin/withdrawals', { params: { status: status || undefined, page, per_page: 15 } })).data.data,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });

  const action = useMutation({
    mutationFn: ({ id, act }) => api.post(`/admin/withdrawals/${id}/${act}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
      setConfirmAction(null);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const reject = useMutation({
    mutationFn: ({ id, note: rejectNote }) => api.post(`/admin/withdrawals/${id}/reject`, { note: rejectNote }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      invalidate();
      setRejectTarget(null);
      setNote('');
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const actionMeta = {
    process: { label: 'Proses', icon: Play, tone: 'primary', confirm: 'Proses Penarikan?', desc: 'Penarikan akan ditandai sedang diproses.' },
    approve: { label: 'Setujui', icon: Check, tone: 'primary', confirm: 'Setujui Penarikan?', desc: 'Penarikan akan disetujui untuk dicairkan.' },
    complete: { label: 'Selesaikan', icon: CheckCircle2, tone: 'primary', confirm: 'Selesaikan Penarikan?', desc: 'Penarikan akan ditandai selesai dan dana terkirim.' },
  };

  const renderActions = (row) => {
    const buttons = [];
    if (row.status === 'pending') {
      buttons.push(['process', 'Proses'], ['approve', 'Setujui']);
    } else if (row.status === 'processing') {
      buttons.push(['approve', 'Setujui']);
    } else if (row.status === 'approved') {
      buttons.push(['complete', 'Selesaikan']);
    }
    const canReject = row.status === 'pending' || row.status === 'processing';
    return (
      <div className="flex flex-wrap items-center gap-2">
        {buttons.map(([act, label]) => {
          const Icon = actionMeta[act].icon;
          return (
            <Button key={act} variant="outline" size="sm" onClick={() => setConfirmAction({ id: row.id, act })}>
              <Icon size={14} className="text-emerald-600" />
              {label}
            </Button>
          );
        })}
        {canReject && (
          <Button variant="outline" size="sm" onClick={() => setRejectTarget(row)}>
            <XCircle size={14} className="text-red-600" />
            Tolak
          </Button>
        )}
      </div>
    );
  };

  const columns = [
    {
      key: 'withdrawal_no',
      header: 'No. Penarikan',
      render: (row) => <span className="font-mono text-xs">{row.withdrawal_no}</span>,
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
    {
      key: 'account',
      header: 'Rekening Tujuan',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">
            {row.provider || '-'} · {row.account_name || '-'}
          </p>
          <p className="text-xs text-slate-400">{row.account_number || '-'}</p>
        </div>
      ),
    },
    { key: 'amount', header: 'Jumlah', render: (row) => rupiah(row.amount) },
    { key: 'fee', header: 'Biaya', render: (row) => rupiah(row.fee) },
    { key: 'final_amount', header: 'Diterima', render: (row) => <span className="font-semibold">{rupiah(row.final_amount)}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'created_at', header: 'Diajukan', render: (row) => formatDateTime(row.created_at) },
    { key: 'actions', header: 'Aksi', render: renderActions },
  ];

  const currentConfirm = confirmAction ? actionMeta[confirmAction.act] : null;

  return (
    <div>
      <PageHeader title="Penarikan" description="Kelola permintaan penarikan dana" />
      <Card className="mb-4 p-4">
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
      </Card>

      {isError && <Alert className="mb-4">{extractErrorMessage(error)}</Alert>}
      {isLoading ? (
        <Spinner />
      ) : (
        data && (
          <Card>
            <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Tidak ada penarikan" />
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
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => action.mutate({ id: confirmAction.id, act: confirmAction.act })}
        title={currentConfirm?.confirm}
        description={currentConfirm?.desc}
        confirmLabel={currentConfirm?.label}
        tone="primary"
        loading={action.isPending}
      />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title="Tolak Penarikan">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            reject.mutate({ id: rejectTarget.id, note });
          }}
          className="space-y-4"
        >
          <Field label="Catatan" hint="Alasan penolakan akan dilihat oleh pengguna. Dana akan dikembalikan ke saldo.">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: nomor rekening tidak valid"
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
              Tolak Penarikan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
