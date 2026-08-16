import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface QuickChip {
  label: string;
  value: number;
}

interface QuickChipsProps {
  options: QuickChip[];
  selected?: number;
  onSelect: (value: number) => void;
}

export function QuickChips({ options, selected, onSelect }: QuickChipsProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const active = selected === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primaryLight : theme.backgroundElement,
                borderColor: active ? theme.primaryLight : theme.border,
              },
            ]}>
            <Text style={[styles.label, { color: active ? theme.primary : theme.text }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
