import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';

export type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  Notifications: undefined;
  Player: { videoId: string; title: string };
  AddVideo: undefined;
  CategoryVideos: { categoryId: string; categoryName: string };
  AllCategories: undefined;
  ActivityHistory: undefined;
  PlaylistDetail: { playlistId: string; title: string };
  Explore: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      {/* Add other screens here as they are developed */}
    </Stack.Navigator>
  );
};
