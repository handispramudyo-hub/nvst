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
import { useUpdatePin } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';

const schema = z.object({
  current_password: z.string().min(1, 'Password wajib diisi untuk verifikasi'),
  pin: z.string().regex(/^\d{6}$/, 'PIN baru harus 6 digit angka'),
});

type FormValues = z.infer<typeof schema>;

export default function ChangePinScreen() {
  const theme = useTheme();
  const updatePin = useUpdatePin();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { current_password: '', pin: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await updatePin.mutateAsync(values);
      reset();
      Alert.alert('Berhasil', 'PIN berhasil diubah. Gunakan PIN baru untuk transaksi berikutnya.');
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  });

  const field = (name: keyof FormValues, label: string, opts: { secureTextEntry?: boolean; keyboardType?: 'number-pad' } = {}) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f }) => (
        <Input
          label={label}
          secureTextEntry={opts.secureTextEntry}
          keyboardType={opts.keyboardType}
          value={f.value}
          onChangeText={f.onChange}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <Screen>
      <ScreenHeader title="Ubah PIN" />
      <View style={styles.form}>
        {field('current_password', 'Password (verifikasi)', { secureTextEntry: true })}
        {field('pin', 'PIN Baru (6 digit)', { secureTextEntry: true, keyboardType: 'number-pad' })}
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          PIN digunakan untuk verifikasi transaksi investasi dan penarikan dana.
        </Text>
        {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
        <Button title="Simpan PIN" onPress={onSubmit} loading={updatePin.isPending} size="lg" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
