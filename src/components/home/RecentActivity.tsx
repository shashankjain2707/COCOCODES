import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../styles/theme';
import { RecentActivityProps } from '../../types/home';
import { GlassCard } from '../common/GlassCard';

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onActivityPress,
  onViewAllPress,
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '📹';
      case 'quiz':
        return '🧠';
      case 'playlist':
        return '📚';
      default:
        return '📹';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activitiesList}>
        {activities.map((activity) => (
          <GlassCard
            key={activity.id}
            style={styles.activityCard}
            pressable
            onPress={() => onActivityPress(activity)}
            variant="glass"
          >
            <View style={styles.activityContent}>
              <View style={styles.thumbnailPlaceholder}>
                <Text style={styles.activityIcon}>
                  {getActivityIcon(activity.type)}
                </Text>
              </View>
              
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {activity.title}
                </Text>
                <Text style={styles.activitySubtitle}>
                  {activity.timestamp}
                </Text>
                {activity.duration && (
                  <Text style={styles.activityDuration}>
                    ⏰ {activity.duration}
                  </Text>
                )}
              </View>

              {activity.completed && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓</Text>
                </View>
              )}
            </View>
          </GlassCard>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500' as const,
  },
  activitiesList: {
    gap: theme.spacing.sm,
  },
  activityCard: {
    marginBottom: theme.spacing.sm,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityIcon: {
    fontSize: 24,
  },
  activityInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  activityTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500' as const,
    color: theme.colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activityDuration: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600' as const,
  },
});
