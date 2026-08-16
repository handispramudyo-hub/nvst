import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SuccessCircle } from '@/components/ui/success-circle';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatRupiah, formatRupiahDecimal } from '@/lib/format';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function tenorLabel(days: number): string {
  return days >= 30 ? `${Math.round(days / 30)} Bulan` : `${days} Hari`;
}

function monthYear(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

export default function InvestSuccessScreen() {
  const { amount, projectName, returnPct, monthlyProfit, tenor, start } = useLocalSearchParams<{
    amount: string;
    projectName: string;
    returnPct: string;
    monthlyProfit: string;
    tenor: string;
    start: string;
  }>();
  const router = useRouter();
  const theme = useTheme();

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <Button title="Lihat Portofolio" size="lg" onPress={() => router.replace('/portfolio')} />
          <Button title="Kembali ke Beranda" size="lg" variant="outline" onPress={() => router.replace('/')} />
        </View>
      }>
      <ScreenHeader title="" showBack={false} right={<CloseButton onPress={() => router.replace('/')} />} />

      <View style={styles.center}>
        <SuccessCircle size={72} />
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]}>Investasi Berhasil!</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Dana Anda telah dialokasikan</Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={[styles.amount, { color: theme.primary }]}>{formatRupiah(Number(amount) || 0)}</Text>
        <Text style={[styles.projectName, { color: theme.textSecondary }]} numberOfLines={1}>
          {decodeURIComponent(projectName || '')}
        </Text>
      </View>

      <Card>
        <DetailRow label="Est. Return" value={`${Number(returnPct) || 0}%/tahun`} valueColor={theme.success} valueBold />
        <DetailRow label="Profit Bulanan" value={formatRupiahDecimal(Number(monthlyProfit) || 0)} valueColor={theme.success} />
        <DetailRow label="Tenor" value={tenorLabel(Number(tenor) || 0)} />
        <DetailRow label="Mulai" value={monthYear(start || '')} />
      </Card>
    </Screen>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.close, { backgroundColor: theme.backgroundSelected }]}>
      <X size={20} color={theme.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: Spacing.three,
  },
  center: {
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  titleBlock: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
