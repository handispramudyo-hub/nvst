import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, FolderOpen, Sparkles } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Alert, Button, Card, EmptyState, Spinner } from '../components/ui';
import WalletCard from '../components/WalletCard';
import QuickActions from '../components/QuickActions';
import ProjectCard from '../components/ProjectCard';
import Section from '../components/Section';

export default function Home() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setWallet = useAuthStore((s) => s.setWallet);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet');
      return data.data;
    },
  });

  const checkinQuery = useQuery({
    queryKey: ['checkin-status'],
    queryFn: async () => {
      const { data } = await api.get('/checkin/status');
      return data.data;
    },
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/checkin');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkin-status'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });

  useEffect(() => {
    if (walletQuery.data?.wallet) setWallet(walletQuery.data.wallet);
  }, [walletQuery.data, setWallet]);

  const projectsQuery = useQuery({
    queryKey: ['projects', 'home'],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { per_page: 3 } });
      return data.data.items ?? [];
    },
  });

  const wallet = walletQuery.data?.wallet;
  const todayProfit = walletQuery.data?.today_profit ?? 0;
  const projects = projectsQuery.data ?? [];
  const firstName = (user?.name ?? 'Investor').split(' ')[0];
  const checkin = checkinQuery.data;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">Halo, {firstName}!</h1>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
          Mari pantau perkembangan investasimu hari ini.
        </p>
      </section>

      {/* Check-in Card */}
      {checkinQuery.data && (
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-container p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-on-primary">
                  <CalendarCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">Check-in Harian</p>
                  <p className="text-2xl font-bold text-white">
                    {checkin.checked_in_today ? 'Selesai' : 'Tersedia'}
                  </p>
                </div>
              </div>
              {checkin.checked_in_today ? (
                <div className="text-right">
                  <p className="text-xs text-white/60">Streak</p>
                  <p className="text-xl font-bold text-white">{checkin.current_streak} hari</p>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => checkinMutation.mutate()}
                  loading={checkinMutation.isPending}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  <Sparkles size={16} className="mr-1" />
                  Check-in
                </Button>
              )}
            </div>
            {checkinMutation.data && (
              <div className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm text-white">
                {checkinMutation.data.message}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-5 py-3 bg-surface-container-low text-sm">
            <span className="text-on-surface-variant">Total check-in</span>
            <span className="font-semibold text-primary">{checkin.total_checkins} hari</span>
          </div>
        </Card>
      )}

      {walletQuery.isLoading ? (
        <Spinner />
      ) : walletQuery.error ? (
        <Alert tone="error">Gagal memuat saldo: {extractErrorMessage(walletQuery.error)}</Alert>
      ) : wallet ? (
        <WalletCard wallet={wallet} todayProfit={todayProfit} />
      ) : null}

      <QuickActions />

      <Section title="Proyek Tersedia" to="/projects">
        {projectsQuery.isLoading ? (
          <Spinner />
        ) : projectsQuery.error ? (
          <Alert tone="error">Gagal memuat proyek: {extractErrorMessage(projectsQuery.error)}</Alert>
        ) : projects.length === 0 ? (
          <Card>
            <EmptyState
              icon={FolderOpen}
              title="Belum ada proyek"
              description="Proyek investasi baru akan segera hadir."
            />
          </Card>
        ) : (
          <div className="space-y-5">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
