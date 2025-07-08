import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';

export type RootStackParamList = {
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      {/* Add other screens here as they are developed */}
    </Stack.Navigator>
  );
};
