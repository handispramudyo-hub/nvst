import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, CheckCheck } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { Alert, Button, Card, EmptyState, PageHeader, Spinner } from '../components/ui';

export default function Notifications() {
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['web-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { per_page: 50 } });
      return data.data;
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      toast.success('Semua notifikasi ditandai sudah dibaca.');
      queryClient.invalidateQueries({ queryKey: ['web-notifications'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.post(`/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['web-notifications'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const notifications = notificationsQuery.data?.notifications ?? [];
  const unreadCount = notificationsQuery.data?.unread_count ?? 0;

  const handleClick = (n) => {
    if (!n.read_at) markReadMutation.mutate(n.id);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifikasi"
        description={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Tidak ada notifikasi baru'}
        actions={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
            >
              <CheckCheck size={16} />
              Tandai semua dibaca
            </Button>
          ) : null
        }
      />

      {notificationsQuery.isLoading ? (
        <Spinner />
      ) : notificationsQuery.error ? (
        <Alert tone="error">Gagal memuat notifikasi: {extractErrorMessage(notificationsQuery.error)}</Alert>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title="Tidak ada notifikasi"
            description="Notifikasi deposit, investasi, dan penarikan akan tampil di sini."
          />
        </Card>
      ) : (
        <Card className="px-4">
          {notifications.map((n) => (
            <button
              type="button"
              key={n.id}
              onClick={() => handleClick(n)}
              className="flex w-full items-start gap-3 border-b border-outline-variant/20 py-3 text-left last:border-0"
            >
              <span
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                  n.read_at ? 'bg-surface-container text-on-surface-variant' : 'bg-primary-fixed text-on-primary-fixed'
                }`}
              >
                <Bell size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm font-semibold ${n.read_at ? 'text-on-surface-variant' : 'text-primary'}`}>
                    {n.title}
                  </span>
                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />}
                </span>
                <span className="block text-[13px] leading-relaxed text-on-surface-variant">{n.body}</span>
                <span className="mt-0.5 block text-xs text-outline">{formatDateTime(n.created_at)}</span>
              </span>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
