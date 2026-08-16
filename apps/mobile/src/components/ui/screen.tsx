import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  footer?: React.ReactNode;
}

export function Screen({ scroll = false, style, contentContainerStyle, footer, children, ...rest }: ScreenProps) {
  const theme = useTheme();

  const content = <View style={[styles.content, contentContainerStyle as object]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        <View style={styles.flex}>{content}</View>
      )}
      {footer ? (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>{footer}</View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    gap: Spacing.five,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.three,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
  },
});
