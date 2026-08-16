import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface SuccessCircleProps {
  size?: number;
  color?: string;
}

export function SuccessCircle({ size = 72, color }: SuccessCircleProps) {
  const theme = useTheme();
  const bg = color ?? theme.successLight;
  const fg = theme.success;
  const radius = size / 2;

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: bg,
        },
      ]}>
      <Check size={size * 0.44} color={fg} strokeWidth={3} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
