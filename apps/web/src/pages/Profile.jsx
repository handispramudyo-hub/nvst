import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, KeyRound, Lock, UserRound } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '../components/ui';

function Initials({ name }) {
  const parts = (name ?? 'U').trim().split(/\s+/);
  const initial = (parts[0]?.[0] ?? 'U') + (parts[1]?.[0] ?? '');
  return initial.toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setWallet = useAuthStore((s) => s.setWallet);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [pinCurrentPassword, setPinCurrentPassword] = useState('');
  const [pin, setPin] = useState('');

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get('/profile');
      return data.data;
    },
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (profile) {
      setName(profile.user?.name ?? '');
      setEmail(profile.user?.email ?? '');
      if (profile.wallet) setWallet(profile.wallet);
    }
  }, [profileQuery.data, setWallet]);

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.put('/profile', values);
      return data.data;
    },
    onSuccess: (user) => {
      setUser(user);
      toast.success('Profil berhasil diperbarui.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.put('/profile/password', values);
      return data;
    },
    onSuccess: () => {
      toast.success('Password berhasil diubah. Silakan login kembali.');
      setCurrentPassword('');
      setPassword('');
      setPasswordConfirmation('');
      logout();
      navigate('/login', { replace: true });
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const pinMutation = useMutation({
    mutationFn: async (values) => {
      const { data } = await api.put('/profile/pin', values);
      return data;
    },
    onSuccess: () => {
      toast.success('PIN berhasil diubah.');
      setPinCurrentPassword('');
      setPin('');
    },
    onError: (e) => {
      toast.error(extractErrorMessage(e));
    },
  });

  const profile = profileQuery.data;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    updateMutation.mutate({ name, email: email || null });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    passwordMutation.mutate({
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation,
    });
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    pinMutation.mutate({ current_password: pinCurrentPassword, pin });
  };

  if (profileQuery.isLoading) {
    return <Spinner />;
  }

  if (profileQuery.error) {
    return <Alert tone="error">Gagal memuat profil: {extractErrorMessage(profileQuery.error)}</Alert>;
  }

  const profileUser = profile?.user;

  return (
    <div className="space-y-5">
      <PageHeader title="Profil Saya" description="Kelola data pribadi, password, dan PIN transaksi" />

      <Card className="overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary-container to-secondary" />
        <div className="-mt-9 px-6 pb-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-4 border-surface-container-lowest bg-primary-container font-display text-2xl font-bold text-primary-fixed">
              <Initials name={profileUser?.name} />
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-headline-md text-headline-md text-primary">
                {profileUser?.name}
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/40 px-2 py-0.5 text-xs font-semibold text-on-secondary-container">
                  <CheckCircle2 size={12} />
                  Terverifikasi
                </span>
              </p>
              <p className="text-sm text-on-surface-variant">{profileUser?.phone}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px border-t border-outline-variant/20 bg-outline-variant/10 sm:grid-cols-4">
          <div className="bg-surface-container-lowest px-6 py-4">
            <p className="text-xs text-on-surface-variant">Email</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-primary">{profileUser?.email ?? '-'}</p>
          </div>
          <div className="bg-surface-container-lowest px-6 py-4">
            <p className="text-xs text-on-surface-variant">Kode Referral</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-primary">{profileUser?.referral_code ?? '-'}</p>
          </div>
          <div className="bg-surface-container-lowest px-6 py-4">
            <p className="text-xs text-on-surface-variant">Total Deposit</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-secondary">{profile?.wallet?.total_deposited ?? 0}</p>
          </div>
          <div className="bg-surface-container-lowest px-6 py-4">
            <p className="text-xs text-on-surface-variant">Total Investasi</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-secondary">{profile?.wallet?.total_invested ?? 0}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2">
          <UserRound size={18} className="text-secondary" />
          <h3 className="text-base font-semibold text-primary">Ubah Data Profil</h3>
        </div>
        <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
          <Field label="Nama Lengkap" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" hint="Kosongkan jika tidak ingin mengisi">
            <Input type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Button type="submit" loading={updateMutation.isPending} disabled={!name} className="w-full">
            Simpan Perubahan
          </Button>
        </form>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-secondary" />
            <h3 className="text-base font-semibold text-primary">Ubah Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <Field label="Password Saat Ini" required>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </Field>
            <Field label="Password Baru" required hint="Minimal 8 karakter">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            <Field
              label="Konfirmasi Password Baru"
              required
              error={passwordConfirmation && password !== passwordConfirmation ? 'Konfirmasi password tidak cocok' : undefined}
            >
              <Input type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} />
            </Field>
            <Button
              type="submit"
              loading={passwordMutation.isPending}
              disabled={!currentPassword || password.length < 8 || password !== passwordConfirmation}
              className="w-full"
            >
              Ubah Password
            </Button>
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <KeyRound size={18} className="text-secondary" />
            <h3 className="text-base font-semibold text-primary">Ubah PIN Transaksi</h3>
          </div>
          <form onSubmit={handleChangePin} className="mt-4 space-y-4">
            <Field label="Password Saat Ini" required>
              <Input type="password" value={pinCurrentPassword} onChange={(e) => setPinCurrentPassword(e.target.value)} />
            </Field>
            <Field
              label="PIN Baru"
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
              loading={pinMutation.isPending}
              disabled={!pinCurrentPassword || !/^\d{6}$/.test(pin)}
              className="w-full"
            >
              Ubah PIN
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
