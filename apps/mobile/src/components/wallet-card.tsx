import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/lib/format';
import type { Wallet } from '@/lib/types';

interface WalletCardProps {
  wallet: Wallet;
  todayProfit?: number;
}

export function WalletCard({ wallet, todayProfit }: WalletCardProps) {
  return (
    <LinearGradient colors={['#3B82F6', '#2563EB', '#1D4ED8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.balanceBlock}>
        <Text style={styles.balanceTitle}>Total Saldo</Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance} numberOfLines={1} adjustsFontSizeToFit>
            {formatRupiah(wallet.balance)}
          </Text>
          {todayProfit ? (
            <View style={styles.profitBadge}>
              <Text style={styles.profitLabel}>+{formatRupiah(todayProfit)} hari ini</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.statsRow}>
        <Stat label="Deposit" value={formatRupiah(wallet.total_deposited)} />
        <Stat label="Investasi" value={formatRupiah(wallet.total_invested)} />
        <Stat label="Profit" value={formatRupiah(wallet.total_profit)} />
      </View>
    </LinearGradient>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.five,
    gap: Spacing.three,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 6,
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -40,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(96,165,250,0.5)',
  },
  balanceBlock: {
    gap: Spacing.two,
  },
  balanceTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  profitBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one + 1,
  },
  profitLabel: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
  },
  stat: {
    flex: 1,
    gap: Spacing.one,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '400',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
