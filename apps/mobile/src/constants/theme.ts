/**
 * Brand palette + theme tokens for the NiVEST mobile app.
 * Light and dark mode colors defined centrally.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Brand = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#DBEAFE',
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#0284C7',
  infoLight: '#E0F2FE',
  textInverse: '#FFFFFF',
};

export const Colors = {
  light: {
    text: '#0F172A',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF2F7',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    ...Brand,
  },
  dark: {
    text: '#F1F5F9',
    background: '#0B1120',
    backgroundElement: '#111A2E',
    backgroundSelected: '#1E293B',
    textSecondary: '#94A3B8',
    border: '#1E293B',
    ...Brand,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
