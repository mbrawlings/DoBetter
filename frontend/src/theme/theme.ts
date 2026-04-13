import { MD3LightTheme } from 'react-native-paper';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const theme = {
  ...MD3LightTheme,
  roundness: 16,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#5856D6',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EEEDFF',
    secondary: '#8E8E93',
    tertiary: '#34C759',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceVariant: '#E8E8ED',
    surfaceDisabled: '#F2F2F7',
    error: '#FF3B30',
    outline: '#C7C7CC',
    onSurface: '#1C1C1E',
    onSurfaceVariant: '#6E6E73',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#F9F9FB',
      level3: '#F2F2F7',
      level4: '#EEEEF0',
      level5: '#E8E8ED',
    },
  },
} as const;

export const avatarColors = [
  '#5856D6',
  '#FF2D55',
  '#FF9500',
  '#34C759',
  '#007AFF',
  '#AF52DE',
  '#FF3B30',
  '#5AC8FA',
  '#FFCC00',
  '#00C7BE',
] as const;

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${(firstName[0] ?? '').toUpperCase()}${(lastName[0] ?? '').toUpperCase()}`;
}
