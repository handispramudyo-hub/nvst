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
import { useUpdateProfile } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function ProfileEditScreen() {
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);
  const setProfile = useAuthStore((s) => s.setProfile);
  const wallet = useAuthStore((s) => s.wallet);
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const updated = await updateProfile.mutateAsync({
        name: values.name,
        email: values.email || undefined,
      });
      if (wallet) {
        setProfile(updated, wallet);
      }
      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  });

  return (
    <Screen>
      <ScreenHeader title="Ubah Profil" />
      <View style={styles.form}>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              label="Nama Lengkap"
              autoCapitalize="words"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input
              label="Email (opsional)"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nama@email.com"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.email?.message}
            />
          )}
        />
        {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
        <Button title="Simpan Perubahan" onPress={onSubmit} loading={updateProfile.isPending} size="lg" />
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
