import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === 'primary' ? theme.primary :
    variant === 'danger' ? theme.danger :
    variant === 'secondary' ? theme.backgroundElement :
    variant === 'outline' ? theme.backgroundElement :
    variant === 'ghost' ? 'transparent' : theme.primary;

  const isElevated = variant === 'primary' || variant === 'danger';

  const textColor =
    variant === 'primary' || variant === 'danger' ? theme.textInverse :
    variant === 'outline' || variant === 'ghost' ? theme.primary : theme.text;

  const borderColor =
    variant === 'outline' ? theme.border :
    variant === 'secondary' ? theme.border : 'transparent';

  const paddingVertical = size === 'sm' ? Spacing.two : size === 'md' ? Spacing.three : Spacing.four;
  const fontSize = size === 'sm' ? 14 : size === 'md' ? 15 : 16;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        isElevated && styles.elevated,
        {
          backgroundColor,
          borderColor,
          borderWidth: borderColor === 'transparent' ? 0 : 1,
          paddingVertical,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: textColor, fontSize }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
  },
  elevated: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  label: {
    fontWeight: '600',
  },
});
