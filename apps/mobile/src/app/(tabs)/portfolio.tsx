import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { InvestmentItem } from '@/components/investment-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useInvestmentSummary, useInvestments } from '@/hooks/queries';
import { formatRupiah } from '@/lib/format';

const FILTERS = [
  { key: '', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'completed', label: 'Selesai' },
] as const;

export default function PortfolioScreen() {
  const theme = useTheme();
  const [filter, setFilter] = useState<string>('');
  const { data: summary, isLoading: summaryLoading } = useInvestmentSummary();
  const { data: investments, isLoading: investmentsLoading, refetch } = useInvestments(filter || undefined);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Portofolio</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Pantau investasi dan profit anda</Text>
      </View>

      {summaryLoading || !summary ? (
        <Spinner />
      ) : (
        <Card padded={false} style={styles.summaryCard}>
          <View style={[styles.summaryHeader, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Total Investasi</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{formatRupiah(summary.total_invested)}</Text>
          </View>
          <View style={styles.summaryGrid}>
            <SummaryCell label="Total Earned" value={formatRupiah(summary.total_earned)} tone="success" />
            <SummaryCell label="Aktif" value={String(summary.active_investments)} />
            <SummaryCell label="Profit Hari Ini" value={`+${formatRupiah(summary.today_profit)}`} tone="success" />
            <SummaryCell label="Return Potensial" value={formatRupiah(summary.total_expected_return)} />
          </View>
        </Card>
      )}

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable key={f.key} onPress={() => setFilter(f.key)}>
            <Badge label={f.label} tone={filter === f.key ? 'primary' : 'neutral'} />
          </Pressable>
        ))}
      </View>

      {investmentsLoading ? (
        <Spinner />
      ) : (
        <FlatList
          data={investments?.items ?? []}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <InvestmentItem investment={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
          ListEmptyComponent={
            <EmptyState
              title="Belum ada investasi"
              subtitle="Mulai investasi dari halaman Proyek."
            />
          }
          refreshing={investmentsLoading}
          onRefresh={refetch}
        />
      )}
    </Screen>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: string; tone?: 'success' }) {
  const theme = useTheme();
  return (
    <View style={styles.cell}>
      <Text style={[styles.cellValue, { color: tone === 'success' ? theme.success : theme.text }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.cellLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  summaryCard: {
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: Spacing.three,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: Spacing.two,
  },
  cell: {
    width: '50%',
    padding: Spacing.three,
    gap: 2,
  },
  cellValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  cellLabel: {
    fontSize: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  list: {
    paddingBottom: Spacing.four,
  },
});
