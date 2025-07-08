import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';

interface Activity {
  title: string;
  subject: string;
  progress: number;
  lastWatched: string;
  status: 'in-progress' | 'completed';
}

interface RecentActivityProps {
  onActivityPress?: (activity: Activity) => void;
  onViewAllPress?: () => void;
}

const activities: Activity[] = [
  {
    title: 'Differential Equations - Part 3',
    subject: 'Mathematics',
    progress: 85,
    lastWatched: '2h ago',
    status: 'in-progress',
  },
  {
    title: 'Molecular Orbital Theory',
    subject: 'Chemistry',
    progress: 100,
    lastWatched: '1d ago',
    status: 'completed',
  },
  {
    title: 'Data Structures: Binary Trees',
    subject: 'Computer Science',
    progress: 45,
    lastWatched: '2d ago',
    status: 'in-progress',
  },
];

export const RecentActivity: React.FC<RecentActivityProps> = ({
  onActivityPress,
  onViewAllPress,
}) => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activities.map((activity, index) => (
          <TouchableOpacity
            key={index}
            style={styles.activityItem}
            onPress={() => onActivityPress?.(activity)}
            activeOpacity={0.8}
          >
            <View style={styles.statusIndicator}>
              {activity.status === 'completed' ? (
                <MaterialCommunityIcons 
                  name="check-circle" 
                  size={16} 
                  color={theme.colors.blue[200]} 
                />
              ) : (
                <View style={styles.inProgressDot} />
              )}
            </View>

            <View style={styles.itemContent}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {activity.title}
              </Text>
              <View style={styles.itemDetails}>
                <Text style={styles.subject}>{activity.subject}</Text>
                <Text style={styles.lastWatched}>{activity.lastWatched}</Text>
              </View>

              {activity.status === 'in-progress' && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${activity.progress}%` }
                    ]} 
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  viewAllText: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
  content: {
    gap: theme.spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 64, 175, 0.2)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  inProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.blue[300],
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 8,
  },
  subject: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
  lastWatched: {
    color: theme.colors.blue[300],
    fontSize: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 2,
  },
});
