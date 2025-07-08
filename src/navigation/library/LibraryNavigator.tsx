import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView, StyleSheet } from 'react-native';

// Import screens
import { LibraryScreen } from '../../screens/library/LibraryScreen';
import CategoriesScreen from '../../screens/categories/CategoriesScreen';
import CategoryDetailScreen from '../../screens/categories/CategoryDetailScreen';
import CategoryFormScreen from '../../screens/categories/CategoryFormScreen';
import PlaylistsScreen from '../../screens/playlists/PlaylistsScreen';
import PlaylistFormScreen from '../../screens/playlists/PlaylistFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

// Top-level tabs in the library
const LibraryTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#999',
        tabBarIndicatorStyle: {
          backgroundColor: '#3B82F6',
        },
      }}
    >
      <Tab.Screen name="Browse" component={LibraryScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen} />
    </Tab.Navigator>
  );
};

const LibraryNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="LibraryTabs" component={LibraryTabs} />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="CategoryForm" component={CategoryFormScreen} />
      <Stack.Screen name="PlaylistForm" component={PlaylistFormScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
});

export default LibraryNavigator;
