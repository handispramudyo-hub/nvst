import { ArrowDownLeft, HandCoins, Plus, Settings, TrendingUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime, formatSigned } from '@/lib/format';
import type { TransactionType, WalletTransaction } from '@/lib/types';

const TYPE_META: Record<
  TransactionType,
  {
    label: string;
    badge: { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' };
    icon: React.ComponentType<{ size?: number; color?: string }>;
    bg: string;
    fg: string;
  }
> = {
  deposit: { label: 'Deposit', badge: { label: 'Berhasil', tone: 'success' }, icon: Plus, bg: 'successLight', fg: 'success' },
  investment: { label: 'Investasi', badge: { label: 'Berhasil', tone: 'success' }, icon: TrendingUp, bg: 'primaryLight', fg: 'primary' },
  withdrawal: { label: 'Penarikan', badge: { label: 'Berhasil', tone: 'success' }, icon: ArrowDownLeft, bg: 'warningLight', fg: 'warning' },
  profit: { label: 'Profit', badge: { label: 'Berhasil', tone: 'success' }, icon: Plus, bg: 'successLight', fg: 'success' },
  commission: { label: 'Komisi', badge: { label: 'Berhasil', tone: 'success' }, icon: HandCoins, bg: 'infoLight', fg: 'info' },
  adjustment: { label: 'Penyesuaian', badge: { label: 'Disesuaikan', tone: 'neutral' }, icon: Settings, bg: 'backgroundSelected', fg: 'textSecondary' },
};

function badgeFor(tx: WalletTransaction): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } {
  if (tx.type === 'withdrawal') {
    const status = tx.meta?.status as string | undefined;
    if (status === 'rejected') return { label: 'Ditolak', tone: 'danger' };
    if (status === 'pending' || status === 'processing') return { label: 'Pending', tone: 'warning' };
    if (status === 'completed' || status === 'approved') return { label: 'Berhasil', tone: 'success' };
    return { label: 'Pending', tone: 'warning' };
  }
  return TYPE_META[tx.type]?.badge ?? { label: 'Berhasil', tone: 'success' };
}

export function TransactionItem({ tx, onPress }: { tx: WalletTransaction; onPress?: () => void }) {
  const theme = useTheme();
  const meta = TYPE_META[tx.type] ?? TYPE_META.adjustment;
  const Icon = meta.icon;
  const isCredit = tx.amount >= 0;
  const badge = badgeFor(tx);
  const bg = theme[meta.bg as keyof typeof theme];
  const fg = theme[meta.fg as keyof typeof theme];

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Icon size={18} color={fg} />
        </View>
        <View style={styles.main}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {tx.description ?? meta.label}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{formatDateTime(tx.created_at)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.amount, { color: isCredit ? theme.success : theme.danger }]}>
            {formatSigned(tx.amount)}
          </Text>
          <Badge label={badge.label} tone={badge.tone} size="sm" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three - 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
  },
});
