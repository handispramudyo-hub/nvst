import { useLocalSearchParams } from 'expo-router';
import { TrendingDown, TrendingUp } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Section } from '@/components/ui/section';
import { Spinner } from '@/components/ui/spinner';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useInvestment } from '@/hooks/queries';
import { formatDate, formatRupiah } from '@/lib/format';
import type { InvestmentStatus } from '@/lib/types';

const STATUS_META: Record<InvestmentStatus, { label: string; tone: 'success' | 'info' | 'neutral' }> = {
  active: { label: 'Aktif', tone: 'success' },
  completed: { label: 'Selesai', tone: 'info' },
  cancelled: { label: 'Dibatalkan', tone: 'neutral' },
};

export default function InvestmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const investmentId = Number(id);
  const theme = useTheme();
  const { data, isLoading } = useInvestment(investmentId);

  if (isLoading || !data) {
    return (
      <Screen>
        <ScreenHeader title="Detail Investasi" />
        <Spinner />
      </Screen>
    );
  }

  const { investment } = data;
  const meta = STATUS_META[investment.status] ?? STATUS_META.active;
  const positive = investment.status === 'active' || investment.status === 'completed';
  const chartData = data.earnings_chart.map((e) => ({
    value: Math.round(e.amount),
    label: e.date,
  }));

  return (
    <Screen scroll>
      <ScreenHeader title={investment.project?.name ?? investment.investment_no} />

      <Card>
        <View style={styles.headerRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.no, { color: theme.textSecondary }]}>{investment.investment_no}</Text>
            <Badge label={meta.label} tone={meta.tone} />
          </View>
          <Text style={[styles.amount, { color: theme.text }]}>{formatRupiah(investment.amount)}</Text>
        </View>
        <View style={styles.grid}>
          <InfoCell label="Earning Terkumpul" value={formatRupiah(investment.current_earnings)} highlight />
          <InfoCell label="Return" value={`${investment.expected_return}%`} />
          <InfoCell label="Profit Harian" value={formatRupiah(investment.daily_return_amount)} />
          <InfoCell label="Mulai" value={formatDate(investment.start_date)} />
          <InfoCell label="Jatuh Tempo" value={formatDate(investment.maturity_date)} />
          <InfoCell label="Total Kembali" value={formatRupiah(investment.expected_return_amount)} />
        </View>
      </Card>

      <Section title="Perkembangan Profit Harian">
        <Card>
          {chartData.length === 0 ? (
            <EmptyState
              icon={positive ? <TrendingUp size={32} color={theme.success} /> : <TrendingDown size={32} color={theme.textSecondary} />}
              title="Belum ada earning"
              subtitle="Profit harian akan dihitung otomatis setiap hari."
            />
          ) : (
            <BarChart
              data={chartData}
              barWidth={22}
              spacing={8}
              barBorderRadius={4}
              frontColor={theme.primary}
              noOfSections={4}
              yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 9 }}
              hideRules
              isAnimated
            />
          )}
        </Card>
      </Section>
    </Screen>
  );
}

function InfoCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.infoCell}>
      <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: highlight ? theme.success : theme.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  titleWrap: {
    gap: Spacing.one,
  },
  no: {
    fontSize: 12,
  },
  amount: {
    fontSize: 22,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: Spacing.three,
  },
  infoCell: {
    width: '50%',
    gap: 2,
    paddingRight: Spacing.two,
  },
  infoLabel: {
    fontSize: 11,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
