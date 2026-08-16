import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { api, extractErrorMessage } from '@/lib/api';

const schema = z
  .object({
    phone: z.string().regex(/^08[0-9]{8,12}$/, 'Format nomor HP tidak valid'),
    token: z.string().min(8, 'Token tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', token: '', password: '', password_confirmation: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/auth/reset-password', values);
      setDone(true);
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  });

  if (done) {
    return (
      <Screen>
        <ScreenHeader title="Password Direset" />
        <View style={styles.doneBox}>
          <Text style={[styles.doneTitle, { color: theme.success }]}>Berhasil</Text>
          <Text style={[styles.doneText, { color: theme.textSecondary }]}>
            Password anda berhasil direset. Silakan login kembali dengan password baru.
          </Text>
          <Button title="Ke Halaman Login" onPress={() => router.replace('/login')} />
        </View>
      </Screen>
    );
  }

  const field = (
    name: keyof FormValues,
    label: string,
    props: { secureTextEntry?: boolean; keyboardType?: 'phone-pad'; placeholder?: string; autoCapitalize?: 'none' },
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => (
        <Input
          label={label}
          placeholder={props.placeholder}
          secureTextEntry={props.secureTextEntry}
          keyboardType={props.keyboardType}
          autoCapitalize={props.autoCapitalize}
          value={f.value}
          onChangeText={f.onChange}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Reset Password" />
      <View style={styles.form}>
        {field('phone', 'Nomor HP', { keyboardType: 'phone-pad', autoCapitalize: 'none' })}
        {field('token', 'Token Reset', { autoCapitalize: 'none', placeholder: 'Tempel token dari langkah sebelumnya' })}
        {field('password', 'Password Baru', { secureTextEntry: true, placeholder: 'Minimal 8 karakter' })}
        {field('password_confirmation', 'Konfirmasi Password Baru', { secureTextEntry: true })}

        {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}

        <Button title="Reset Password" onPress={onSubmit} loading={submitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  error: {
    fontSize: 13,
  },
  doneBox: {
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  doneTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  doneText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
