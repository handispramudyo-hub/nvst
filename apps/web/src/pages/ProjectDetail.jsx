import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Cpu,
  FolderOpen,
  Leaf,
  Percent,
  ShieldAlert,
  Store,
  Wallet,
  Zap,
} from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { rupiah, formatDate, formatPercent, makeIdempotencyKey } from '../lib/format';
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  ProgressBar,
  Spinner,
  StatusBadge,
} from '../components/ui';

const RISK_LABELS = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
};

const RISK_TONES = {
  low: 'green',
  medium: 'amber',
  high: 'red',
};

const CATEGORY_GRAD = {
  Agrikultur: 'from-emerald-500 to-green-600',
  Energi: 'from-amber-400 to-orange-500',
  Properti: 'from-sky-500 to-blue-600',
  Teknologi: 'from-violet-500 to-purple-600',
  UMKM: 'from-primary to-primary-container',
};

function HeroImage({ project }) {
  const CatIcon = { Agrikultur: Leaf, Energi: Zap, Properti: Building2, Teknologi: Cpu }[project.category] ?? Store;
  if (project.image) return <img src={project.image} alt={project.name} className="h-56 w-full object-cover" />;
  return (
    <div className={`flex h-56 w-full items-center justify-center bg-gradient-to-br ${CATEGORY_GRAD[project.category] ?? CATEGORY_GRAD.UMKM}`}>
      <CatIcon size={64} className="text-white/80" />
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-outline-variant/10 bg-surface-container-low p-3">
      <p className="flex items-center gap-1 text-[11px] text-on-surface-variant">
        {Icon && <Icon size={13} className="text-secondary" />}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-primary">{value}</p>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [created, setCreated] = useState(null);

  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const project = projectQuery.data;

  const investMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.post('/investments', {
        project_id: Number(id),
        amount: values.amount,
        pin: values.pin,
        idempotency_key: makeIdempotencyKey('inv'),
      });
      return data.data;
    },
    onSuccess: (investment) => {
      setCreated(investment);
      setAmount('');
      setPin('');
      toast.success('Investasi berhasil dibuat.');
      queryClient.invalidateQueries({ queryKey: ['investments-summary'] });
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const amountNum = Number(amount) || 0;
  const expectedReturn = project ? (amountNum * (project.estimated_return ?? 0)) / 100 : 0;
  const durationDays = project?.duration_days || 1;
  const monthlyReturn = expectedReturn / Math.max(1, durationDays / 30);

  const belowMin = project ? amountNum > 0 && amountNum < project.min_investment : false;
  const aboveMax = project ? amountNum > project.max_investment : false;

  const onSubmit = (e) => {
    e.preventDefault();
    investMutation.mutate({ amount: amountNum, pin });
  };

  if (projectQuery.isLoading) {
    return <Spinner />;
  }

  if (projectQuery.error) {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Proyek tidak ditemukan"
        description={extractErrorMessage(projectQuery.error)}
        action={
          <Link to="/projects">
            <Button variant="secondary">Kembali ke Daftar Proyek</Button>
          </Link>
        }
      />
    );
  }

  const formDisabled = created || !project.is_investable;

  return (
    <div className="space-y-5">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm font-semibold text-on-surface-variant hover:text-primary"
      >
        <ArrowLeft size={16} />
        Kembali ke Proyek
      </Link>

      <div className="overflow-hidden rounded-2xl shadow-float">
        <HeroImage project={project} />
        <div className="-mt-8 rounded-t-[32px] bg-surface p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="blue">{project.category ?? 'Umum'}</Badge>
            <StatusBadge status={project.status} />
            <Badge tone={RISK_TONES[project.risk_level] ?? 'slate'}>
              Risiko {RISK_LABELS[project.risk_level] ?? project.risk_level}
            </Badge>
            {project.is_featured && <Badge tone="violet">Featured</Badge>}
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary">
            {project.name}
          </h1>

          <div className="mt-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] text-on-surface-variant">Terkumpul</p>
                <p className="font-financial-data text-financial-data font-semibold text-primary tabular-nums">
                  {rupiah(project.current_funding)}{' '}
                  <span className="text-xs font-normal text-on-surface-variant">dari {rupiah(project.funding_target)}</span>
                </p>
              </div>
              <p className="text-sm font-bold text-secondary tabular-nums">{formatPercent(project.funding_progress)}</p>
            </div>
            <ProgressBar value={project.funding_progress} className="mt-2" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat icon={Percent} label="Estimasi Return" value={`${formatPercent(project.estimated_return)} p.a.`} />
            <Stat icon={Clock} label="Durasi" value={`${project.duration_days} hari`} />
            <Stat icon={Wallet} label="Min. Investasi" value={rupiah(project.min_investment)} />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-outline-variant/20 pt-4 text-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={16} className="text-outline" />
              Mulai: {formatDate(project.start_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={16} className="text-outline" />
              Berakhir: {formatDate(project.end_date)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="text-base font-semibold text-primary">Deskripsi Proyek</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{project.description}</p>
          </Card>

          {project.terms && (
            <Card className="p-5">
              <h3 className="text-base font-semibold text-primary">Syarat &amp; Ketentuan</h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">{project.terms}</p>
            </Card>
          )}

          {project.risk_disclosure && (
            <Alert tone="warning">
              <div className="flex items-start gap-2">
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Risiko Investasi</p>
                  <p className="mt-1 whitespace-pre-line">{project.risk_disclosure}</p>
                </div>
              </div>
            </Alert>
          )}
        </div>

        <div className="space-y-5">
          {amountNum > 0 && !formDisabled && (
            <div className="relative overflow-hidden rounded-2xl bg-primary-container p-5 shadow-float">
              <div
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')",
                }}
              />
              <div className="relative z-10">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-fixed-dim">
                  Simulasi Keuntungan
                </p>
                <div className="space-y-2 font-financial-data text-financial-data">
                  <div className="flex items-center justify-between text-primary-fixed-dim">
                    <span>Estimasi return ({formatPercent(project.estimated_return)})</span>
                    <b className="text-secondary-fixed tabular-nums">{rupiah(expectedReturn)}</b>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2 text-primary-fixed-dim">
                    <span>Per bulan</span>
                    <b className="text-secondary-fixed tabular-nums">{rupiah(monthlyReturn)}</b>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <span className="text-primary-fixed">Modal + Return</span>
                    <b className="text-on-primary tabular-nums">{rupiah(amountNum + expectedReturn)}</b>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card className="p-5" id="investasi">
            <h3 className="text-base font-semibold text-primary">Mulai Investasi</h3>

            {created ? (
              <div className="mt-4">
                <Alert tone="success">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Investasi berhasil dibuat!</p>
                      <p className="mt-1 text-xs">{created.investment_no}</p>
                      <p className="mt-1 text-xs">{rupiah(created.amount)}</p>
                    </div>
                  </div>
                </Alert>
                <Link to="/portfolio">
                  <Button className="mt-4 w-full">Lihat Portofolio</Button>
                </Link>
              </div>
            ) : !project.is_investable ? (
              <Alert tone="info" className="mt-4">
                Proyek tidak tersedia untuk investasi.
              </Alert>
            ) : (
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <Field
                  label="Jumlah Investasi"
                  required
                  hint={`Minimal ${rupiah(project.min_investment)} - Maksimal ${rupiah(project.max_investment)}`}
                  error={
                    belowMin
                      ? 'Jumlah kurang dari minimal investasi.'
                      : aboveMax
                        ? 'Jumlah melebihi maksimal investasi.'
                        : undefined
                  }
                >
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={project.min_investment}
                    placeholder="Masukkan jumlah"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </Field>

                <Field
                  label="PIN Transaksi"
                  required
                  hint="6 digit angka"
                  error={pin && !/^\d{6}$/.test(pin) ? 'PIN harus 6 digit angka' : undefined}
                >
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  />
                </Field>

                <Button
                  type="submit"
                  loading={investMutation.isPending}
                  disabled={amountNum <= 0 || belowMin || aboveMax || !/^\d{6}$/.test(pin)}
                  className="w-full"
                >
                  Investasi Sekarang
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
