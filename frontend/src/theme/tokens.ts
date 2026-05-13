export const colorsLight = {
  bg: '#FAF7F2',
  surface: '#FFFFFF',
  raised: '#F4EFE7',
  primary: '#B85C3E',
  primaryFg: '#FFFFFF',
  primarySoft: '#F8E5DC',
  text: '#1B1714',
  textMuted: '#6F6860',
  textFaint: '#A6A096',
  border: '#ECE4D6',
  borderStrong: '#D8CCB4',
  success: '#6F8E3F',
  danger: '#C44A3E',
  focusedFieldBg: '#FFFBF5',
  giftIconBg: '#F2E9D9',
  giftIconFg: '#8E6A2A',
  backdrop: 'rgba(15,12,10,0.32)',
} as const;

export const colorsDark = {
  bg: '#1A1614',
  surface: '#211C18',
  raised: '#2A2520',
  primary: '#D17A5C',
  primaryFg: '#FFFFFF',
  primarySoft: '#3A1F16',
  text: '#F8F4ED',
  textMuted: '#9C958A',
  textFaint: '#5F594F',
  border: '#2F2925',
  borderStrong: '#3F3833',
  success: '#8FAE5A',
  danger: '#D86A5E',
  focusedFieldBg: '#2D2723',
  giftIconBg: '#3A3328',
  giftIconFg: '#D9B66E',
  backdrop: 'rgba(0,0,0,0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, fontWeight: '700', letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  headline: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, fontWeight: '400', letterSpacing: -0.1 },
  bodySm: { fontSize: 15, fontWeight: '400', letterSpacing: -0.1 },
  caption: { fontSize: 13, fontWeight: '500', letterSpacing: 0 },
  eyebrow: { fontSize: 12, fontWeight: '600', letterSpacing: 1.2 },
  mono: { fontSize: 11, fontWeight: '500', letterSpacing: 0.5 },
} as const;

export const shadows = {
  card: {
    shadowColor: '#1C140C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  primaryButton: {
    shadowColor: '#B85C3E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
  },
  modalSheet: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
} as const;

export const avatarPalette = [
  '#B85C3E',
  '#6F8E3F',
  '#3F7B8E',
  '#8E5C9C',
  '#C9963D',
  '#5D6E54',
  '#9C5C72',
  '#3F6E8E',
] as const;

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  fallback: 'System',
} as const;

export type ColorTokens = typeof colorsLight;
