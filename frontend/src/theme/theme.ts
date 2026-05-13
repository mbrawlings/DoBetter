import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import {
  avatarPalette,
  colorsDark,
  colorsLight,
  fontFamily,
  radius,
  shadows,
  spacing,
  typography,
} from './tokens';

export { spacing, radius, typography, shadows, fontFamily, avatarPalette, colorsLight, colorsDark };
export type { ColorTokens } from './tokens';

const fontConfig = {
  displayLarge: { fontFamily: fontFamily.bold, fontWeight: '700' as const, fontSize: 34, letterSpacing: -0.8, lineHeight: 41 },
  displayMedium: { fontFamily: fontFamily.bold, fontWeight: '700' as const, fontSize: 28, letterSpacing: -0.6, lineHeight: 34 },
  displaySmall: { fontFamily: fontFamily.bold, fontWeight: '700' as const, fontSize: 22, letterSpacing: -0.5, lineHeight: 28 },
  headlineLarge: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 22, letterSpacing: -0.4, lineHeight: 28 },
  headlineMedium: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 18, letterSpacing: -0.3, lineHeight: 24 },
  headlineSmall: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  titleLarge: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 17, letterSpacing: -0.2, lineHeight: 22 },
  titleMedium: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 16, letterSpacing: -0.2, lineHeight: 22 },
  titleSmall: { fontFamily: fontFamily.medium, fontWeight: '500' as const, fontSize: 14, letterSpacing: 0, lineHeight: 20 },
  labelLarge: { fontFamily: fontFamily.semibold, fontWeight: '600' as const, fontSize: 14, letterSpacing: 0, lineHeight: 20 },
  labelMedium: { fontFamily: fontFamily.medium, fontWeight: '500' as const, fontSize: 13, letterSpacing: 0, lineHeight: 18 },
  labelSmall: { fontFamily: fontFamily.medium, fontWeight: '500' as const, fontSize: 12, letterSpacing: 0.4, lineHeight: 16 },
  bodyLarge: { fontFamily: fontFamily.regular, fontWeight: '400' as const, fontSize: 16, letterSpacing: -0.1, lineHeight: 22 },
  bodyMedium: { fontFamily: fontFamily.regular, fontWeight: '400' as const, fontSize: 15, letterSpacing: -0.1, lineHeight: 20 },
  bodySmall: { fontFamily: fontFamily.regular, fontWeight: '400' as const, fontSize: 13, letterSpacing: 0, lineHeight: 18 },
} as const;

const paperFonts = configureFonts({ config: fontConfig });

export const theme = {
  ...MD3LightTheme,
  roundness: radius.lg,
  fonts: paperFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: colorsLight.primary,
    onPrimary: colorsLight.primaryFg,
    primaryContainer: colorsLight.primarySoft,
    onPrimaryContainer: colorsLight.primary,
    secondary: colorsLight.textMuted,
    onSecondary: colorsLight.surface,
    tertiary: colorsLight.success,
    background: colorsLight.bg,
    onBackground: colorsLight.text,
    surface: colorsLight.surface,
    onSurface: colorsLight.text,
    surfaceVariant: colorsLight.raised,
    onSurfaceVariant: colorsLight.textMuted,
    surfaceDisabled: colorsLight.raised,
    onSurfaceDisabled: colorsLight.textFaint,
    error: colorsLight.danger,
    onError: colorsLight.primaryFg,
    outline: colorsLight.border,
    outlineVariant: colorsLight.borderStrong,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: 'transparent',
      level1: colorsLight.surface,
      level2: colorsLight.surface,
      level3: colorsLight.raised,
      level4: colorsLight.raised,
      level5: colorsLight.raised,
    },
  },
} as const;

export const themeDark = {
  ...MD3DarkTheme,
  roundness: radius.lg,
  fonts: paperFonts,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colorsDark.primary,
    onPrimary: colorsDark.primaryFg,
    primaryContainer: colorsDark.primarySoft,
    onPrimaryContainer: colorsDark.primary,
    secondary: colorsDark.textMuted,
    background: colorsDark.bg,
    onBackground: colorsDark.text,
    surface: colorsDark.surface,
    onSurface: colorsDark.text,
    surfaceVariant: colorsDark.raised,
    onSurfaceVariant: colorsDark.textMuted,
    error: colorsDark.danger,
    outline: colorsDark.border,
    outlineVariant: colorsDark.borderStrong,
  },
} as const;

export const avatarColors = avatarPalette;

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarPalette[Math.abs(hash) % avatarPalette.length];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${(firstName[0] ?? '').toUpperCase()}${(lastName[0] ?? '').toUpperCase()}`;
}
