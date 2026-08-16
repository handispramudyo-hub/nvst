import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { extractErrorMessage } from '@/lib/api';
import { loginRequest, useAuthStore } from '@/store/auth';

const schema = z.object({
  phone: z.string().min(9, 'Nomor HP tidak valid').max(16, 'Nomor HP terlalu panjang'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { data } = await loginRequest({ ...values, device_name: 'nivest-mobile' });
      setSession(data.data);
      router.replace('/');
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.hero}>
          <View style={styles.logo} />
          <Text style={[styles.brand, { color: theme.text }]}>NiVEST</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Investasi digital terpercaya untuk masa depan anda
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input
                label="Nomor HP"
                placeholder="contoh: 081234567890"
                keyboardType="phone-pad"
                autoCapitalize="none"
                value={field.value}
                onChangeText={field.onChange}
                error={errors.phone?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Password"
                placeholder="Masukkan password"
                secureTextEntry
                value={field.value}
                onChangeText={field.onChange}
                error={errors.password?.message}
              />
            )}
          />

          {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}

          <Button title="Masuk" onPress={onSubmit} loading={submitting} size="lg" />

          <View style={styles.footerRow}>
            <Link href="/forgot-password" style={styles.link}>
              Lupa password?
            </Link>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Belum punya akun?</Text>
          <Link href="/register" style={styles.registerLink}>
            Daftar Sekarang
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.six,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    marginBottom: Spacing.two,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
  form: {
    gap: Spacing.three,
  },
  error: {
    fontSize: 13,
  },
  footerRow: {
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  link: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    gap: Spacing.one,
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
});
