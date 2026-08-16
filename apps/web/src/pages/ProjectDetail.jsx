import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, FolderOpen, Percent, ShieldAlert, Wallet } from 'lucide-react';
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

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="flex items-center gap-1 text-xs text-slate-400">
        {Icon && <Icon size={14} className="text-primary-600" />}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-slate-800">{value}</p>
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

  return (
    <div className="space-y-5">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft size={16} />
        Kembali ke Proyek
      </Link>

      <div className="space-y-5">
        <Card className="p-5">
          <h1 className="text-xl font-extrabold text-slate-900">{project.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="blue">{project.category ?? 'Umum'}</Badge>
            <StatusBadge status={project.status} />
            <Badge tone={RISK_TONES[project.risk_level] ?? 'slate'}>
              Risiko {RISK_LABELS[project.risk_level] ?? project.risk_level}
            </Badge>
          </div>

          {project.image ? (
            <img src={project.image} alt={project.name} className="mt-4 w-full rounded-card object-cover" />
          ) : (
            <div className="mt-4 flex h-48 w-full items-center justify-center rounded-card bg-slate-100 text-slate-400">
              <FolderOpen size={40} />
            </div>
          )}

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Terkumpul {rupiah(project.current_funding)} dari {rupiah(project.funding_target)}
              </span>
              <span className="font-bold text-primary-600">{formatPercent(project.funding_progress)}</span>
            </div>
            <ProgressBar value={project.funding_progress} className="mt-2" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat icon={Percent} label="Estimasi Return" value={formatPercent(project.estimated_return)} />
            <Stat icon={Clock} label="Durasi" value={`${project.duration_days} hari`} />
            <Stat icon={Wallet} label="Min. Investasi" value={rupiah(project.min_investment)} />
          </div>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={16} className="text-slate-400" />
              Mulai: {formatDate(project.start_date)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays size={16} className="text-slate-400" />
              Berakhir: {formatDate(project.end_date)}
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-bold text-slate-900">Deskripsi Proyek</h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{project.description}</p>
        </Card>

        {project.terms && (
          <Card className="p-5">
            <h3 className="text-base font-bold text-slate-900">Syarat &amp; Ketentuan</h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{project.terms}</p>
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

        <Card className="p-5">
          <h3 className="text-base font-bold text-slate-900">Mulai Investasi</h3>

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

              {amountNum > 0 && (
                <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimasi return ({formatPercent(project.estimated_return)})</span>
                    <b className="text-slate-800">{rupiah(expectedReturn)}</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Per bulan</span>
                    <b className="text-slate-800">{rupiah(monthlyReturn)}</b>
                  </div>
                </div>
              )}

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
  );
}
