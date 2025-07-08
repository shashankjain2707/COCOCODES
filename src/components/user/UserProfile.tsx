import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';
import { useAuth } from '../../hooks/useAuth';
import { UserData } from '../../services/firebase/auth';

const { width } = Dimensions.get('window');

export const UserProfile: React.FC = () => {
  const { userData, updatePreferences, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState<UserData['studyPreferences']>(
    userData?.studyPreferences || {
      dailyGoalMinutes: 60,
      preferredSubjects: [],
      difficulty: 'beginner',
    }
  );

  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Literature',
    'Geography',
    'Economics',
    'Psychology',
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', icon: 'star-outline' },
    { value: 'intermediate', label: 'Intermediate', icon: 'star-half-full' },
    { value: 'advanced', label: 'Advanced', icon: 'star' },
  ] as const;

  const handleSavePreferences = async () => {
    const result = await updatePreferences(preferences);
    if (result.success) {
      setIsEditing(false);
      Alert.alert('Success', 'Preferences updated successfully!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...prev.preferredSubjects, subject],
    }));
  };

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <GlassCard style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons
                name="account"
                size={48}
                color={theme.colors.white}
              />
            </View>
          </View>
          <Text style={styles.displayName}>{userData.displayName}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </GlassCard>

        {/* Study Stats */}
        <GlassCard style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Study Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="clock"
                size={24}
                color={theme.colors.blue[400]}
              />
              <Text style={styles.statValue}>{userData.stats?.totalStudyMinutes || 0}</Text>
              <Text style={styles.statLabel}>Minutes Studied</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="book-check"
                size={24}
                color={theme.colors.green[400]}
              />
              <Text style={styles.statValue}>{userData.stats?.coursesCompleted || 0}</Text>
              <Text style={styles.statLabel}>Courses Completed</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="fire"
                size={24}
                color={theme.colors.orange[400]}
              />
              <Text style={styles.statValue}>{userData.stats?.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </GlassCard>

        {/* Study Preferences */}
        <GlassCard style={styles.preferencesCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Study Preferences</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <MaterialCommunityIcons
                name={isEditing ? "close" : "pencil"}
                size={20}
                color={theme.colors.blue[400]}
              />
            </TouchableOpacity>
          </View>

          {/* Daily Goal */}
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Daily Goal (minutes)</Text>
            {isEditing ? (
              <TextInput
                style={styles.goalInput}
                value={preferences.dailyGoalMinutes.toString()}
                onChangeText={(text) =>
                  setPreferences(prev => ({
                    ...prev,
                    dailyGoalMinutes: parseInt(text) || 0,
                  }))
                }
                keyboardType="numeric"
                placeholderTextColor={theme.colors.slate[400]}
              />
            ) : (
              <Text style={styles.preferenceValue}>{preferences.dailyGoalMinutes} min</Text>
            )}
          </View>

          {/* Difficulty Level */}
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Difficulty Level</Text>
            {isEditing ? (
              <View style={styles.difficultySelector}>
                {difficulties.map((diff) => (
                  <TouchableOpacity
                    key={diff.value}
                    style={[
                      styles.difficultyOption,
                      preferences.difficulty === diff.value && styles.difficultyOptionSelected,
                    ]}
                    onPress={() =>
                      setPreferences(prev => ({ ...prev, difficulty: diff.value }))
                    }
                  >
                    <MaterialCommunityIcons
                      name={diff.icon}
                      size={16}
                      color={
                        preferences.difficulty === diff.value
                          ? theme.colors.white
                          : theme.colors.slate[400]
                      }
                    />
                    <Text
                      style={[
                        styles.difficultyText,
                        preferences.difficulty === diff.value &&
                          styles.difficultyTextSelected,
                      ]}
                    >
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.preferenceValue}>
                {difficulties.find(d => d.value === preferences.difficulty)?.label}
              </Text>
            )}
          </View>

          {/* Preferred Subjects */}
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Preferred Subjects</Text>
            {isEditing ? (
              <View style={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectChip,
                      preferences.preferredSubjects.includes(subject) &&
                        styles.subjectChipSelected,
                    ]}
                    onPress={() => handleSubjectToggle(subject)}
                  >
                    <Text
                      style={[
                        styles.subjectText,
                        preferences.preferredSubjects.includes(subject) &&
                          styles.subjectTextSelected,
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.preferenceValue}>
                {preferences.preferredSubjects.length > 0
                  ? preferences.preferredSubjects.join(', ')
                  : 'None selected'}
              </Text>
            )}
          </View>

          {/* Save Button */}
          {isEditing && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePreferences}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Text>
            </TouchableOpacity>
          )}
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
  loadingText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.blue[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: theme.colors.slate[300],
  },
  statsCard: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  editButton: {
    padding: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.slate[300],
    textAlign: 'center',
  },
  preferencesCard: {
    padding: 20,
    marginBottom: 20,
  },
  preferenceItem: {
    marginBottom: 20,
  },
  preferenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 8,
  },
  preferenceValue: {
    fontSize: 14,
    color: theme.colors.slate[300],
  },
  goalInput: {
    backgroundColor: theme.colors.slate[800],
    borderRadius: 8,
    padding: 12,
    color: theme.colors.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.slate[600],
  },
  difficultySelector: {
    flexDirection: 'row',
    gap: 10,
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.slate[800],
    borderWidth: 1,
    borderColor: theme.colors.slate[600],
    gap: 6,
  },
  difficultyOptionSelected: {
    backgroundColor: theme.colors.blue[600],
    borderColor: theme.colors.blue[500],
  },
  difficultyText: {
    color: theme.colors.slate[300],
    fontSize: 14,
  },
  difficultyTextSelected: {
    color: theme.colors.white,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.slate[800],
    borderWidth: 1,
    borderColor: theme.colors.slate[600],
  },
  subjectChipSelected: {
    backgroundColor: theme.colors.blue[600],
    borderColor: theme.colors.blue[500],
  },
  subjectText: {
    color: theme.colors.slate[300],
    fontSize: 12,
  },
  subjectTextSelected: {
    color: theme.colors.white,
  },
  saveButton: {
    backgroundColor: theme.colors.blue[600],
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
