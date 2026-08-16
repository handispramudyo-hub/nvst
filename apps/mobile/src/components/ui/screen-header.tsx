import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  showBack?: boolean;
}

export function ScreenHeader({ title, subtitle, right, showBack = true }: ScreenHeaderProps) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
      {showBack ? (
        <Pressable onPress={() => router.back()} hitSlop={8} style={[styles.back, { backgroundColor: theme.backgroundSelected }]}>
          <ArrowLeft size={20} color={theme.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View style={styles.right}>{right}</View> : <View style={styles.back} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginHorizontal: -Spacing.five,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    gap: 0,
  },
  right: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
});
