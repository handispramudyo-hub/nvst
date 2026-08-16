import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

interface SpinnerProps {
  size?: 'small' | 'large';
}

export function Spinner({ size = 'large' }: SpinnerProps) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
});
