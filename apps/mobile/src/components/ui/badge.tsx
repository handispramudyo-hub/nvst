import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';
type Size = 'sm' | 'md';

const TONE_BG: Record<Tone, string> = {
  success: 'successLight',
  warning: 'warningLight',
  danger: 'dangerLight',
  info: 'infoLight',
  neutral: 'backgroundSelected',
  primary: 'primaryLight',
};

const TONE_TEXT: Record<Tone, string> = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  neutral: 'textSecondary',
  primary: 'primary',
};

interface BadgeProps {
  label: string;
  tone?: Tone;
  size?: Size;
}

export function Badge({ label, tone = 'neutral', size = 'md' }: BadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme[TONE_BG[tone] as keyof typeof theme],
          borderRadius: size === 'sm' ? 6 : Radius.full,
          paddingHorizontal: size === 'sm' ? Spacing.two : Spacing.two + 2,
          paddingVertical: size === 'sm' ? Spacing.one : Spacing.one,
        },
      ]}>
      <Text
        style={[
          styles.text,
          {
            color: theme[TONE_TEXT[tone] as keyof typeof theme],
            fontSize: size === 'sm' ? 9 : 12,
          },
        ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
