import { Link } from 'react-router-dom';
import { Building2, ChevronRight, Cpu, Leaf, ShieldAlert, ShieldCheck, ShieldMinus, Store, TrendingUp, Zap } from 'lucide-react';
import { rupiah } from '../lib/format';

const RISK = {
  low: { label: 'Rendah', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: 'Sedang', icon: ShieldMinus, color: 'text-amber-600', bg: 'bg-amber-50' },
  high: { label: 'Tinggi', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
};

const CATEGORY = {
  Agrikultur: { icon: Leaf, grad: 'from-emerald-500 to-green-600' },
  Energi: { icon: Zap, grad: 'from-amber-400 to-orange-500' },
  Properti: { icon: Building2, grad: 'from-sky-500 to-blue-600' },
  Teknologi: { icon: Cpu, grad: 'from-violet-500 to-purple-600' },
  UMKM: { icon: Store, grad: 'from-primary-500 to-primary-700' },
};

function Stat({ label, value, icon }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="flex items-center gap-1 text-sm font-bold text-slate-900">
        {icon}
        <span className="truncate">{value}</span>
      </span>
    </div>
  );
}

export default function ProjectCard({ project }) {
  const risk = RISK[project.risk_level] ?? RISK.medium;
  const RiskIcon = risk.icon;
  const cat = CATEGORY[project.category] ?? { icon: Store, grad: 'from-primary-500 to-primary-700' };
  const CatIcon = cat.icon;

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
        <div className={`relative flex items-end justify-between bg-gradient-to-br ${cat.grad} px-4 pb-3 pt-4`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur">
            <CatIcon size={20} />
          </div>
          {project.is_featured && (
            <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
              Featured
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div className="space-y-1">
            <h3 className="truncate text-[17px] font-extrabold text-slate-900">{project.name}</h3>
            <div className="flex gap-1">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {project.category ?? 'Umum'}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${risk.bg} ${risk.color}`}>
                Risiko {risk.label}
              </span>
            </div>
          </div>

          <div className="flex justify-between gap-2">
            <Stat label="Estimasi Return" value={`${project.estimated_return}%`} icon={<TrendingUp size={14} className="text-emerald-600" />} />
            <Stat label="Durasi" value={`${project.duration_days} hari`} />
            <Stat label="Min. Investasi" value={rupiah(project.min_investment)} />
          </div>

          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600"
                style={{ width: `${Math.min(100, Number(project.funding_progress) || 0)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">{project.funding_progress}% terkumpul</p>
          </div>

          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${risk.bg} ${risk.color}`}>
              <RiskIcon size={14} />
              Risiko {risk.label}
            </span>
            <span className="flex items-center gap-0.5 text-[13px] font-semibold text-slate-800">
              {project.is_investable ? 'Buka Detail' : 'Tutup'}
              <ChevronRight size={16} className="text-slate-400" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
