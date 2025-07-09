/**
 * Enhanced Video Player Screen
 * Custom video player with notes, playlist, and video description
 * 
 * YouTube API Integration:
 * - Uses YouTube Data API v3 for rich video metadata when API key is available
 * - Automatically falls back to web scraping when API is unavailable
 * - Provides consistent interface regardless of the data source
 * - Supports both individual video metadata and bulk operations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { playlistService, VideoData, PlaylistData } from '../../services/playlists/playlistService';
import { youtubeService } from '../../services/youtube/youtubeService';
import { extractVideoId } from '../../utils/youtubeHelpers';
import WebCompatibleYouTubePlayer from '../../components/video/WebCompatibleYouTubePlayer';
import { auth } from '../../services/firebase/config';

const { width, height } = Dimensions.get('window');

interface VideoPlayerRouteParams {
  videoId?: string;
  video?: VideoData;
  playlist?: PlaylistData;
  playlistId?: string;
  autoplay?: boolean;
  title?: string;
}

interface VideoNote {
  id: string;
  videoId: string;
  timestamp: number;
  content: string;
  createdAt: Date;
  userId: string;
}

interface VideoProgress {
  currentTime: number;
  duration: number;
  watchedSeconds: number;
  percentage: number;
}

interface VideoPlayerScreenProps {
  route: {
    params: VideoPlayerRouteParams;
  };
  navigation: any;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({ route, navigation }) => {
  const params = route.params;
  
  // State declarations - ALL hooks must be called before any early returns
  const [video, setVideo] = useState<VideoData | null>(params?.video || null);
  const [playlist, setPlaylist] = useState<PlaylistData | null>(params?.playlist || null);
  const [notes, setNotes] = useState<VideoNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isPlaying, setIsPlaying] = useState(params?.autoplay || false);
  const [progress, setProgress] = useState<VideoProgress>({
    currentTime: 0,
    duration: 0,
    watchedSeconds: 0,
    percentage: 0,
  });
  const [showDescription, setShowDescription] = useState(true);
  const [videoDescription, setVideoDescription] = useState('Loading video description...');
  const [isLoading, setIsLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const [hasError, setHasError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState('auto');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentUser = auth.currentUser;
  const currentVideoId = video?.id || params?.videoId || '';

  // All callback functions must be defined before early returns
  const handleVideoProgress = useCallback((currentTime: number, duration: number) => {
    const watchedSeconds = currentTime;
    const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    setProgress({
      currentTime: currentTime * 1000, // Convert to milliseconds for consistency
      duration: duration * 1000,
      watchedSeconds,
      percentage,
    });
  }, []);

  // Check for invalid parameters and set error state
  useEffect(() => {
    if (!params || (!params.video && !params.videoId)) {
      setHasError(true);
      Alert.alert(
        'Invalid Video',
        'No video information provided. Returning to previous screen.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [params, navigation]);

  useEffect(() => {
    if (!hasError) {
      initializePlayer();
    }
  }, [hasError]);

  // Show error screen if parameters are invalid
  if (hasError) {
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
            <MaterialCommunityIcons name="video-off" size={48} color={theme.colors.error} />
            <Text style={styles.errorText}>Invalid video parameters</Text>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Show loading screen while initializing
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
            <ActivityIndicator size="large" color={theme.colors.blue[400]} />
            <Text style={styles.loadingText}>Loading video player...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const initializePlayer = async () => {
    try {
      setIsLoading(true);
      console.log('Initializing video player with params:', params);
      
      // Validate current user
      if (!currentUser) {
        console.error('No authenticated user found');
        Alert.alert('Error', 'You must be logged in to use the video player');
        navigation.goBack();
        return;
      }
      
      console.log('Current user:', currentUser.uid);
      
      // Load playlist first if playlistId is provided
      if (!playlist && params?.playlistId) {
        console.log('Loading playlist by ID:', params.playlistId);
        await loadPlaylistById(params.playlistId);
      }
      
      // Load video if not provided
      if (!video && params?.videoId) {
        console.log('Loading video by ID:', params.videoId);
        await loadVideoById(params.videoId);
      }
      
      // Final validation
      if (!video) {
        console.error('No video data available after loading');
        throw new Error('No video data available');
      }
      
      console.log('Video loaded successfully:', video.title);
      
      await loadVideoData();
      await loadVideoNotes();
      findCurrentVideoIndex();
      
      // Initialize the video player - no need to load async for YouTube player
      // The WebCompatibleYouTubePlayer handles video loading internally
      
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
      console.log('Video player initialized successfully');
    } catch (error) {
      console.error('Error initializing player:', error);
      Alert.alert(
        'Error',
        'Failed to initialize video player. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideoById = async (videoId: string) => {
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    try {
      // Validate parameters
      if (!videoId.trim()) {
        throw new Error('Invalid video ID provided');
      }

      // Extract video ID if a full URL was provided
      const extractedVideoId = extractVideoId(videoId) || videoId;
      console.log('Loading video with ID:', extractedVideoId);

      // First check if we have a playlist and can find the video there
      if (playlist) {
        const playlistVideo = playlist.videos.find(v => v.id === extractedVideoId);
        if (playlistVideo) {
          console.log('Found video in playlist:', playlistVideo.title);
          setVideo(playlistVideo);
          setVideoDescription(playlistVideo.description || 'No description available.');
          return;
        }
      }

      // If we have a title from params, use it while loading
      const initialTitle = params?.title || 'Loading...';
      console.log('Creating initial video data with title:', initialTitle);
      
      // Create a basic video object for immediate display
      const videoData: VideoData = {
        id: extractedVideoId,
        title: initialTitle,
        url: `https://www.youtube.com/watch?v=${extractedVideoId}`,
        description: '',
        thumbnail: '',
        duration: '',
        addedAt: new Date(),
      };
      
      setVideo(videoData);
      console.log('Initial video data set:', videoData);
      
      // Fetch video metadata from YouTube API
      try {
        console.log('Fetching metadata from YouTube API...');
        const metadataResult = await youtubeService.getVideoMetadata(extractedVideoId);
        console.log('Metadata result:', metadataResult);
        
        if (metadataResult.success && metadataResult.data) {
          const metadata = metadataResult.data;
          console.log('Got metadata:', metadata);
          
          // Update video data with real metadata
          const updatedVideoData: VideoData = {
            id: extractedVideoId,
            title: metadata.title,
            url: `https://www.youtube.com/watch?v=${extractedVideoId}`,
            description: metadata.description || '',
            thumbnail: metadata.thumbnailUrl,
            duration: metadata.duration,
            addedAt: new Date(),
          };
          
          setVideo(updatedVideoData);
          console.log('Updated video data set:', updatedVideoData);
          
          // Also update the video description state
          setVideoDescription(metadata.description || 'No description available.');
        } else {
          console.warn('Failed to fetch video metadata:', metadataResult.error);
          // Keep the basic video data, but set a fallback description
          setVideoDescription('Video metadata could not be loaded. This may be due to API limits or the video being private.');
        }
      } catch (apiError) {
        console.error('Error fetching video metadata from YouTube API:', apiError);
        // Keep the basic video data, but set a fallback description
        setVideoDescription('Video metadata could not be loaded. Playing with basic information.');
      }
      
    } catch (error) {
      console.error('Error loading video by ID:', error);
      throw error;
    }
  };

  const loadPlaylistById = async (playlistId: string) => {
    if (!playlistId) {
      throw new Error('Playlist ID is required');
    }

    try {
      // Validate parameters
      if (!playlistId.trim()) {
        throw new Error('Invalid playlist ID provided');
      }

      // Validate current user
      if (!currentUser) {
        throw new Error('User must be authenticated to load playlists');
      }

      const playlistData = await playlistService.getPlaylistById(playlistId);
      if (playlistData) {
        setPlaylist(playlistData);
        
        // If no video is set but we have a videoId, try to find it in the playlist
        if (!video && params?.videoId) {
          const playlistVideo = playlistData.videos.find(v => v.id === params.videoId);
          if (playlistVideo) {
            setVideo(playlistVideo);
          }
        }
      } else {
        throw new Error('Playlist not found');
      }
    } catch (error) {
      console.error('Error loading playlist:', error);
      // Don't throw - playlist is optional, just log the error
      Alert.alert('Warning', 'Failed to load playlist information');
    }
  };

  const loadVideoData = async () => {
    try {
      // Video description is now loaded in loadVideoById function
      // This function can be used for additional video data processing if needed
      console.log('Video data loaded successfully');
    } catch (error) {
      console.error('Error loading video data:', error);
    }
  };

  const loadVideoNotes = async () => {
    try {
      // Load notes for this video (implement in your notes service)
      // For now, using placeholder notes
      const currentUserId = currentUser?.uid || '';
      const videoId = video?.id || params?.videoId || '';
      
      setNotes([
        {
          id: '1',
          videoId: videoId,
          timestamp: 120,
          content: 'Important concept explained here',
          createdAt: new Date(),
          userId: currentUserId,
        },
        {
          id: '2',
          videoId: videoId,
          timestamp: 300,
          content: 'Need to review this section',
          createdAt: new Date(),
          userId: currentUserId,
        },
      ]);
    } catch (error) {
      console.error('Error loading video notes:', error);
    }
  };

  const findCurrentVideoIndex = () => {
    if (playlist && video) {
      const index = playlist.videos.findIndex(v => v.id === video.id);
      setCurrentVideoIndex(index);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (timestamp: number) => {
    // Seeking will be handled by the WebCompatibleYouTubePlayer internally
    // For now, we'll just log the seek request
    console.log('Seek requested to:', timestamp);
  };

  const addNote = async () => {
    if (!newNote.trim() || !video || !currentUser) return;

    const note: VideoNote = {
      id: Date.now().toString(),
      videoId: video.id,
      timestamp: progress.watchedSeconds,
      content: newNote.trim(),
      createdAt: new Date(),
      userId: currentUser.uid,
    };

    try {
      // Save note to your notes service
      setNotes(prev => [...prev, note]);
      setNewNote('');
      Alert.alert('Success', 'Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      Alert.alert('Error', 'Failed to add note');
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      Alert.alert('Success', 'Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  const playVideoFromPlaylist = async (selectedVideo: VideoData) => {
    try {
      setIsLoading(true);
      
      // Stop the current video
      setIsPlaying(false);
      
      // Update video state
      setVideo(selectedVideo);
      
      // Update current video index
      const index = playlist?.videos.findIndex(v => v.id === selectedVideo.id) || 0;
      setCurrentVideoIndex(index);
      
      // Load notes for new video
      await loadVideoNotes();
      
      // Fetch fresh metadata from YouTube API if description is missing
      if (!selectedVideo.description) {
        try {
          const metadataResult = await youtubeService.getVideoMetadata(selectedVideo.id);
          
          if (metadataResult.success && metadataResult.data) {
            const metadata = metadataResult.data;
            
            // Update video data with real metadata
            const updatedVideoData: VideoData = {
              ...selectedVideo,
              title: metadata.title,
              description: metadata.description || '',
              thumbnail: metadata.thumbnailUrl,
              duration: metadata.duration,
            };
            
            setVideo(updatedVideoData);
            setVideoDescription(metadata.description || 'No description available.');
          } else {
            setVideoDescription('Video metadata could not be loaded.');
          }
        } catch (apiError) {
          console.error('Error fetching video metadata:', apiError);
          setVideoDescription('Video metadata could not be loaded.');
        }
      } else {
        setVideoDescription(selectedVideo.description);
      }
      
      // Reset progress
      setProgress({
        currentTime: 0,
        duration: 0,
        watchedSeconds: 0,
        percentage: 0,
      });
      
    } catch (error) {
      console.error('Error playing video:', error);
      Alert.alert('Error', 'Failed to play video');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (progress.duration === 0) return 0;
    return (progress.currentTime / progress.duration) * 100;
  };

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
            {video?.title || params?.title || 'Video Player'}
          </Text>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Row 1: Video Progress */}
            <View style={styles.progressRow}>
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <MaterialCommunityIcons name="clock" size={20} color={theme.colors.blue[400]} />
                  <Text style={styles.progressLabel}>Video Progress</Text>
                  <View style={styles.progressMeta}>
                    <Text style={styles.progressMetaText}>
                      {playbackSpeed}x • {videoQuality}
                    </Text>
                    <Text style={styles.progressTime}>
                      {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
                </View>
                <Text style={styles.progressPercentage}>
                  {Math.round(getProgressPercentage())}% completed
                </Text>
              </View>
            </View>

            {/* Row 2: Video Player and Notes */}
            <View style={styles.mainRow}>
              {/* Video Player - Full Width on Mobile, Column on Desktop */}
              <View style={styles.videoColumn}>
                <View style={styles.videoPlayerContainer}>
                  <WebCompatibleYouTubePlayer
                    key={video?.id || 'video-player'}
                    videoId={extractVideoId(video?.url || '') || video?.id || ''}
                  />
                  {/* Minimal Play/Pause Overlay */}
                  {isLoading && (
                    <View style={styles.loadingOverlay}>
                      <ActivityIndicator size="large" color={theme.colors.blue[400]} />
                      <Text style={styles.loadingText}>Loading video...</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Notes Section */}
              <View style={styles.notesColumn}>
                <View style={styles.notesContainer}>
                  <View style={styles.notesHeader}>
                    <MaterialCommunityIcons name="note" size={20} color={theme.colors.blue[400]} />
                    <Text style={styles.notesTitle}>Video Notes</Text>
                  </View>
                  
                  {/* Add Note */}
                  <View style={styles.addNoteContainer}>
                    <TextInput
                      style={styles.noteInput}
                      placeholder="Add a note at current time..."
                      placeholderTextColor={theme.colors.slate[400]}
                      value={newNote}
                      onChangeText={setNewNote}
                      multiline
                    />
                    <TouchableOpacity onPress={addNote} style={styles.addNoteButton}>
                      <MaterialCommunityIcons name="plus" size={16} color={theme.colors.white} />
                    </TouchableOpacity>
                  </View>

                  {/* Notes List */}
                  <ScrollView style={styles.notesList} showsVerticalScrollIndicator={false}>
                    {notes.map((note) => (
                      <View key={note.id} style={styles.noteItem}>
                        <View style={styles.noteHeader}>
                          <TouchableOpacity 
                            onPress={() => handleSeek(note.timestamp)}
                            style={styles.noteTimestamp}
                          >
                            <MaterialCommunityIcons name="clock" size={12} color={theme.colors.blue[400]} />
                            <Text style={styles.noteTimestampText}>
                              {formatTimestamp(note.timestamp)}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => deleteNote(note.id)}>
                            <MaterialCommunityIcons name="delete" size={16} color={theme.colors.error} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.noteContent}>{note.content}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Row 3: Description and Playlist */}
            <View style={styles.bottomRow}>
              {/* Column 1: Video Description */}
              <View style={styles.descriptionColumn}>
                <TouchableOpacity 
                  onPress={() => setShowDescription(!showDescription)}
                  style={styles.descriptionHeader}
                >
                  <MaterialCommunityIcons name="text" size={20} color={theme.colors.blue[400]} />
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <MaterialCommunityIcons 
                    name={showDescription ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={theme.colors.slate[400]} 
                  />
                </TouchableOpacity>
                
                {showDescription && (
                  <View style={styles.descriptionContent}>
                    <ScrollView style={styles.descriptionScroll} showsVerticalScrollIndicator={false}>
                      <Text style={styles.descriptionText}>{videoDescription}</Text>
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Column 2: Playlist */}
              {playlist && (
                <View style={styles.playlistColumn}>
                  <View style={styles.playlistHeader}>
                    <MaterialCommunityIcons name="playlist-play" size={20} color={theme.colors.blue[400]} />
                    <Text style={styles.playlistTitle}>{playlist.name}</Text>
                    <Text style={styles.playlistCount}>
                      {currentVideoIndex + 1} / {playlist.videos.length}
                    </Text>
                  </View>
                  
                  <ScrollView style={styles.playlistList} showsVerticalScrollIndicator={false}>
                    {playlist.videos.map((playlistVideo, index) => (
                      <TouchableOpacity
                        key={playlistVideo.id}
                        onPress={() => playVideoFromPlaylist(playlistVideo)}
                        style={[
                          styles.playlistItem,
                          index === currentVideoIndex && styles.currentPlaylistItem
                        ]}
                      >
                        <View style={styles.playlistItemNumber}>
                          <Text style={[
                            styles.playlistItemNumberText,
                            index === currentVideoIndex && styles.currentPlaylistItemText
                          ]}>
                            {index + 1}
                          </Text>
                        </View>
                        <View style={styles.playlistItemInfo}>
                          <Text style={[
                            styles.playlistItemTitle,
                            index === currentVideoIndex && styles.currentPlaylistItemText
                          ]} numberOfLines={2}>
                            {playlistVideo.title}
                          </Text>
                          <Text style={styles.playlistItemMeta}>
                            {playlistVideo.duration || 'Unknown duration'}
                          </Text>
                        </View>
                        {index === currentVideoIndex && (
                          <MaterialCommunityIcons name="play" size={16} color={theme.colors.blue[400]} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
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
    padding: 16,
  },

  // Row 1: Progress
  progressRow: {
    marginBottom: 16,
  },
  progressContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
  },
  progressTime: {
    fontSize: 14,
    color: theme.colors.slate[300],
  },
  progressMeta: {
    alignItems: 'flex-end',
  },
  progressMetaText: {
    fontSize: 12,
    color: theme.colors.blue[400],
    marginBottom: 2,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 3,
  },
  progressPercentage: {
    fontSize: 12,
    color: theme.colors.blue[400],
    textAlign: 'center',
    fontWeight: '600',
  },

  // Row 2: Video and Notes
  mainRow: {
    flexDirection: 'row',
    marginBottom: 16,
    minHeight: 360, // Increased from 220
  },
  videoColumn: {
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.8)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesColumn: {
    flex: 1,
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    height: 320, // Increased from 200 to match video player
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
  },
  addNoteContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  noteInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    color: theme.colors.white,
    fontSize: 14,
    maxHeight: 60,
  },
  addNoteButton: {
    backgroundColor: theme.colors.blue[600],
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notesList: {
    flex: 1,
  },
  noteItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTimestamp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteTimestampText: {
    fontSize: 10,
    color: theme.colors.blue[400],
    marginLeft: 4,
  },
  noteContent: {
    fontSize: 12,
    color: theme.colors.slate[300],
    lineHeight: 16,
  },

  // Row 3: Description and Playlist
  bottomRow: {
    flexDirection: 'row',
    minHeight: 200,
  },
  descriptionColumn: {
    flex: 1,
    marginRight: 8,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
    flex: 1,
  },
  descriptionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginTop: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    flex: 1,
  },
  descriptionScroll: {
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.slate[300],
    lineHeight: 20,
  },
  playlistColumn: {
    flex: 1,
    marginLeft: 8,
  },
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    marginBottom: 8,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    marginLeft: 8,
    flex: 1,
  },
  playlistCount: {
    fontSize: 12,
    color: theme.colors.slate[400],
    fontWeight: '600',
  },
  playlistList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    flex: 1,
  },
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  currentPlaylistItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  playlistItemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playlistItemNumberText: {
    fontSize: 10,
    color: theme.colors.slate[400],
    fontWeight: '600',
  },
  currentPlaylistItemText: {
    color: theme.colors.blue[400],
  },
  playlistItemInfo: {
    flex: 1,
  },
  playlistItemTitle: {
    fontSize: 12,
    color: theme.colors.white,
    marginBottom: 2,
  },
  playlistItemMeta: {
    fontSize: 10,
    color: theme.colors.slate[400],
  },
  
  // Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.colors.blue[600],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.white,
    textAlign: 'center',
    marginTop: 16,
  },
});
