import { forwardRef } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, style, multiline, ...rest },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          styles.input,
          {
            backgroundColor: theme.background,
            borderColor: error ? theme.danger : theme.border,
            color: theme.text,
            minHeight: multiline ? 96 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
      {hint && !error ? <Text style={[styles.hint, { color: theme.textSecondary }]}>{hint}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one + 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
  },
  hint: {
    fontSize: 12,
  },
});
