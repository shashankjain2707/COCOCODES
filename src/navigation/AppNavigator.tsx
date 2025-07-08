import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { RootState } from '../store';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  Player: { videoId: string; title: string };
  AddVideo: undefined;
  CategoryVideos: { categoryId: string; categoryName: string };
  AllCategories: undefined;
  ActivityHistory: undefined;
  PlaylistDetail: { playlistId: string; title: string };
  Explore: undefined;
  Library: undefined;
  Stats: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
      {/* Add other screens here as they are developed */}
    </Stack.Navigator>
  );
};
