import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { PinInput } from '@/components/ui/pin-input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateWithdrawal } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import { makeIdempotencyKey } from '@/lib/idempotency';
import { formatRupiahDecimal } from '@/lib/format';

export default function WithdrawConfirmScreen() {
  const params = useLocalSearchParams<{
    amount: string;
    fee: string;
    accountId: string;
    provider: string;
    number: string;
    name: string;
  }>();
  const router = useRouter();
  const theme = useTheme();
  const createWithdrawal = useCreateWithdrawal();
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const amount = Number(params.amount) || 0;
  const fee = Number(params.fee) || 0;
  const finalAmount = Math.max(0, amount - fee);
  const accountId = Number(params.accountId) || 0;
  const provider = params.provider ?? '';
  const number = params.number ?? '';
  const name = params.name ?? '';
  const maskedNumber = `••• ${number.slice(-4)}`;

  const onSubmit = async () => {
    setFormError(null);
    if (pin.length !== 6) {
      setFormError('Masukkan PIN 6 digit.');
      return;
    }
    try {
      const withdrawal = await createWithdrawal.mutateAsync({
        amount,
        pin,
        account_id: accountId,
        idempotency_key: makeIdempotencyKey('wd'),
      });
      router.replace(
        `/withdraw/success?amount=${withdrawal.final_amount}&ref=${encodeURIComponent(withdrawal.withdrawal_no)}&provider=${encodeURIComponent(withdrawal.provider)}&number=${encodeURIComponent(withdrawal.account_number)}`,
      );
    } catch (e) {
      setFormError(extractErrorMessage(e));
    }
  };

  return (
    <Screen
      scroll
      footer={
        <Button
          title={createWithdrawal.isPending ? 'Memproses...' : 'Konfirmasi & Tarik'}
          onPress={onSubmit}
          loading={createWithdrawal.isPending}
          size="lg"
        />
      }>
      <ScreenHeader title="Konfirmasi Penarikan" />

      <Card>
        <View style={styles.summary}>
          <DetailRow label="Nominal Penarikan" value={formatRupiahDecimal(amount)} />
          <DetailRow label="Biaya Admin" value={formatRupiahDecimal(fee)} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow label="Total Diterima" value={formatRupiahDecimal(finalAmount)} valueBold highlight />
          <DetailRow label="Tujuan" value={`${provider} - ${maskedNumber} (${name})`} />
          <DetailRow label="Estimasi" value="1x24 jam kerja" />
        </View>
      </Card>

      <View style={styles.pinSection}>
        <Text style={[styles.pinTitle, { color: theme.textSecondary }]}>Masukkan PIN</Text>
        <PinInput value={pin} onChange={(v) => { setPin(v); setFormError(null); }} autoFocus />
        <Text style={[styles.pinHint, { color: theme.textSecondary }]}>
          Gunakan PIN 6 digit akun NiVEST Anda
        </Text>
      </View>

      {formError ? <Text style={[styles.error, { color: theme.danger }]}>{formError}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: Spacing.three,
  },
  divider: {
    height: 1,
  },
  pinSection: {
    gap: Spacing.three,
  },
  pinTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  pinHint: {
    fontSize: 12,
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
  },
});
