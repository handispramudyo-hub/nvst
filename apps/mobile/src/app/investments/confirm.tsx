import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { PinInput } from '@/components/ui/pin-input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCreateInvestment, useProject } from '@/hooks/queries';
import { extractErrorMessage } from '@/lib/api';
import { makeIdempotencyKey } from '@/lib/idempotency';
import { formatRupiah, formatRupiahDecimal } from '@/lib/format';

function tenorLabel(days: number): string {
  return days >= 30 ? `${Math.round(days / 30)} Bulan` : `${days} Hari`;
}

export default function InvestConfirmScreen() {
  const { projectId, amount: amountParam } = useLocalSearchParams<{ projectId: string; amount: string }>();
  const id = Number(projectId);
  const amount = Number(amountParam) || 0;
  const router = useRouter();
  const theme = useTheme();
  const { data: project, isLoading } = useProject(id);
  const createInvestment = useCreateInvestment();
  const [pin, setPin] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoading || !project) {
    return (
      <Screen>
        <ScreenHeader title="Konfirmasi Investasi" />
        <Spinner />
      </Screen>
    );
  }

  const monthlyProfit = (amount * project.estimated_return) / 100 / 12;

  const onSubmit = async () => {
    setFormError(null);
    if (pin.length !== 6) {
      setFormError('PIN harus 6 digit.');
      return;
    }
    try {
      const investment = await createInvestment.mutateAsync({
        project_id: project.id,
        amount,
        pin,
        idempotency_key: makeIdempotencyKey('inv'),
      });
      router.replace(
        `/investments/success?amount=${investment.amount}&projectName=${encodeURIComponent(project.name)}&returnPct=${project.estimated_return}&monthlyProfit=${monthlyProfit}&tenor=${project.duration_days}&start=${encodeURIComponent(investment.start_date)}`,
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
          title={createInvestment.isPending ? 'Memproses...' : 'Konfirmasi Investasi'}
          onPress={onSubmit}
          loading={createInvestment.isPending}
          size="lg"
        />
      }>
      <ScreenHeader title="Konfirmasi Investasi" />

      <Card>
        <View style={styles.summary}>
          <DetailRow label="Proyek" value={project.name} valueBold />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <DetailRow label="Nominal Investasi" value={formatRupiah(amount)} valueBold highlight />
          <DetailRow label="Est. Return" value={`${project.estimated_return}% /tahun`} valueColor={theme.success} />
          <DetailRow label="Est. Profit Bulanan" value={formatRupiahDecimal(monthlyProfit)} valueColor={theme.success} />
          <DetailRow label="Tenor" value={tenorLabel(project.duration_days)} />
          <DetailRow label="Sumber Dana" value="Saldo NiVEST" />
        </View>
      </Card>

      <View style={[styles.warningBox, { backgroundColor: theme.warningLight }]}>
        <AlertTriangle size={20} color={theme.warning} />
        <Text style={[styles.warningText, { color: theme.warning }]}>
          Investasi memiliki risiko. Pastikan Anda memahami profil risiko proyek ini.
        </Text>
      </View>

      <View style={styles.pinSection}>
        <Text style={[styles.pinLabel, { color: theme.textSecondary }]}>Masukkan PIN</Text>
        <PinInput value={pin} onChange={setPin} />
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
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
    borderRadius: Radius.md,
    padding: Spacing.three - 2,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  pinSection: {
    gap: Spacing.two + 2,
  },
  pinLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
  },
});
