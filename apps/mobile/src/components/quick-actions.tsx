import { router } from 'expo-router';
import { ArrowDownLeft, History, Plus, TrendingUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface QuickAction {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  bg: string;
  fg: string;
  onPress: () => void;
}

export function QuickActions() {
  const theme = useTheme();

  const actions: QuickAction[] = [
    {
      key: 'deposit',
      label: 'Deposit',
      icon: Plus,
      bg: theme.successLight,
      fg: theme.success,
      onPress: () => router.push('/deposit'),
    },
    {
      key: 'invest',
      label: 'Investasi',
      icon: TrendingUp,
      bg: theme.primaryLight,
      fg: theme.primary,
      onPress: () => router.push('/(tabs)/projects'),
    },
    {
      key: 'withdraw',
      label: 'Tarik Dana',
      icon: ArrowDownLeft,
      bg: theme.warningLight,
      fg: theme.warning,
      onPress: () => router.push('/withdraw'),
    },
    {
      key: 'history',
      label: 'Riwayat',
      icon: History,
      bg: theme.infoLight,
      fg: theme.info,
      onPress: () => router.push('/transactions'),
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <Pressable key={a.key} style={styles.action} onPress={a.onPress}>
            <View style={[styles.iconWrap, { backgroundColor: a.bg }]}>
              <Icon size={20} color={a.fg} />
            </View>
            <Text style={[styles.label, { color: theme.text }]}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
