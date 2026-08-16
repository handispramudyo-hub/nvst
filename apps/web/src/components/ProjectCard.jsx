import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Cpu, Leaf, Store, Zap } from 'lucide-react';
import { compactNumber, rupiah } from '../lib/format';

const RISK = {
  low: { label: 'Risiko Rendah', cls: 'bg-secondary-container/90 text-on-secondary-container' },
  medium: { label: 'Risiko Sedang', cls: 'bg-tertiary-fixed/90 text-tertiary-container' },
  high: { label: 'Risiko Tinggi', cls: 'bg-error-container/90 text-on-error-container' },
};

const CATEGORY = {
  Agrikultur: { icon: Leaf, grad: 'from-emerald-500 to-green-600' },
  Energi: { icon: Zap, grad: 'from-amber-400 to-orange-500' },
  Properti: { icon: Building2, grad: 'from-sky-500 to-blue-600' },
  Teknologi: { icon: Cpu, grad: 'from-violet-500 to-purple-600' },
  UMKM: { icon: Store, grad: 'from-primary to-primary-container' },
};

export default function ProjectCard({ project }) {
  const risk = RISK[project.risk_level] ?? RISK.medium;
  const cat = CATEGORY[project.category] ?? { icon: Store, grad: 'from-primary to-primary-container' };
  const CatIcon = cat.icon;
  const pct = Math.min(100, Number(project.funding_progress) || 0);

  return (
    <Link to={`/projects/${project.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border-[0.5px] border-outline-variant/20 bg-surface-container-lowest shadow-float transition-transform duration-300 hover:-translate-y-1">
        <div className="relative h-44 w-full overflow-hidden">
          {project.image ? (
            <img src={project.image} alt={project.name} className="h-full w-full object-cover" />
          ) : (
            <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${cat.grad}`}>
              <CatIcon size={44} className="text-white/80" />
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-primary backdrop-blur-md">
            {project.category ?? 'Umum'}
          </div>
          <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ${risk.cls}`}>
            {risk.label}
          </div>
          {project.is_featured && (
            <div className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-on-primary">
              Featured
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-3 truncate text-lg font-semibold text-primary">{project.name}</h3>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-2.5">
              <p className="mb-0.5 text-[11px] text-on-surface-variant">Estimasi ROI</p>
              <p className="font-financial-data text-financial-data text-secondary tabular-nums">
                {project.estimated_return}% <span className="text-xs font-normal text-on-surface-variant">p.a.</span>
              </p>
            </div>
            <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-2.5">
              <p className="mb-0.5 text-[11px] text-on-surface-variant">Durasi</p>
              <p className="font-financial-data text-financial-data text-primary tabular-nums">
                {project.duration_days} hari
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-on-surface-variant">Terkumpul</p>
                <p className="font-financial-data text-financial-data text-primary tabular-nums">
                  {compactNumber(project.current_funding)} <span className="text-xs font-normal text-on-surface-variant">/ {compactNumber(project.funding_target)}</span>
                </p>
              </div>
              <p className="text-xs font-bold text-secondary tabular-nums">{Math.round(pct)}%</p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              Min. {rupiah(project.min_investment)}
            </span>
            <span className="flex items-center gap-0.5 text-[13px] font-semibold text-primary">
              {project.is_investable ? 'Buka Detail' : 'Tutup'}
              <ChevronRight size={16} className="text-outline transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
