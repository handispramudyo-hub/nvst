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
  phone: z.string().min(9, 'Nomor HP tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function Login() {
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
      const { data } = await api.post('/auth/login', values);
      setAuth(data.data);
      try {
        const { data: profile } = await api.get('/profile');
        useAuthStore.getState().setWallet(profile.data.wallet);
      } catch {
        // profil gagal dimuat tidak memblokir login
      }
      toast.success('Login berhasil.');
      navigate('/', { replace: true });
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <Leaf size={30} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Masuk ke NiVEST</h1>
          <p className="mt-1 text-sm text-slate-500">Kelola investasi UMKM anda</p>
        </div>

        <Card className="p-6">
          {formError && <Alert className="mb-4">{formError}</Alert>}
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nomor HP" required error={errors.phone?.message}>
              <Input placeholder="08xxxxxxxxxx" inputMode="numeric" {...register('phone')} />
            </Field>
            <Field label="Password" required error={errors.password?.message}>
              <Input type="password" placeholder="••••••••" {...register('password')} />
            </Field>
            <Button type="submit" loading={loading} className="w-full">
              Masuk
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate-500">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
