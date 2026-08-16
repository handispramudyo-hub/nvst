import { forwardRef, useRef } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface PinInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}

export const PinInput = forwardRef<TextInput, PinInputProps>(function PinInput(
  { length = 6, value, onChange, autoFocus },
  ref,
) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleChange = (text: string) => {
    onChange(text.replace(/\D/g, '').slice(0, length));
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()}>
      <View style={styles.row}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < value.length ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>
      <TextInput
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hidden}
      />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
