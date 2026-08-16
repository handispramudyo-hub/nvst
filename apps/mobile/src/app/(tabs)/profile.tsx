import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  History,
  KeyRound,
  Lock,
  LogOut,
  Users,
} from 'lucide-react-native';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, wallet, logout, refreshMe } = useAuthStore();

  const confirmLogout = () => {
    Alert.alert('Keluar', 'Anda yakin ingin keluar dari aplikasi?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const menuItems = [
    { key: 'transactions', label: 'Riwayat Transaksi', icon: History, route: '/transactions' as const },
    { key: 'notifications', label: 'Notifikasi', icon: Bell, route: '/notifications' as const },
    { key: 'referral', label: 'Referral', icon: Users, route: '/referral' as const },
    { key: 'accounts', label: 'Akun Penarikan', icon: CreditCard, route: '/accounts' as const },
    { key: 'password', label: 'Ubah Password', icon: Lock, route: '/change-password' as const },
    { key: 'pin', label: 'Ubah PIN', icon: KeyRound, route: '/change-pin' as const },
  ];

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Profil</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{(user?.name ?? '?').slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
          <Text style={[styles.phone, { color: theme.textSecondary }]}>{user?.phone}</Text>
          <View style={styles.badges}>
            <Badge label="Kode Referral" tone="neutral" />
            <Text style={[styles.referralCode, { color: theme.primary }]}>{user?.referral_code}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push('/profile-edit')}
          hitSlop={8}
          style={styles.editWrap}>
          <Text style={[styles.editText, { color: theme.primary }]}>Ubah</Text>
        </Pressable>
      </Card>

      <Card>
        <View style={styles.walletRow}>
          <View style={styles.walletCell}>
            <Text style={[styles.walletValue, { color: theme.text }]}>{wallet?.balance.toLocaleString('id-ID') ?? '0'}</Text>
            <Text style={[styles.walletLabel, { color: theme.textSecondary }]}>Saldo (IDR)</Text>
          </View>
          <View style={styles.walletCell}>
            <Text style={[styles.walletValue, { color: theme.success }]}>{wallet?.total_profit.toLocaleString('id-ID') ?? '0'}</Text>
            <Text style={[styles.walletLabel, { color: theme.textSecondary }]}>Total Profit (IDR)</Text>
          </View>
          <View style={styles.walletCell}>
            <Text style={[styles.walletValue, { color: theme.text }]}>{wallet?.total_invested.toLocaleString('id-ID') ?? '0'}</Text>
            <Text style={[styles.walletLabel, { color: theme.textSecondary }]}>Total Investasi (IDR)</Text>
          </View>
        </View>
        <Pressable onPress={() => refreshMe()}>
          <Text style={[styles.sync, { color: theme.textSecondary }]}>Ketuk untuk menyegarkan data</Text>
        </Pressable>
      </Card>

      <Card>
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.key}
              onPress={() => router.push(item.route as never)}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { opacity: 0.7 },
                idx !== menuItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border },
              ]}>
              <View style={[styles.menuIcon, { backgroundColor: theme.backgroundSelected }]}>
                <Icon size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <ChevronRight size={18} color={theme.textSecondary} />
            </Pressable>
          );
        })}
      </Card>

      <Pressable onPress={confirmLogout} style={styles.logout}>
        <LogOut size={18} color={theme.danger} />
        <Text style={[styles.logoutText, { color: theme.danger }]}>Keluar dari Aplikasi</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  phone: {
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  referralCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  editWrap: {
    padding: Spacing.two,
  },
  editText: {
    fontSize: 13,
    fontWeight: '700',
  },
  walletRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  walletCell: {
    flex: 1,
    gap: 2,
  },
  walletValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  walletLabel: {
    fontSize: 10,
  },
  sync: {
    fontSize: 11,
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
