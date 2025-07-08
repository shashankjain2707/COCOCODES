import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';
import { useAuth } from '../../hooks/useAuth';

export const AuthTestPanel: React.FC = () => {
  const {
    user,
    userData,
    isAuthenticated,
    signOut,
    updateStudyStats,
    createStudySession,
  } = useAuth();

  const handleTestStudySession = async () => {
    const result = await createStudySession({
      videoId: 'test-video-123',
      title: 'Test Physics Video',
      duration: 15,
      subject: 'Physics',
    });

    if (result.success) {
      Alert.alert('Success', 'Study session recorded!');
      // Update stats too
      await updateStudyStats(15);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleUpdateStats = async () => {
    const result = await updateStudyStats(30);
    if (result.success) {
      Alert.alert('Success', 'Study stats updated!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <GlassCard style={styles.container}>
        <Text style={styles.text}>Please sign in to test authentication</Text>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Authentication Test Panel</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.label}>User ID:</Text>
        <Text style={styles.value}>{user.uid}</Text>
        
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
        
        <Text style={styles.label}>Display Name:</Text>
        <Text style={styles.value}>{user.displayName || 'Not set'}</Text>
        
        {userData && (
          <>
            <Text style={styles.label}>Total Study Minutes:</Text>
            <Text style={styles.value}>{userData.stats?.totalStudyMinutes || 0}</Text>
            
            <Text style={styles.label}>Daily Goal:</Text>
            <Text style={styles.value}>{userData.studyPreferences?.dailyGoalMinutes || 0} min</Text>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleTestStudySession}
        >
          <MaterialCommunityIcons name="play" size={20} color={theme.colors.white} />
          <Text style={styles.buttonText}>Test Study Session</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.testButton} 
          onPress={handleUpdateStats}
        >
          <MaterialCommunityIcons name="chart-line" size={20} color={theme.colors.white} />
          <Text style={styles.buttonText}>Update Stats (+30 min)</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.testButton, styles.signOutButton]} 
          onPress={signOut}
        >
          <MaterialCommunityIcons name="logout" size={20} color={theme.colors.white} />
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 20,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    color: theme.colors.white,
    textAlign: 'center',
    fontSize: 16,
  },
  userInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.blue[300],
    marginTop: 10,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: theme.colors.white,
    marginBottom: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue[600],
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  signOutButton: {
    backgroundColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
