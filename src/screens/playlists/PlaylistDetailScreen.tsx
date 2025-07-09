import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { playlistService, PlaylistData, VideoData } from '../../services/playlists/playlistService';

const { width } = Dimensions.get('window');

interface PlaylistDetailRouteParams {
  playlistId: string;
  title: string;
}

export const PlaylistDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as PlaylistDetailRouteParams;
  
  // Enhanced safety check for invalid parameters
  if (!params || !params.playlistId || typeof params.playlistId !== 'string' || params.playlistId.trim() === '' || params.playlistId === 'playlists') {
    console.error('Invalid route parameters detected:', params);
    console.error('playlistId value:', params?.playlistId);
    console.error('playlistId type:', typeof params?.playlistId);
    
    React.useEffect(() => {
      Alert.alert(
        'Invalid Playlist',
        'This playlist cannot be loaded. Returning to library.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, [navigation]);
    
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>Invalid playlist parameters</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  const { playlistId, title } = params;

  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getPlaylistProgressStats = () => {
    if (!playlist) return null;
    return playlistService.getPlaylistProgress(playlist);
  };

  const loadPlaylist = async () => {
    try {
      console.log('Loading playlist with ID:', playlistId);
      console.log('Playlist ID type:', typeof playlistId);
      console.log('Playlist ID value:', JSON.stringify(playlistId));
      
      // Additional validation before Firebase call
      if (!playlistId || typeof playlistId !== 'string' || playlistId.trim() === '') {
        throw new Error(`Invalid playlist ID: ${playlistId}`);
      }
      
      if (playlistId === 'playlists' || playlistId.includes('/')) {
        throw new Error(`Invalid playlist ID format: ${playlistId}`);
      }
      
      const playlistData = await playlistService.getPlaylistById(playlistId);
      
      if (!playlistData) {
        throw new Error('Playlist not found');
      }
      
      setPlaylist(playlistData);
    } catch (error) {
      console.error('Error loading playlist:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('Error details:', {
        message: errorMessage,
        playlistId: playlistId,
        playlistIdType: typeof playlistId,
        stack: errorStack
      });
      
      // Show user-friendly error and go back
      Alert.alert(
        'Error Loading Playlist', 
        'This playlist could not be loaded. Please try again later.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPlaylist();
    setRefreshing(false);
  };

  const handleDeletePlaylist = () => {
    Alert.alert(
      'Delete Playlist',
      'Are you sure you want to delete this playlist? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await playlistService.deletePlaylist(playlistId);
              Alert.alert('Success', 'Playlist deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting playlist:', error);
              Alert.alert('Error', 'Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  const handleRemoveVideo = (videoId: string) => {
    Alert.alert(
      'Remove Video',
      'Are you sure you want to remove this video from the playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await playlistService.removeVideoFromPlaylist(playlistId, videoId);
              await loadPlaylist(); // Refresh the playlist
            } catch (error) {
              console.error('Error removing video:', error);
              Alert.alert('Error', 'Failed to remove video');
            }
          },
        },
      ]
    );
  };

  const handlePlayVideo = (video: VideoData) => {
    // Navigate to video player
    navigation.navigate('VideoPlayer' as any, {
      videoId: video.id,
      video: {
        id: video.id,
        title: video.title,
        url: video.url,
        description: video.description,
        thumbnail: video.thumbnail,
        duration: video.duration,
      },
      playlist: playlist,
      playlistId: playlistId,
      autoplay: true,
    });
  };

  const handleMarkAsComplete = async (videoId: string) => {
    try {
      await playlistService.markVideoAsCompleted(playlistId, videoId);
      await loadPlaylist(); // Refresh the playlist
    } catch (error) {
      console.error('Error marking video as complete:', error);
      Alert.alert('Error', 'Failed to mark video as complete');
    }
  };

  const getVideoThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  useEffect(() => {
    loadPlaylist();
  }, [playlistId]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={48} color={theme.colors.blue[400]} />
            <Text style={styles.loadingText}>Loading playlist...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!playlist) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.slate[950], theme.colors.blue[950], theme.colors.navy[900]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="playlist-remove" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>Playlist not found</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {playlist.name}
          </Text>
          <TouchableOpacity onPress={handleDeletePlaylist} style={styles.headerButton}>
            <MaterialCommunityIcons name="delete" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Playlist Info */}
          <View style={styles.playlistInfo}>
            <View style={styles.playlistHeader}>
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
                  <Text style={styles.playlistDescription}>{playlist.description}</Text>
                )}
              </View>
            </View>
            
            {/* Progress Stats */}
            {(() => {
              const progress = getPlaylistProgressStats();
              return progress && progress.totalVideos > 0 ? (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Progress</Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round(progress.completionPercentage)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${progress.completionPercentage}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.progressStats}>
                    <Text style={styles.progressText}>
                      {progress.completedVideos} of {progress.totalVideos} completed
                    </Text>
                    {progress.totalDurationSeconds > 0 && (
                      <Text style={styles.progressText}>
                        {Math.round(progress.totalWatchedSeconds / 60)}m / {Math.round(progress.totalDurationSeconds / 60)}m watched
                      </Text>
                    )}
                  </View>
                </View>
              ) : null;
            })()}
            
            {playlist.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {playlist.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Videos */}
          <View style={styles.videosSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            {playlist.videos.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="playlist-remove" size={48} color={theme.colors.slate[400]} />
                <Text style={styles.emptyStateText}>No videos in this playlist</Text>
                <Text style={styles.emptyStateSubtext}>Add some videos to get started</Text>
              </View>
            ) : (
              playlist.videos.map((video, index) => (
                <View key={video.id} style={styles.videoItem}>
                  <View style={styles.videoInfo}>
                    <View style={styles.videoThumbnail}>
                      <MaterialCommunityIcons 
                        name={video.progress?.completed ? "check-circle" : "play"} 
                        size={20} 
                        color={video.progress?.completed ? theme.colors.green[400] : theme.colors.white} 
                      />
                    </View>
                    <View style={styles.videoDetails}>
                      <Text style={styles.videoTitle} numberOfLines={2}>
                        {video.title}
                      </Text>
                      <View style={styles.videoMetaContainer}>
                        <Text style={styles.videoMeta}>
                          Video {index + 1} of {playlist.videos.length}
                        </Text>
                        {video.progress && (
                          <Text style={styles.videoProgress}>
                            {Math.round(playlistService.getVideoProgressPercentage(video))}% watched
                          </Text>
                        )}
                      </View>
                      {video.progress && video.progress.totalSeconds > 0 && (
                        <View style={styles.videoProgressBar}>
                          <View 
                            style={[
                              styles.videoProgressFill, 
                              { width: `${playlistService.getVideoProgressPercentage(video)}%` }
                            ]} 
                          />
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.videoActions}>
                    <TouchableOpacity 
                      onPress={() => handlePlayVideo(video)}
                      style={styles.playButton}
                    >
                      <MaterialCommunityIcons name="play" size={20} color={theme.colors.blue[400]} />
                    </TouchableOpacity>
                    {!video.progress?.completed && (
                      <TouchableOpacity 
                        onPress={() => handleMarkAsComplete(video.id)}
                        style={styles.completeButton}
                      >
                        <MaterialCommunityIcons name="check" size={20} color={theme.colors.green[400]} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      onPress={() => handleRemoveVideo(video.id)}
                      style={styles.removeButton}
                    >
                      <MaterialCommunityIcons name="close" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsSection}>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="share" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Share Playlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MaterialCommunityIcons name="plus" size={20} color={theme.colors.white} />
              <Text style={styles.actionButtonText}>Add More Videos</Text>
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
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playlistInfo: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  playlistDetails: {
    marginLeft: 12,
    flex: 1,
  },
  playlistName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    color: theme.colors.slate[300],
    marginBottom: 8,
  },
  playlistDescription: {
    fontSize: 14,
    color: theme.colors.slate[400],
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.white,
  },
  videosSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.white,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.white,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.slate[400],
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  videoThumbnail: {
    width: 48,
    height: 36,
    backgroundColor: theme.colors.slate[700],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoDetails: {
    marginLeft: 12,
    flex: 1,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.white,
    marginBottom: 4,
  },
  videoMeta: {
    fontSize: 12,
    color: theme.colors.slate[400],
  },
  videoMetaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  videoProgress: {
    fontSize: 10,
    color: theme.colors.blue[400],
    fontWeight: '500',
  },
  videoProgressBar: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 1,
    marginTop: 4,
  },
  videoProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 1,
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    padding: 8,
  },
  completeButton: {
    padding: 8,
  },
  removeButton: {
    padding: 8,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.white,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.blue[600],
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.blue[400],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 2,
  },
  progressStats: {
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.slate[300],
  },
});
