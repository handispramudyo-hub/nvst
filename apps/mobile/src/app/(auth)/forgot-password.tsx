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

const schema = z.object({
  phone: z.string().regex(/^08[0-9]{8,12}$/, 'Format nomor HP tidak valid'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { phone: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);
    setResetToken(null);
    try {
      const { data } = await api.post<{ data: { reset_token: string } | null; message: string }>(
        '/auth/forgot-password',
        values,
      );
      if (data.data?.reset_token) {
        setResetToken(data.data.reset_token);
      }
    } catch (e) {
      setFormError(extractErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <Screen>
      <ScreenHeader title="Lupa Password" />
      <View style={styles.form}>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Input
              label="Nomor HP"
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.phone?.message}
            />
          )}
        />

        {resetToken ? (
          <View style={[styles.tokenBox, { backgroundColor: theme.infoLight }]}>
            <Text style={[styles.tokenLabel, { color: theme.info }]}>Token reset (mode development):</Text>
            <Text style={[styles.tokenValue, { color: theme.text }]}>{resetToken}</Text>
            <Button title="Lanjut ke Reset Password" onPress={() => router.push('/reset-password')} variant="primary" />
          </View>
        ) : null}

        {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}

        <Button title="Kirim Instruksi Reset" onPress={onSubmit} loading={submitting} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  tokenBox: {
    padding: Spacing.three,
    borderRadius: 12,
    gap: Spacing.two,
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tokenValue: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'monospace',
    marginBottom: Spacing.two,
  },
  error: {
    fontSize: 13,
  },
});
