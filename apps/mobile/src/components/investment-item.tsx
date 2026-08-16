import { router } from 'expo-router';
import { ChevronRight, TrendingDown, TrendingUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDate, formatRupiah } from '@/lib/format';
import type { Investment, InvestmentStatus } from '@/lib/types';

const STATUS_META: Record<InvestmentStatus, { label: string; tone: 'success' | 'info' | 'neutral' | 'warning' }> = {
  active: { label: 'Aktif', tone: 'success' },
  completed: { label: 'Selesai', tone: 'info' },
  cancelled: { label: 'Dibatalkan', tone: 'neutral' },
};

export function InvestmentItem({ investment }: { investment: Investment }) {
  const theme = useTheme();
  const meta = STATUS_META[investment.status] ?? STATUS_META.active;
  const positive = investment.status === 'active' || investment.status === 'completed';

  return (
    <Pressable onPress={() => router.push(`/investments/${investment.id}`)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {investment.project?.name ?? investment.investment_no}
            </Text>
            <Text style={[styles.no, { color: theme.textSecondary }]}>{investment.investment_no}</Text>
          </View>
          <Badge label={meta.label} tone={meta.tone} />
        </View>

        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Modal</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatRupiah(investment.amount)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Earning</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>{formatRupiah(investment.current_earnings)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Berakhir</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{formatDate(investment.maturity_date)}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.returnRow}>
            {positive ? (
              <TrendingUp size={14} color={theme.success} />
            ) : (
              <TrendingDown size={14} color={theme.textSecondary} />
            )}
            <Text style={[styles.returnText, { color: positive ? theme.success : theme.textSecondary }]}>
              {investment.expected_return}% / {investment.duration_days} hari
            </Text>
          </View>
          <ChevronRight size={16} color={theme.textSecondary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
  },
  no: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  returnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
