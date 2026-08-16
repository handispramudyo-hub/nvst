import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface AmountInputProps extends TextInputProps {
  fontSize?: number;
}

export const AmountInput = forwardRef<TextInput, AmountInputProps>(function AmountInput(
  { fontSize = 24, style, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={[styles.box, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Text style={[styles.prefix, { color: theme.textSecondary }]}>Rp</Text>
      <TextInput
        ref={ref}
        keyboardType="number-pad"
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, fontSize }, style]}
        {...rest}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    height: 56,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontWeight: '700',
    paddingVertical: 0,
  },
});
