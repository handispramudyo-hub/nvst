import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, UserX, KeyRound, Wallet, Users, TrendingUp, Landmark, HandCoins } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import {
  PageHeader,
  Card,
  Button,
  Input,
  Field,
  Modal,
  Badge,
  Spinner,
  Alert,
  StatCard,
  ConfirmDialog,
} from '../components/ui';
import { rupiah, formatNumber, formatDateTime } from '../lib/format';

const resetSchema = z
  .object({
    password: z.string().min(8, 'Minimal 8 karakter'),
    password_confirmation: z.string().min(8, 'Minimal 8 karakter'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  });

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showReset, setShowReset] = useState(false);
  const [showToggle, setShowToggle] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => (await api.get(`/admin/users/${id}`)).data.data,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetSchema) });

  const toggle = useMutation({
    mutationFn: (isActive) => api.put(`/admin/users/${id}/status`, { is_active: isActive }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setShowToggle(false);
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const resetPassword = useMutation({
    mutationFn: (values) => api.post(`/admin/users/${id}/reset-password`, values),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setShowReset(false);
      reset();
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (isError) return <Alert>{extractErrorMessage(error)}</Alert>;
  if (isLoading || !data) return <Spinner />;

  const { user, wallet } = data;
  const stats = [
    { label: 'Referral', value: formatNumber(data.referrals_count), icon: Users, tone: 'primary' },
    { label: 'Investasi', value: formatNumber(data.investments_count), icon: TrendingUp, tone: 'violet' },
    { label: 'Deposit', value: formatNumber(data.deposits_count), icon: Landmark, tone: 'blue' },
    { label: 'Penarikan', value: formatNumber(data.withdrawals_count), icon: HandCoins, tone: 'amber' },
  ];

  return (
    <div>
      <PageHeader
        title={user.name || `Pengguna #${user.id}`}
        description={`Terdaftar ${formatDateTime(user.created_at)}`}
        actions={
          <Button variant="outline" onClick={() => navigate('/users')}>
            <ArrowLeft size={16} />
            Kembali
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} tone={s.tone} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800">Informasi Pengguna</h3>
            <Badge tone={user.is_active ? 'green' : 'red'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-slate-400">Nama</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Nomor HP</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user.phone || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Email</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user.email || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Kode Referral</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{user.referral_code || '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">Role</dt>
              <dd className="mt-0.5 font-medium text-slate-800">{(user.roles ?? []).join(', ') || 'Pengguna'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-400">No. HP Terverifikasi</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {user.phone_verified_at ? formatDateTime(user.phone_verified_at) : 'Belum'}
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => setShowToggle(true)}>
              {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
              {user.is_active ? 'Suspend Pengguna' : 'Aktifkan Pengguna'}
            </Button>
            <Button variant="outline" onClick={() => setShowReset(true)}>
              <KeyRound size={16} />
              Reset Password
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Wallet size={18} />
            </div>
            <h3 className="text-base font-semibold text-slate-800">Wallet</h3>
          </div>
          <dl className="space-y-3 text-sm">
            {[
              ['Saldo', rupiah(wallet?.balance)],
              ['Total Deposit', rupiah(wallet?.total_deposited)],
              ['Total Investasi', rupiah(wallet?.total_invested)],
              ['Total Penarikan', rupiah(wallet?.total_withdrawn)],
              ['Total Profit', rupiah(wallet?.total_profit)],
              ['Total Komisi', rupiah(wallet?.total_commission)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <ConfirmDialog
        open={showToggle}
        onClose={() => setShowToggle(false)}
        onConfirm={() => toggle.mutate(!user.is_active)}
        title={user.is_active ? 'Suspend Pengguna?' : 'Aktifkan Pengguna?'}
        description={
          user.is_active
            ? 'Pengguna tidak akan dapat login dan semua token sesi akan dicabut.'
            : 'Pengguna akan dapat login kembali dan mengakses aplikasi.'
        }
        confirmLabel={user.is_active ? 'Suspend' : 'Aktifkan'}
        tone={user.is_active ? 'danger' : 'primary'}
        loading={toggle.isPending}
      />

      <Modal open={showReset} onClose={() => setShowReset(false)} title="Reset Password Pengguna">
        <form
          onSubmit={handleSubmit((values) => resetPassword.mutate(values))}
          className="space-y-4"
        >
          <Field label="Password Baru" required error={errors.password?.message}>
            <Input type="password" placeholder="Minimal 8 karakter" {...register('password')} />
          </Field>
          <Field label="Konfirmasi Password" required error={errors.password_confirmation?.message}>
            <Input type="password" placeholder="Ulangi password" {...register('password_confirmation')} />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowReset(false)} disabled={resetPassword.isPending}>
              Batal
            </Button>
            <Button type="submit" loading={resetPassword.isPending}>
              Simpan Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
