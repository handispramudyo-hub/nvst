import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { extractErrorMessage } from '@/lib/api';
import { registerRequest, useAuthStore } from '@/store/auth';

const schema = z
  .object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    phone: z.string().regex(/^08[0-9]{8,12}$/, 'Format nomor HP tidak valid. Gunakan 08xxxxxxxxxx'),
    referral_code: z.string().max(10).optional(),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    password_confirmation: z.string(),
    pin: z.string().regex(/^\d{6}$/, 'PIN harus 6 digit angka'),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams<{ ref?: string }>();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      referral_code: params.ref ?? '',
      password: '',
      password_confirmation: '',
      pin: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    try {
      const { data } = await registerRequest({
        name: values.name,
        phone: values.phone,
        password: values.password,
        pin: values.pin,
        referral_code: values.referral_code || undefined,
      });
      setSession(data.data);
      router.replace('/');
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  });

  const field = (
    name: keyof FormValues,
    label: string,
    props: { keyboardType?: 'phone-pad' | 'number-pad'; secureTextEntry?: boolean; placeholder?: string; autoCapitalize?: 'none' | 'words' },
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => (
        <Input
          label={label}
          placeholder={props.placeholder}
          keyboardType={props.keyboardType}
          secureTextEntry={props.secureTextEntry}
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
      <ScreenHeader title="Daftar Akun" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.form}>
          {field('name', 'Nama Lengkap', { placeholder: 'Nama sesuai KTP', autoCapitalize: 'words' })}
          {field('phone', 'Nomor HP', { placeholder: '08xxxxxxxxxx', keyboardType: 'phone-pad' })}
          {field('referral_code', 'Kode Referral (opsional)', { autoCapitalize: 'none' })}
          {field('password', 'Password', { secureTextEntry: true, placeholder: 'Minimal 8 karakter' })}
          {field('password_confirmation', 'Konfirmasi Password', { secureTextEntry: true })}
          {field('pin', 'PIN 6 Digit', { secureTextEntry: true, keyboardType: 'number-pad' })}

          <Text style={[styles.hint, { color: theme.textSecondary }]}>
            PIN digunakan untuk verifikasi transaksi investasi dan penarikan dana.
          </Text>

          {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}

          <Button title="Daftar" onPress={onSubmit} loading={submitting} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    fontSize: 13,
  },
});
