import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Leaf } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Leaf size={30} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar Akun Baru</h1>
          <p className="mt-1 text-sm text-slate-500">Mulai investasi di UMKM Indonesia</p>
        </div>

        <Card className="p-6">
          {formError && <Alert className="mb-4">{formError}</Alert>}
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nama Lengkap" required error={errors.name?.message}>
              <Input placeholder="Nama anda" {...register('name')} />
            </Field>
            <Field label="Nomor HP" required error={errors.phone?.message}>
              <Input placeholder="08xxxxxxxxxx" inputMode="numeric" {...register('phone')} />
            </Field>
            <Field label="Password" required error={errors.password?.message}>
              <Input type="password" placeholder="Minimal 8 karakter" {...register('password')} />
            </Field>
            <Field label="Konfirmasi Password" required error={errors.password_confirmation?.message}>
              <Input type="password" placeholder="Ulangi password" {...register('password_confirmation')} />
            </Field>
            <Field label="PIN Transaksi" required hint="6 digit angka untuk konfirmasi transaksi" error={errors.pin?.message}>
              <Input inputMode="numeric" maxLength={6} placeholder="123456" {...register('pin')} />
            </Field>
            <Field label="Kode Referral (opsional)" error={errors.referral_code?.message}>
              <Input placeholder="Contoh: ABC12345" {...register('referral_code')} />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Daftar
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
