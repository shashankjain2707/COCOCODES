import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { HomeScreen } from '../screens/home/HomeScreen';
import { AuthScreen } from '../screens/auth/AuthScreen';
import { CreatePlaylistScreen } from '../screens/playlists/CreatePlaylistScreen';
import { ImportPlaylistScreen } from '../screens/playlists/ImportPlaylistScreen';
import { AddNotesScreen } from '../screens/playlists/AddNotesScreen';
import { PlaylistDetailScreen } from '../screens/playlists/PlaylistDetailScreen';
import { LibraryScreen } from '../screens/playlists/LibraryScreen';
import { VideoPlayerScreen } from '../screens/player/VideoPlayerScreen';
import { RootState } from '../store';

export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Search: undefined;
  Notifications: undefined;
  VideoPlayer: { 
    videoId?: string; 
    video?: any; 
    playlist?: any; 
    autoplay?: boolean; 
    playlistId?: string;
    title?: string;
  };
  AddVideo: undefined;
  CategoryVideos: { categoryId: string; categoryName: string };
  AllCategories: undefined;
  ActivityHistory: undefined;
  PlaylistDetail: { playlistId: string; title: string };
  Explore: undefined;
  Library: undefined;
  Stats: undefined;
  Profile: undefined;
  CreatePlaylist: undefined;
  ImportPlaylist: undefined;
  AddNotes: undefined;
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
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Library" component={LibraryScreen} />
          <Stack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
          <Stack.Screen name="ImportPlaylist" component={ImportPlaylistScreen} />
          <Stack.Screen name="AddNotes" component={AddNotesScreen} />
          <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
          <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
      {/* Add other screens here as they are developed */}
    </Stack.Navigator>
  );
};
