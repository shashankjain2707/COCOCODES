import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';

export const WelcomeSection: React.FC = () => {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening, Alex</Text>
          <Text style={styles.subtitle}>Ready to continue learning?</Text>
        </View>

        <View style={styles.timeSection}>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.blue[100]} />
            <Text style={styles.timeText}>2h 45m</Text>
          </View>
          <Text style={styles.timeLabel}>today</Text>
        </View>
      </View>

      {/* Enhanced Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Daily goal</Text>
          <Text style={styles.progressPercentage}>92%</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: '92%' }]} />
        </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '500',
    color: theme.colors.white,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colors.blue[200],
    fontSize: 14,
  },
  timeSection: {
    alignItems: 'flex-end',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.blue[100],
    marginLeft: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: theme.colors.blue[300],
  },
  progressSection: {
    marginTop: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: theme.colors.blue[300],
  },
  progressPercentage: {
    fontSize: 12,
    color: theme.colors.blue[300],
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(30, 64, 175, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.blue[500],
    borderRadius: 4,
    shadowColor: 'rgba(59, 130, 246, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
});
