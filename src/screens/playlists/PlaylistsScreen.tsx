import React, { useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchUserPlaylists } from '../../store/userContentSlice';
import { Playlist } from '../../types/userContent';
import PlaylistList from '../../components/playlists/PlaylistList';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type PlaylistsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Playlists'>;

const PlaylistsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<PlaylistsScreenNavigationProp>();
  const { 
    playlists, 
    playlistsLoading 
  } = useSelector((state: RootState) => state.userContent);
  const userId = useSelector((state: RootState) => state.auth.user?.uid);

  // Convert playlists object to array
  const playlistsArray = Object.values(playlists);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserPlaylists(userId));
    }
  }, [dispatch, userId]);

  const handlePlaylistPress = (playlist: Playlist) => {
    navigation.navigate('PlaylistDetail', { playlistId: playlist.id });
  };

  const handleAddPlaylist = () => {
    navigation.navigate('PlaylistForm', {});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
      </View>
      
      <PlaylistList 
        playlists={playlistsArray}
        loading={playlistsLoading}
        onPlaylistPress={handlePlaylistPress}
        onAddPress={handleAddPlaylist}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PlaylistsScreen;
