import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';

interface GlassCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'gradient' | 'bordered';
  pressable?: boolean;
  gradientColors?: string[];
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'glass',
  pressable = false,
  gradientColors,
  ...props
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case 'glass':
        return styles.glassCard;
      case 'gradient':
        return styles.gradientCard;
      case 'bordered':
        return styles.borderedCard;
      default:
        return styles.defaultCard;
    }
  };

  const CardContent = () => (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );

  const GradientCard = () => (
    <LinearGradient
      colors={['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)']}
      style={[getCardStyle(), style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );

  if (pressable) {
    return (
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.8}
        {...props}
      >
        {variant === 'gradient' ? <GradientCard /> : <CardContent />}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {variant === 'gradient' ? <GradientCard /> : <CardContent />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.xs,
  },
  defaultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
    borderRadius: theme.borderRadius.xl, // rounded-xl
    padding: theme.spacing.lg, // p-6
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // border-white/10
    // Note: backdrop-blur-xl effect simulated with shadow
    shadowColor: 'rgba(59, 130, 246, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  gradientCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  borderedCard: {
    backgroundColor: 'transparent',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
});
