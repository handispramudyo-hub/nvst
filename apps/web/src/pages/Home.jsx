import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Alert, Card, EmptyState, Spinner } from '../components/ui';
import WalletCard from '../components/WalletCard';
import QuickActions from '../components/QuickActions';
import ProjectCard from '../components/ProjectCard';
import Section from '../components/Section';

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const setWallet = useAuthStore((s) => s.setWallet);

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data } = await api.get('/wallet');
      return data.data;
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

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Halo, {firstName}!
        </h1>
        <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
          Mari pantau perkembangan investasimu hari ini.
        </p>
      </section>

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
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
