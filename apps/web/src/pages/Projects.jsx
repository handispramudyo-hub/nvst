import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, SlidersHorizontal } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { Alert, Button, EmptyState, PageHeader, Select, Spinner } from '../components/ui';
import ProjectCard from '../components/ProjectCard';

const PROJECT_STATUS_LABELS = {
  open: 'Terbuka',
  funding: 'Pendanaan',
  fully_funded: 'Dana Penuh',
  active: 'Berjalan',
  completed: 'Selesai',
  closed: 'Ditutup',
  draft: 'Draf',
};

export default function Projects() {
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');

  const projectsQuery = useQuery({
    queryKey: ['projects', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/projects', { params: { per_page: 50 } });
      return data.data.items ?? [];
    },
  });

  const projects = projectsQuery.data ?? [];

  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
  const statuses = [...new Set(projects.map((p) => p.status).filter(Boolean))];

  const filtered = projects.filter(
    (p) => (!category || p.category === category) && (!status || p.status === status),
  );

  const resetFilters = () => {
    setCategory('');
    setStatus('');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Proyek Investasi"
        description="Pilih proyek UMKM yang paling sesuai dengan tujuan investasi anda"
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <SlidersHorizontal size={16} />
          <span className="text-sm font-medium">Filter:</span>
        </div>
        <div className="w-full">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {PROJECT_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-sm text-outline">{filtered.length} proyek</p>
      </div>

      {projectsQuery.isLoading ? (
        <Spinner />
      ) : projectsQuery.error ? (
        <Alert tone="error">Gagal memuat proyek: {extractErrorMessage(projectsQuery.error)}</Alert>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Tidak ada proyek"
          description="Coba ubah filter kategori atau status untuk menemukan proyek lain."
          action={
            <Button variant="secondary" onClick={resetFilters}>
              Reset Filter
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}
