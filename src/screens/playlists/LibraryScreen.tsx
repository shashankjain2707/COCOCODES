import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { playlistService, PlaylistData } from '../../services/playlists/playlistService';

export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation();
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPlaylists = async () => {
    try {
      const userPlaylists = await playlistService.getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaylists();
    setRefreshing(false);
  };

  const handlePlaylistPress = (playlist: PlaylistData) => {
    navigation.navigate('PlaylistDetail' as any, {
      playlistId: playlist.id,
      title: playlist.name,
    });
  };

  useEffect(() => {
    loadPlaylists();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Library</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreatePlaylist' as any)} style={styles.addButton}>
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playlists.length}</Text>
              <Text style={styles.statLabel}>Playlists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {playlists.reduce((total, playlist) => total + playlist.videos.length, 0)}
              </Text>
              <Text style={styles.statLabel}>Videos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {playlists.filter(p => p.type === 'imported').length}
              </Text>
              <Text style={styles.statLabel}>Imported</Text>
            </View>
          </View>

          {/* Playlists */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="loading" size={48} color={theme.colors.blue[400]} />
              <Text style={styles.loadingText}>Loading playlists...</Text>
            </View>
          ) : playlists.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="playlist-music" size={64} color={theme.colors.slate[400]} />
              <Text style={styles.emptyStateTitle}>No playlists yet</Text>
              <Text style={styles.emptyStateText}>Create your first playlist to get started</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('CreatePlaylist' as any)}
              >
                <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
                <Text style={styles.createButtonText}>Create Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsSection}>
              <Text style={styles.sectionTitle}>Your Playlists</Text>
              {playlists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  style={styles.playlistItem}
                  onPress={() => handlePlaylistPress(playlist)}
                >
                  <View style={styles.playlistInfo}>
                    <MaterialCommunityIcons 
                      name={playlist.type === 'imported' ? 'import' : 'playlist-music'} 
                      size={24} 
                      color={theme.colors.blue[400]} 
                    />
                    <View style={styles.playlistDetails}>
                      <Text style={styles.playlistName}>{playlist.name}</Text>
                      <Text style={styles.playlistMeta}>
                        {playlist.videos.length} video{playlist.videos.length !== 1 ? 's' : ''} • {playlist.type}
                      </Text>
                      {playlist.description && (
                        <Text style={styles.playlistDescription} numberOfLines={2}>
                          {playlist.description}
                        </Text>
                      )}
                      {/* Progress indicator */}
                      {(() => {
                        const progress = playlistService.getPlaylistProgress(playlist);
                        return progress.totalVideos > 0 && progress.completedVideos > 0 ? (
                          <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                              <View 
                                style={[
                                  styles.progressFill, 
                                  { width: `${progress.completionPercentage}%` }
                                ]} 
                              />
                            </View>
                            <Text style={styles.progressText}>
                              {progress.completedVideos}/{progress.totalVideos} completed
                            </Text>
                          </View>
                        ) : null;
                      })()}
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.slate[400]} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('CreatePlaylist' as any)}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Create Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('ImportPlaylist' as any)}
            >
              <MaterialCommunityIcons name="import" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Import from YouTube</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.2)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.slate[400],
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 48,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.white,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginTop: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: theme.colors.slate[400],
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  playlistsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  playlistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 4,
  },
  playlistDescription: {
    fontSize: 12,
    color: theme.colors.slate[400],
    lineHeight: 16,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 1.5,
  },
  progressText: {
    fontSize: 10,
    color: theme.colors.blue[400],
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
