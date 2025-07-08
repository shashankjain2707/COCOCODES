import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Playlist } from '../../types/userContent';
import PlaylistCard from './PlaylistCard';

interface PlaylistListProps {
  playlists: Playlist[];
  loading: boolean;
  onPlaylistPress: (playlist: Playlist) => void;
  onAddPress: () => void;
}

const PlaylistList: React.FC<PlaylistListProps> = ({
  playlists,
  loading,
  onPlaylistPress,
  onAddPress,
}) => {
  // If there are no playlists and we're not loading
  if (playlists.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="playlist-plus" size={64} color="#3B82F6" />
        <Text style={styles.emptyTitle}>No Playlists Yet</Text>
        <Text style={styles.emptyText}>
          Create your first playlist to organize your educational videos
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={onAddPress}>
          <Text style={styles.emptyButtonText}>Create Playlist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading playlists...</Text>
      </View>
    );
  }

  // Render the playlist list
  return (
    <FlatList
      data={playlists}
      renderItem={({ item }) => (
        <PlaylistCard playlist={item} onPress={onPlaylistPress} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <Icon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Playlist</Text>
        </TouchableOpacity>
      }
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PlaylistList;
