import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Leaf, Lock, Phone, User, KeyRound, Gift } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Button, Card, Field, Input, Alert } from '../components/ui';

const schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  phone: z.string().min(9, 'Nomor HP tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
  pin: z.string().regex(/^\d{6}$/, 'PIN harus 6 digit angka'),
  referral_code: z.string().optional(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', values);
      setAuth(data.data);
      toast.success('Registrasi berhasil.');
      navigate('/', { replace: true });
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4 py-8"
      style={{
        backgroundImage: 'radial-gradient(#e0e3e5 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
            <Leaf size={30} />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary">Daftar Akun</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Mulai investasi di UMKM Indonesia</p>
        </div>

        <Card className="p-6 md:p-8">
          {formError && <Alert className="mb-4">{formError}</Alert>}
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nama Lengkap" required error={errors.name?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <User size={18} />
                </span>
                <Input placeholder="Nama anda" className="pl-10" {...register('name')} />
              </div>
            </Field>
            <Field label="Nomor HP" required error={errors.phone?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Phone size={18} />
                </span>
                <Input placeholder="08xxxxxxxxxx" inputMode="numeric" className="pl-10" {...register('phone')} />
              </div>
            </Field>
            <Field label="Password" required error={errors.password?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Lock size={18} />
                </span>
                <Input type="password" placeholder="Minimal 8 karakter" className="pl-10" {...register('password')} />
              </div>
            </Field>
            <Field label="Konfirmasi Password" required error={errors.password_confirmation?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Lock size={18} />
                </span>
                <Input type="password" placeholder="Ulangi password" className="pl-10" {...register('password_confirmation')} />
              </div>
            </Field>
            <Field label="PIN Transaksi" required hint="6 digit angka untuk konfirmasi transaksi" error={errors.pin?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <KeyRound size={18} />
                </span>
                <Input inputMode="numeric" maxLength={6} placeholder="123456" className="pl-10" {...register('pin')} />
              </div>
            </Field>
            <Field label="Kode Referral (opsional)" error={errors.referral_code?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Gift size={18} />
                </span>
                <Input placeholder="Contoh: ABC12345" className="pl-10" {...register('referral_code')} />
              </div>
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Daftar
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
