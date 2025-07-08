import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { QuickActionsProps } from '../../types/home';

export const QuickActions: React.FC<QuickActionsProps> = ({
  continueSession,
  onContinuePress,
  onNewSessionPress,
  onLibraryPress,
  onStatsPress,
}) => {
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);

  const actions = [
    {
      id: "continue",
      label: "Continue",
      sublabel: continueSession ? `${continueSession.title} - ${continueSession.progress}%` : "Calculus III - 65%",
      icon: "play",
      onPress: onContinuePress,
      gradient: ['#2563EB', '#1D4ED8'], // from-blue-600 to-blue-700
      progress: continueSession?.progress || 65,
      isPrimary: true,
    },
    {
      id: "new-session",
      label: "New Session", 
      sublabel: "Start fresh",
      icon: "plus",
      onPress: onNewSessionPress,
      gradient: ['#475569', '#1E40AF'], // from-navy-600 to-blue-800
      isPrimary: true,
    },
    {
      id: "library",
      label: "Library",
      sublabel: "24 saved",
      icon: "book-open-variant",
      onPress: onLibraryPress,
      gradient: ['rgba(30, 64, 175, 0.2)', 'rgba(30, 64, 175, 0.3)'], // from-blue-900/20 to-blue-800/30
      border: true,
    },
    {
      id: "stats",
      label: "Stats", 
      sublabel: "2h 45m today",
      icon: "chart-bar",
      onPress: onStatsPress,
      gradient: ['rgba(30, 64, 175, 0.2)', 'rgba(30, 64, 175, 0.3)'], // from-blue-900/20 to-blue-800/30
      border: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Actions</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="target" size={12} color={theme.colors.blue[300]} />
            <Text style={styles.statText}>Goal: 3h</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={12} color={theme.colors.blue[300]} />
            <Text style={styles.statText}>15m left</Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              action.border && styles.borderedButton,
              action.isPrimary && styles.primaryButton,
            ]}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            <View style={styles.actionContent}>
              <MaterialCommunityIcons 
                name={action.icon as any} 
                size={16} 
                color={theme.colors.white} 
                style={styles.actionIcon}
              />
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionSublabel}>{action.sublabel}</Text>

              {/* Progress indicator for continue learning */}
              {action.id === "continue" && action.progress && (
                <View style={styles.progressIndicator}>
                  <View style={styles.progressTrack}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${action.progress}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
    borderRadius: theme.borderRadius.xl, // rounded-xl
    padding: 24, // p-6
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)', // border-blue-500/20
    shadowColor: 'rgba(30, 64, 175, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16, // mb-4
  },
  title: {
    fontSize: 16, // text-base
    fontWeight: '500', // font-medium
    color: theme.colors.white,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16, // space-x-4
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // space-x-1
  },
  statText: {
    fontSize: 12, // text-xs
    color: theme.colors.blue[300], // text-blue-300
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // gap-3
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    height: 64, // h-16
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(30, 64, 175, 0.2)', // default background
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: '#2563EB', // blue-600
  },
  borderedButton: {
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)', // border-blue-500/30
  },
  actionContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
  },
  actionIcon: {
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: theme.colors.white,
    marginBottom: 2,
  },
  actionSublabel: {
    fontSize: 12, // text-xs
    color: 'rgba(255, 255, 255, 0.8)', // opacity-80
  },
  progressIndicator: {
    position: 'absolute',
    bottom: -8, // -bottom-2
    left: 0,
    right: 0,
  },
  progressTrack: {
    width: '100%',
    height: 4, // h-1
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // bg-white/20
    borderRadius: 2, // rounded-full
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 2, // rounded-full
  },
});
