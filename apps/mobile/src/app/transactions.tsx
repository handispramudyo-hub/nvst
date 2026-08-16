import { useRouter } from 'expo-router';
import { History, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { TransactionItem } from '@/components/transaction-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWalletTransactions } from '@/hooks/queries';
import type { WalletTransaction } from '@/lib/types';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

type Filter = 'Semua' | 'Deposit' | 'Investasi' | 'Penarikan';

const FILTERS: Filter[] = ['Semua', 'Deposit', 'Investasi', 'Penarikan'];

function monthGroup(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function filterMatches(tx: WalletTransaction, filter: Filter): boolean {
  if (filter === 'Semua') return true;
  if (filter === 'Deposit') return tx.type === 'deposit';
  if (filter === 'Investasi') return tx.type === 'investment' || tx.type === 'profit';
  if (filter === 'Penarikan') return tx.type === 'withdrawal';
  return true;
}

export default function TransactionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, refetch } = useWalletTransactions(100);
  const [filter, setFilter] = useState<Filter>('Semua');

  const sections = useMemo(() => {
    const filtered = (data?.items ?? []).filter((tx) => filterMatches(tx, filter));
    const groups = new Map<string, WalletTransaction[]>();
    for (const tx of filtered) {
      const key = monthGroup(tx.created_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(tx);
    }
    const sorted = Array.from(groups.entries()).sort((a, b) => {
      const da = new Date(a[1][0].created_at).getTime();
      const db = new Date(b[1][0].created_at).getTime();
      return db - da;
    });
    return sorted.flatMap(([label, items]) => [{ kind: 'header' as const, label }, ...items.map((tx) => ({ kind: 'item' as const, tx }))]);
  }, [data, filter]);

  return (
    <Screen>
      <ScreenHeader
        title="Riwayat"
        right={
          <Pressable hitSlop={8} style={[styles.filterBtn, { backgroundColor: theme.backgroundSelected }]}>
            <SlidersHorizontal size={18} color={theme.text} />
          </Pressable>
        }
      />

      <View style={styles.tabs}>
        {FILTERS.map((f) => {
          const active = f === filter;
          return (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.tab, { backgroundColor: active ? theme.primary : theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.tabText, { color: active ? '#FFFFFF' : theme.textSecondary, fontWeight: active ? '700' : '500' }]}>
                {f}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <Spinner />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, index) => (item.kind === 'header' ? `h-${item.label}` : `t-${item.tx.id}`) + `-${index}`}
          renderItem={({ item }) =>
            item.kind === 'header' ? (
              <Text style={[styles.groupHeader, { color: theme.textSecondary }]}>{item.label}</Text>
            ) : (
              <View style={styles.itemWrap}>
                <TransactionItem tx={item.tx} onPress={() => router.push(`/transactions/${item.tx.id}`)} />
              </View>
            )
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon={<History size={32} color={theme.textSecondary} />}
              title="Belum ada transaksi"
              subtitle="Seluruh aktivitas wallet anda akan tampil di sini."
            />
          }
          refreshing={isLoading}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginHorizontal: -Spacing.five,
    paddingHorizontal: Spacing.five,
  },
  tab: {
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two - 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabText: {
    fontSize: 12,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemWrap: {
    marginBottom: Spacing.three,
  },
  list: {
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
});
