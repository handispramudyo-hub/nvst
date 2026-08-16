import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRupiah } from '@/lib/format';

export default function WithdrawSuccessScreen() {
  const params = useLocalSearchParams<{ amount: string; ref: string; provider: string; number: string }>();
  const router = useRouter();
  const theme = useTheme();

  const amount = Number(params.amount) || 0;
  const provider = params.provider ?? '';
  const maskedNumber = `••• ${(params.number ?? '').slice(-4)}`;

  const goHome = () => {
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <Screen
      scroll
      footer={<Button title="Kembali ke Beranda" size="lg" onPress={goHome} />}>
      <ScreenHeader title="" showBack={false} />
      <View style={styles.wrap}>
        <View style={[styles.circle, { backgroundColor: theme.warningLight }]}>
          <Clock size={32} color={theme.warning} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]}>Penarikan Diproses</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Dana akan ditransfer dalam 1x24 jam kerja
          </Text>
        </View>
        <View style={[styles.amountBox, { backgroundColor: theme.backgroundElement }]}>
          <Text style={[styles.amount, { color: theme.warning }]}>{formatRupiah(amount)}</Text>
        </View>
        <Card>
          <View style={styles.summary}>
            <DetailRow label="Tujuan" value={`${provider} ${maskedNumber}`} />
            <DetailRow label="No. Referensi" value={params.ref ?? '-'} valueBold />
            <View style={styles.row}>
              <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>Status</Text>
              <Badge label="Diproses" tone="warning" size="sm" />
            </View>
          </View>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  circle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  amountBox: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
  },
  summary: {
    gap: Spacing.three,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 13,
  },
});
