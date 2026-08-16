import { useLocalSearchParams } from 'expo-router';
import { ChevronRight, LifeBuoy } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DetailRow } from '@/components/ui/detail-row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spinner } from '@/components/ui/spinner';
import { SuccessCircle } from '@/components/ui/success-circle';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTransaction } from '@/hooks/queries';
import { formatDateTime, formatSigned } from '@/lib/format';
import type { WalletTransaction } from '@/lib/types';

function statusBadge(tx: WalletTransaction): { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' } {
  if (tx.type === 'withdrawal') {
    const status = tx.meta?.status as string | undefined;
    if (status === 'rejected') return { label: 'Ditolak', tone: 'danger' };
    if (status === 'pending' || status === 'processing') return { label: 'Diproses', tone: 'warning' };
    return { label: 'Berhasil', tone: 'success' };
  }
  return { label: 'Berhasil', tone: 'success' };
}

function typeLabel(tx: WalletTransaction): string {
  switch (tx.type) {
    case 'deposit':
      return 'Deposit';
    case 'investment':
      return 'Investasi';
    case 'withdrawal':
      return 'Penarikan';
    case 'profit':
      return 'Profit';
    case 'commission':
      return 'Komisi';
    case 'adjustment':
      return 'Penyesuaian';
    default:
      return tx.type;
  }
}

function methodLabel(tx: WalletTransaction): string {
  if (tx.type === 'deposit') return 'QRIS';
  if (tx.type === 'withdrawal') {
    const provider = tx.meta?.provider as string | undefined;
    return provider ? provider.toUpperCase() : 'Bank Transfer';
  }
  return '-';
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { data: tx, isLoading } = useTransaction(Number(id));

  if (isLoading || !tx) {
    return (
      <Screen>
        <ScreenHeader title="Detail Transaksi" />
        <Spinner />
      </Screen>
    );
  }

  const isCredit = tx.amount >= 0;
  const amountColor = isCredit ? theme.success : theme.danger;
  const badge = statusBadge(tx);

  return (
    <Screen
      scroll
      footer={
        <Button
          title="Unduh Bukti Transaksi"
          size="lg"
          variant="outline"
          onPress={() => undefined}
          disabled={!tx.tx_id}
        />
      }>
      <ScreenHeader title="Detail Transaksi" />

      <View style={styles.statusHeader}>
        <SuccessCircle size={56} />
        <Badge label={badge.label} tone={badge.tone} />
        <Text style={[styles.amount, { color: amountColor }]}>{formatSigned(tx.amount)}</Text>
      </View>

      <Card>
        <DetailRow label="Jenis" value={typeLabel(tx)} />
        <DetailRow label="Metode" value={methodLabel(tx)} />
        <DetailRow label="Tanggal" value={formatDateTime(tx.created_at)} />
        <DetailRow label="No. Referensi" value={tx.tx_id} valueBold />
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Status</Text>
          <Badge label={badge.label} tone={badge.tone} />
        </View>
      </Card>

      <View style={styles.helpSection}>
        <Text style={[styles.helpTitle, { color: theme.textSecondary }]}>Bantuan</Text>
        <Pressable style={[styles.actionRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Text style={[styles.actionText, { color: theme.text }]}>Laporkan Masalah</Text>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>
        <Pressable style={[styles.actionRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={styles.actionLabel}>
            <LifeBuoy size={18} color={theme.textSecondary} />
            <Text style={[styles.actionText, { color: theme.text }]}>Hubungi CS</Text>
          </View>
          <ChevronRight size={18} color={theme.textSecondary} />
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusHeader: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13,
  },
  helpSection: {
    gap: Spacing.three,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
  },
  actionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two + 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
