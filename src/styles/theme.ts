// EduTube Theme Configuration
export const theme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    background: '#0a0a0a',
    surface: 'rgba(255,255,255,0.05)',
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.7)',
    warning: '#F59E0B',
    error: '#EF4444',
    success: '#10B981',
    accent: '#8B5CF6',
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
