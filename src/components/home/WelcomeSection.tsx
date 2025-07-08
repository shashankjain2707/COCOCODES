import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { theme } from '../../styles/theme';
import { WelcomeSectionProps } from '../../types/home';

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      {/* Main Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreeting()}, {user.name} 👋</Text>
          <Text style={styles.subtitle}>Ready to continue your learning journey?</Text>
        </View>
        
        <View style={styles.studyStatsCard}>
          <View style={styles.studyTimeSection}>
            <View style={styles.timeIconContainer}>
              <Text style={styles.timeIcon}>⏰</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.studyTime}>{user.studyTime}</Text>
              <Text style={styles.studyTimeLabel}>today</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressTitleContainer}>
              <Text style={styles.progressIcon}>🎯</Text>
              <Text style={styles.progressTitle}>Daily Goal</Text>
            </View>
            <Text style={styles.progressPercentage}>{user.dailyGoalProgress}%</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${user.dailyGoalProgress}%` }
                ]} 
              />
              <View style={styles.progressBarGlow} />
            </View>
          </View>
          
          <Text style={styles.progressSubtext}>
            Great progress! You're almost there.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  heroSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  greetingContainer: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 38,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    opacity: 0.9,
  },
  studyStatsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    minWidth: 120,
  },
  studyTimeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  timeIcon: {
    fontSize: 16,
  },
  timeInfo: {
    flex: 1,
  },
  studyTime: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700' as const,
    color: theme.colors.text,
    lineHeight: 22,
  },
  studyTimeLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
  progressSection: {
    marginTop: theme.spacing.md,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  progressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  progressTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  progressPercentage: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.primary,
  },
  progressBarContainer: {
    marginBottom: theme.spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    position: 'relative',
  },
  progressBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
    opacity: 0.3,
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    opacity: 0.8,
  },
});
