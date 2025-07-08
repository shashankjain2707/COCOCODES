import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { GlassCard } from '../../components/common/GlassCard';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

interface StatCard {
  title: string;
  value: string | number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsScreen: React.FC = () => {
  const { userData, isAuthenticated } = useAuth();

  if (!isAuthenticated || !userData) {
    return (
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="chart-line"
            size={64}
            color={theme.colors.slate[400]}
          />
          <Text style={styles.emptyTitle}>No Statistics Available</Text>
          <Text style={styles.emptySubtitle}>Sign in to track your learning progress</Text>
        </View>
      </LinearGradient>
    );
  }

  const statCards: StatCard[] = [
    {
      title: 'Total Study Time',
      value: `${userData.stats?.totalStudyMinutes || 0} min`,
      icon: 'clock',
      color: theme.colors.blue[400],
      trend: {
        value: 12,
        isPositive: true,
      },
    },
    {
      title: 'Current Streak',
      value: `${userData.stats?.currentStreak || 0} days`,
      icon: 'fire',
      color: theme.colors.orange[400],
      trend: {
        value: 3,
        isPositive: true,
      },
    },
    {
      title: 'Courses Completed',
      value: userData.stats?.coursesCompleted || 0,
      icon: 'book-check',
      color: theme.colors.green[400],
    },
    {
      title: 'Daily Goal',
      value: `${userData.studyPreferences?.dailyGoalMinutes || 0} min`,
      icon: 'target',
      color: theme.colors.purple[400],
    },
  ];

  const weeklyData = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 25 },
    { day: 'Fri', minutes: 75 },
    { day: 'Sat', minutes: 20 },
    { day: 'Sun', minutes: 40 },
  ];

  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes));

  return (
    <LinearGradient
      colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Learning Statistics</Text>
          <Text style={styles.subtitle}>Track your progress and achievements</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <GlassCard key={index} style={styles.statCard}>
              <View style={styles.statHeader}>
                <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                  <MaterialCommunityIcons
                    name={stat.icon}
                    size={24}
                    color={stat.color}
                  />
                </View>
                {stat.trend && (
                  <View style={styles.trendContainer}>
                    <MaterialCommunityIcons
                      name={stat.trend.isPositive ? 'trending-up' : 'trending-down'}
                      size={16}
                      color={stat.trend.isPositive ? theme.colors.green[400] : theme.colors.error}
                    />
                    <Text style={[
                      styles.trendText,
                      { color: stat.trend.isPositive ? theme.colors.green[400] : theme.colors.error }
                    ]}>
                      {stat.trend.value}%
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Weekly Progress Chart */}
        <GlassCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Study Time</Text>
          <View style={styles.chart}>
            {weeklyData.map((day, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (day.minutes / maxMinutes) * 100,
                        backgroundColor: day.minutes > 0 ? theme.colors.blue[500] : theme.colors.slate[600],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{day.day}</Text>
                <Text style={styles.barValue}>{day.minutes}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Subject Progress */}
        <GlassCard style={styles.subjectCard}>
          <Text style={styles.chartTitle}>Subject Progress</Text>
          {userData.studyPreferences?.preferredSubjects?.length > 0 ? (
            <View style={styles.subjectList}>
              {userData.studyPreferences.preferredSubjects.slice(0, 5).map((subject, index) => {
                const progress = Math.random() * 100; // Mock progress data
                return (
                  <View key={index} style={styles.subjectItem}>
                    <View style={styles.subjectHeader}>
                      <Text style={styles.subjectName}>{subject}</Text>
                      <Text style={styles.subjectProgress}>{Math.round(progress)}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: theme.colors.blue[500],
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptySubjects}>
              <Text style={styles.emptySubjectsText}>
                No preferred subjects selected. Update your preferences to see progress.
              </Text>
            </View>
          )}
        </GlassCard>

        {/* Achievement Section */}
        <GlassCard style={styles.achievementCard}>
          <Text style={styles.chartTitle}>Recent Achievements</Text>
          <View style={styles.achievementList}>
            <View style={styles.achievementItem}>
              <MaterialCommunityIcons
                name="trophy"
                size={32}
                color={theme.colors.yellow[400]}
              />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>First Week Complete!</Text>
                <Text style={styles.achievementDescription}>
                  Completed your first week of consistent learning
                </Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <MaterialCommunityIcons
                name="star"
                size={32}
                color={theme.colors.blue[400]}
              />
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>Study Streak</Text>
                <Text style={styles.achievementDescription}>
                  Maintained a 3-day study streak
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.slate[300],
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.slate[400],
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 56) / 2,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: theme.colors.slate[300],
  },
  chartCard: {
    padding: 20,
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 24,
    minHeight: 4,
    borderRadius: 12,
  },
  barLabel: {
    fontSize: 12,
    color: theme.colors.slate[400],
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: theme.colors.slate[300],
  },
  subjectCard: {
    padding: 20,
    marginBottom: 24,
  },
  subjectList: {
    gap: 16,
  },
  subjectItem: {
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '500',
  },
  subjectProgress: {
    fontSize: 14,
    color: theme.colors.blue[400],
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.slate[700],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptySubjects: {
    padding: 20,
    alignItems: 'center',
  },
  emptySubjectsText: {
    fontSize: 14,
    color: theme.colors.slate[400],
    textAlign: 'center',
  },
  achievementCard: {
    padding: 20,
    marginBottom: 24,
  },
  achievementList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: theme.colors.slate[300],
  },
});
