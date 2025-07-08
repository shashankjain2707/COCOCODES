import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

// Import screens
import { HomeScreen } from '../screens/home/HomeScreen';

// Placeholder screens for other tabs
const LibraryScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Library Screen</Text>
    <Text style={styles.placeholderSubtext}>Coming soon...</Text>
  </View>
);

const AddScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Add Video</Text>
    <Text style={styles.placeholderSubtext}>Add new learning content</Text>
  </View>
);

const StatsScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Statistics</Text>
    <Text style={styles.placeholderSubtext}>Your learning analytics</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Profile</Text>
    <Text style={styles.placeholderSubtext}>Manage your account</Text>
  </View>
);

const Tab = createBottomTabNavigator();

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIcon}>
              <Text style={[styles.iconText, { color }]}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIcon}>
              <Text style={[styles.iconText, { color }]}>📚</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Add"
        component={AddScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={[
              styles.tabIcon,
              styles.addTabIcon,
              { backgroundColor: focused ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)' }
            ]}>
              <Text style={[styles.iconText, { color: focused ? '#FFFFFF' : color }]}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIcon}>
              <Text style={[styles.iconText, { color }]}>📊</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.tabIcon}>
              <Text style={[styles.iconText, { color }]}>👤</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  addTabIcon: {
    borderRadius: 14,
    width: 32,
    height: 32,
  },
  iconText: {
    fontSize: 20,
  },
});
