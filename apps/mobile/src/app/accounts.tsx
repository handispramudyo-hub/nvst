import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Landmark, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateWithdrawalAccount, useDeleteWithdrawalAccount, useProfile } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import type { WithdrawalAccount } from '@/lib/types';

const schema = z.object({
  account_type: z.enum(['bank', 'ewallet']),
  provider: z.string().min(3, 'Nama bank / penyedia tidak valid'),
  account_name: z.string().min(3, 'Nama pemilik akun minimal 3 karakter'),
  account_number: z.string().min(6, 'Nomor rekening tidak valid'),
});

type FormValues = z.infer<typeof schema>;

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Rekening Bank' },
  { value: 'ewallet', label: 'E-Wallet' },
] as const;

export default function AccountsScreen() {
  const theme = useTheme();
  const { data: profile, isLoading, refetch } = useProfile();
  const createAccount = useCreateWithdrawalAccount();
  const deleteAccount = useDeleteWithdrawalAccount();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { account_type: 'bank', provider: '', account_name: '', account_number: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await createAccount.mutateAsync({ ...values, is_default: false });
      await refetch();
      reset();
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  });

  const confirmDelete = (acc: WithdrawalAccount) => {
    Alert.alert('Hapus Akun', `Hapus akun ${acc.provider} ${acc.account_number}?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          await deleteAccount.mutateAsync(acc.id);
          await refetch();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Akun Penarikan" />
      {isLoading || !profile ? (
        <Spinner />
      ) : (
        <>
          {profile.withdrawal_accounts.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={32} color={theme.textSecondary} />}
              title="Belum ada akun"
              subtitle="Tambahkan rekening bank atau e-wallet untuk menerima dana penarikan."
            />
          ) : (
            <View style={styles.list}>
              {profile.withdrawal_accounts.map((acc) => {
                const Icon = acc.account_type === 'bank' ? Landmark : CreditCard;
                return (
                  <Card key={acc.id} style={styles.rowCard}>
                    <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
                      <Icon size={20} color={theme.primary} />
                    </View>
                    <View style={styles.info}>
                      <Text style={[styles.name, { color: theme.text }]}>{acc.account_name}</Text>
                      <Text style={[styles.provider, { color: theme.textSecondary }]}>
                        {acc.provider} · {acc.account_number}
                      </Text>
                    </View>
                    {acc.is_default ? <Badge label="Default" tone="primary" /> : null}
                    <Pressable onPress={() => confirmDelete(acc)} hitSlop={8}>
                      <Trash2 size={18} color={theme.danger} />
                    </Pressable>
                  </Card>
                );
              })}
            </View>
          )}

          <Card>
            <View style={styles.formTitleRow}>
              <Plus size={18} color={theme.primary} />
              <Text style={[styles.formTitle, { color: theme.text }]}>Tambah Akun Baru</Text>
            </View>
            <View style={styles.form}>
              <View style={styles.typeRow}>
                {ACCOUNT_TYPES.map((t) => (
                  <Button
                    key={t.value}
                    title={t.label}
                    size="sm"
                    variant="outline"
                    onPress={() => setValue('account_type', t.value, { shouldValidate: true })}
                  />
                ))}
              </View>
              <Controller
                control={control}
                name="provider"
                render={({ field }) => (
                  <Input
                    label="Bank / Penyedia"
                    placeholder="contoh: BCA, Mandiri, GoPay, OVO"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.provider?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="account_name"
                render={({ field }) => (
                  <Input
                    label="Nama Pemilik Akun"
                    placeholder="Nama sesuai rekening"
                    autoCapitalize="words"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.account_name?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="account_number"
                render={({ field }) => (
                  <Input
                    label="Nomor Rekening / ID"
                    keyboardType="number-pad"
                    placeholder="Nomor rekening atau ID"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={errors.account_number?.message}
                  />
                )}
              />
              {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
              <Button title="Simpan Akun" onPress={onSubmit} loading={createAccount.isPending} />
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  provider: {
    fontSize: 12,
  },
  formTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
    marginBottom: Spacing.two,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    gap: Spacing.three,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  error: {
    fontSize: 13,
  },
});
