import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { PageHeader, Card, Button, Field, Input, Textarea, DataTable, Pagination, Badge, Spinner, Alert } from '../components/ui';
import { formatDateTime } from '../lib/format';

const schema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(150, 'Maksimal 150 karakter'),
  body: z.string().min(1, 'Isi notifikasi wajib diisi').max(1000, 'Maksimal 1000 karakter'),
  user_ids: z.string().optional(),
});

export default function Notifications() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'notifications', { page }],
    queryFn: async () => (await api.get('/admin/notifications', { params: { page, per_page: 15 } })).data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const send = useMutation({
    mutationFn: async (values) => {
      const user_ids = values.user_ids
        ? values.user_ids
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
            .map(Number)
        : undefined;
      return (await api.post('/admin/notifications', { title: values.title, body: values.body, user_ids })).data;
    },
    onSuccess: (res) => {
      toast.success(res.message ?? 'Notifikasi terkirim.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
      reset();
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const columns = [
    { key: 'title', header: 'Judul', render: (row) => <span className="font-medium text-slate-900">{row.title}</span> },
    { key: 'body', header: 'Isi', render: (row) => <span className="text-slate-500">{row.body || '-'}</span> },
    {
      key: 'user',
      header: 'Penerima',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.user?.name || '-'}</p>
          <p className="text-xs text-slate-400">{row.user?.phone || '-'}</p>
        </div>
      ),
    },
    { key: 'read_at', header: 'Dibaca', render: (row) => <Badge tone={row.read_at ? 'green' : 'amber'}>{row.read_at ? 'Dibaca' : 'Belum'}</Badge> },
    { key: 'created_at', header: 'Dikirim', render: (row) => formatDateTime(row.created_at) },
  ];

  return (
    <div>
      <PageHeader title="Notifikasi" description="Kirim notifikasi dan lihat riwayat pengiriman" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Kirim Broadcast</h3>
          <form onSubmit={handleSubmit((values) => send.mutate(values))} className="space-y-4">
            <Field label="Judul" required error={errors.title?.message}>
              <Input placeholder="Contoh: Update sistem" {...register('title')} />
            </Field>
            <Field label="Isi Notifikasi" required error={errors.body?.message}>
              <Textarea rows={4} placeholder="Isi pesan yang akan dikirim..." {...register('body')} />
            </Field>
            <Field label="ID Pengguna Tujuan (Opsional)" error={errors.user_ids?.message} hint="Kosongkan untuk kirim ke semua pengguna aktif. Pisahkan dengan koma, contoh: 1,2,3">
              <Input placeholder="1,2,3" {...register('user_ids')} />
            </Field>
            <Button type="submit" loading={send.isPending}>
              <Send size={16} />
              Kirim Notifikasi
            </Button>
          </form>
        </Card>

        <Card>
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-base font-semibold text-slate-800">Riwayat Notifikasi</h3>
          </div>
          {isError && <Alert className="m-4">{extractErrorMessage(error)}</Alert>}
          {isLoading ? (
            <Spinner />
          ) : (
            data && (
              <>
                <DataTable columns={columns} rows={data.items} keyField="id" emptyTitle="Belum ada notifikasi" />
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
              </>
            )
          )}
        </Card>
      </div>
    </div>
  );
}
