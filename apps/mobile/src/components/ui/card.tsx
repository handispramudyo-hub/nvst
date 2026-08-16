import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export function Card({ style, padded = true, children, ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: theme.border,
          padding: padded ? Spacing.three : 0,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
});
