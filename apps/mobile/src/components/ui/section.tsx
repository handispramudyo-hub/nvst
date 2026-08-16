import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SectionProps {
  title: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function Section({ title, right, children }: SectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
});
