import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AmountInput } from '@/components/ui/amount-input';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useProfile, useWithdrawalRules } from '@/hooks/queries';
import { formatRupiah, formatRupiahDecimal } from '@/lib/format';

export default function WithdrawScreen() {
  const theme = useTheme();
  const { data: rules, isLoading: rulesLoading } = useWithdrawalRules();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const numericAmount = Number(amount) || 0;
  const accounts = profile?.withdrawal_accounts ?? [];
  const account = accounts.find((a) => a.is_default) ?? accounts[0] ?? null;

  const fee = useMemo(() => {
    if (!rules) return 0;
    return Math.round((rules.fee_flat + (numericAmount * rules.fee_percent) / 100) * 100) / 100;
  }, [numericAmount, rules]);

  if (rulesLoading || profileLoading) {
    return (
      <Screen>
        <ScreenHeader title="Tarik Dana" />
        <Spinner />
      </Screen>
    );
  }

  const balance = rules?.available_balance ?? profile?.wallet.balance ?? 0;

  const onSubmit = () => {
    setFormError(null);
    if (numericAmount <= 0) {
      setFormError('Jumlah harus lebih dari 0');
      return;
    }
    if (rules && numericAmount < rules.min_amount) {
      setFormError(`Minimal penarikan ${formatRupiah(rules.min_amount)}`);
      return;
    }
    if (numericAmount > balance) {
      setFormError('Nominal melebihi saldo tersedia.');
      return;
    }
    if (!account) {
      router.push('/accounts');
      return;
    }
    router.push(
      `/withdraw/confirm?amount=${numericAmount}&fee=${fee}&accountId=${account.id}&provider=${encodeURIComponent(account.provider)}&number=${encodeURIComponent(account.account_number)}&name=${encodeURIComponent(account.account_name)}`,
    );
  };

  return (
    <Screen
      scroll
      footer={
        <Button title="Tarik Dana" size="lg" onPress={onSubmit} />
      }>
      <ScreenHeader title="Tarik Dana" />

      <View style={[styles.balanceBox, { backgroundColor: theme.primaryLight }]}>
        <Text style={[styles.balanceLabel, { color: theme.primary }]}>Saldo Tersedia</Text>
        <Text style={[styles.balanceValue, { color: theme.primary }]}>{formatRupiah(balance)}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Nominal Penarikan</Text>
          <Pressable onPress={() => setAmount(String(balance))} hitSlop={8}>
            <Text style={[styles.maxAll, { color: theme.primary }]}>Tarik Semua</Text>
          </Pressable>
        </View>
        <AmountInput
          fontSize={20}
          value={amount}
          onChangeText={(v) => {
            setAmount(v.replace(/[^\d]/g, ''));
            setFormError(null);
          }}
          placeholder="Masukkan nominal"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Tujuan Transfer</Text>
        <View style={[styles.destCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={[styles.bankAvatar, { backgroundColor: theme.infoLight }]}>
            <Text style={[styles.bankText, { color: theme.info }]}>
              {account ? account.provider.slice(0, 3) : '—'}
            </Text>
          </View>
          <View style={styles.destText}>
            <Text style={[styles.destName, { color: theme.text }]}>
              {account ? `${account.provider} ••• ${account.account_number.slice(-4)}` : 'Belum ada akun'}
            </Text>
            <Text style={[styles.destAccount, { color: theme.textSecondary }]}>
              {account?.account_name ?? 'Tambahkan akun penarikan'}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/accounts')} hitSlop={8}>
            <Text style={[styles.change, { color: theme.primary }]}>Ubah</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.breakdown, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <BreakdownRow label="Biaya Admin" value={formatRupiahDecimal(fee)} />
        <BreakdownRow label="Metode" value="Realtime Online" />
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.estimate, { color: theme.textSecondary }]}>
          Estimasi dana masuk: 1x24 jam kerja
        </Text>
      </View>

      {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
    </Screen>
  );
}

function BreakdownRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.breakRow}>
      <Text style={[styles.breakLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.breakValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  balanceBox: {
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.one + 2,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.three,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  maxAll: {
    fontSize: 13,
    fontWeight: '600',
  },
  destCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
  },
  bankAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankText: {
    fontSize: 13,
    fontWeight: '700',
  },
  destText: {
    flex: 1,
    gap: 2,
  },
  destName: {
    fontSize: 14,
    fontWeight: '600',
  },
  destAccount: {
    fontSize: 12,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  breakdown: {
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakLabel: {
    fontSize: 13,
  },
  breakValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  estimate: {
    fontSize: 12,
  },
  error: {
    fontSize: 13,
  },
});
