import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface DetailRowProps {
  label: string;
  value: string;
  valueBold?: boolean;
  valueColor?: string;
  highlight?: boolean;
}

export function DetailRow({ label, value, valueBold, valueColor, highlight }: DetailRowProps) {
  const theme = useTheme();
  const color =
    valueColor ?? (highlight ? theme.primary : valueBold ? theme.text : theme.text);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, valueBold && styles.valueBold, { color }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.three,
  },
  label: {
    fontSize: 13,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
    textAlign: 'right',
  },
  valueBold: {
    fontWeight: '700',
  },
});
