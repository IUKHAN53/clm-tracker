// CLM Tracker - Healthcare Design System
// Based on UI/UX Pro Max: Accessible & Ethical style
// Palette: Calm cyan + health green

export const theme = {
  primary: '#0891B2',
  primaryLight: '#22D3EE',
  primaryDark: '#0E7490',
  secondary: '#059669',
  secondaryLight: '#34D399',

  background: '#F0FDFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FFFE',

  text: '#164E63',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',

  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',

  // Status colors
  status: {
    vaccinated: '#10B981',
    vaccinatedBg: '#D1FAE5',
    refusal: '#DC2626',
    refusalBg: '#FEE2E2',
    zeroDose: '#F59E0B',
    zeroDoseBg: '#FEF3C7',
    pending: '#6B7280',
    pendingBg: '#F3F4F6',
  },

  // Metric card accents
  metrics: {
    totalBg: '#EFF6FF',
    totalIcon: '#3B82F6',
    vaccinatedBg: '#D1FAE5',
    vaccinatedIcon: '#10B981',
    pendingBg: '#FEF3C7',
    pendingIcon: '#F59E0B',
    zeroDoseBg: '#FEE2E2',
    zeroDoseIcon: '#EF4444',
  },

  shadow: {
    color: '#000',
    opacity: 0.08,
    offset: { width: 0, height: 2 },
    radius: 8,
    elevation: 3,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const font = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

// Legacy export for compatibility with template
const Colors = {
  light: {
    text: theme.text,
    background: theme.background,
    tint: theme.primary,
    tabIconDefault: theme.textMuted,
    tabIconSelected: theme.primary,
  },
  dark: {
    text: '#ECFEFF',
    background: '#0C1A25',
    tint: '#22D3EE',
    tabIconDefault: '#64748B',
    tabIconSelected: '#22D3EE',
  },
};

export default Colors;
