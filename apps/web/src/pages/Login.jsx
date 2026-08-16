import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Leaf, Lock, Phone } from 'lucide-react';
import { api, extractErrorMessage } from '../lib/api';
import { useAuthStore } from '../store/auth';
import { Button, Field, Input, Alert } from '../components/ui';

const schema = z.object({
  phone: z.string().min(9, 'Nomor HP tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8"
      style={{
        backgroundImage: 'radial-gradient(#e0e3e5 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      <main className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-on-primary">
            <Leaf size={30} />
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-primary">NiVEST</h1>
        </div>

        <div className="rounded-xl border border-outline-variant/30 bg-white/80 p-6 shadow-float backdrop-blur-md md:p-8">
          <div className="mb-6">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Selamat Datang Kembali</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Masuk untuk mengelola investasi Anda dengan aman.</p>
          </div>

          {formError && <Alert className="mb-4">{formError}</Alert>}

          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Nomor HP" required error={errors.phone?.message}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Phone size={18} />
                </span>
                <Input placeholder="08xxxxxxxxxx" inputMode="numeric" className="pl-10" {...register('phone')} />
              </div>
            </Field>

            <Field
              label="Kata Sandi"
              required
              error={errors.password?.message}
              hint={
                <Link to="/login" className="float-right -mt-5 text-xs text-primary hover:underline">
                  Lupa Kata Sandi?
                </Link>
              }
            >
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-outline">
                  <Lock size={18} />
                </span>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-outline transition-colors hover:text-on-surface"
                  aria-label="Tampilkan kata sandi"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <div className="pt-1">
              <Button type="submit" loading={loading} className="w-full">
                Masuk
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </main>
    </div>
  );
}
