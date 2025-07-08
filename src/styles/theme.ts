// EduTube Theme Configuration
export const theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#020617', // slate-950 to match the gradient background
    surface: 'rgba(255,255,255,0.05)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#10B981',
    accent: '#8B5CF6',
    white: '#FFFFFF',
    // Blue color palette for glassmorphism
    blue: {
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },
    navy: {
      500: '#334155',
      600: '#475569',
      700: '#64748B',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    slate: {
      300: '#CBD5E1',
      400: '#94A3B8',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      950: '#020617',
    },
    green: {
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
    },
    purple: {
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
    },
    yellow: {
      300: '#FDE047',
      400: '#FACC15',
      500: '#EAB308',
    },
    orange: {
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
    },
  },
  
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
  },
  
  shadows: {
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

export type Theme = typeof theme;
