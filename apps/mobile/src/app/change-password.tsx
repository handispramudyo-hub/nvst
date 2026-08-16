import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUpdatePassword } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';

const schema = z
  .object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi'),
    password: z.string().min(8, 'Password baru minimal 8 karakter'),
    password_confirmation: z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: 'Konfirmasi password tidak cocok',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
  const theme = useTheme();
  const updatePassword = useUpdatePassword();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePassword.mutateAsync(values);
      reset();
      Alert.alert('Berhasil', 'Password berhasil diubah. Silakan login kembali dengan password baru.');
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  });

  const field = (name: keyof FormValues, label: string, placeholder?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => (
        <Input
          label={label}
          secureTextEntry
          placeholder={placeholder}
          value={f.value}
          onChangeText={f.onChange}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Ubah Password" />
      <View style={styles.form}>
        {field('current_password', 'Password Saat Ini')}
        {field('password', 'Password Baru', 'Minimal 8 karakter')}
        {field('password_confirmation', 'Konfirmasi Password Baru')}
        {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
        <Button title="Simpan Password" onPress={onSubmit} loading={updatePassword.isPending} size="lg" />
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
});
