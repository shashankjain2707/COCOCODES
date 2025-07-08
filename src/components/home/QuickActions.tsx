import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../styles/theme';
import { QuickActionsProps } from '../../types/home';
import { GlassCard } from '../common/GlassCard';

export const QuickActions: React.FC<QuickActionsProps> = ({
  continueSession,
  onContinuePress,
  onNewSessionPress,
  onLibraryPress,
  onStatsPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>Jump back into learning</Text>
      </View>
      
      {/* Primary Actions Grid */}
      <View style={styles.primaryActionsGrid}>
        {/* Continue Session Card */}
        <TouchableOpacity style={styles.primaryCard} onPress={onContinuePress}>
          <View style={styles.primaryCardContent}>
            <View style={styles.primaryIconContainer}>
              <View style={styles.playIconBackground}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
            <View style={styles.primaryCardText}>
              <Text style={styles.primaryCardTitle}>Continue</Text>
              <Text style={styles.primaryCardSubtitle}>Resume learning</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* New Session Card */}
        <TouchableOpacity style={styles.primaryCard} onPress={onNewSessionPress}>
          <View style={styles.primaryCardContent}>
            <View style={styles.primaryIconContainer}>
              <View style={styles.addIconBackground}>
                <Text style={styles.addIcon}>+</Text>
              </View>
            </View>
            <View style={styles.primaryCardText}>
              <Text style={styles.primaryCardTitle}>New Session</Text>
              <Text style={styles.primaryCardSubtitle}>Start fresh</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowIcon}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Secondary Actions */}
      <View style={styles.secondaryActionsGrid}>
        <TouchableOpacity style={styles.secondaryCard} onPress={onLibraryPress}>
          <View style={styles.secondaryCardContent}>
            <View style={styles.secondaryIconContainer}>
              <Text style={styles.secondaryIcon}>📚</Text>
            </View>
            <Text style={styles.secondaryCardTitle}>Library</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCard} onPress={onStatsPress}>
          <View style={styles.secondaryCardContent}>
            <View style={styles.secondaryIconContainer}>
              <Text style={styles.secondaryIcon}>📊</Text>
            </View>
            <Text style={styles.secondaryCardTitle}>Stats</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
  primaryActionsGrid: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  primaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: theme.spacing.sm,
  },
  primaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryIconContainer: {
    marginRight: theme.spacing.md,
  },
  playIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addIconBackground: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playIcon: {
    fontSize: 18,
    color: theme.colors.text,
    marginLeft: 2,
  },
  addIcon: {
    fontSize: 24,
    color: theme.colors.text,
    fontWeight: '300' as const,
  },
  primaryCardText: {
    flex: 1,
  },
  primaryCardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  primaryCardSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    opacity: 0.8,
  },
  cardArrow: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    opacity: 0.6,
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  secondaryCardContent: {
    alignItems: 'center',
  },
  secondaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  secondaryIcon: {
    fontSize: 20,
  },
  secondaryCardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
