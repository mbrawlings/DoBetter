import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  roundness: 12,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    secondary: '#9c27b0',
    tertiary: '#03a9f4',
    background: '#f5f5f5',
    surface: '#ffffff',
    error: '#d32f2f',
  },
} as const;


