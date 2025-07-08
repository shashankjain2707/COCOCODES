/**
 * Enhanced Video Player Screen
 * Integrates distraction-free YouTube player with AI-generated quizzes
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../../components/common/GlassCard';
import { DistractionFreePlayer } from '../../components/video/DistractionFreePlayer';
import {
  generateQuizzesForVideo,
  startQuizSession,
  endQuizSession,
  submitQuizAnswer,
  selectQuizState,
  selectQuizMetrics,
  selectQuizProgress,
} from '../../store/quizSlice';
import {
  selectCurrentVideo,
  selectPlayerState,
  setCurrentVideo,
} from '../../store/videoSlice';
import { RootState } from '../../store';
import { VideoMetadata } from '../../types/video';
import { playlistService } from '../../services/playlists/playlistService';

interface VideoPlayerScreenProps {
  route: {
    params: {
      videoId?: string;
      video?: VideoMetadata;
      playlist?: any;
      playlistId?: string;
      autoplay?: boolean;
    };
  };
  navigation: any;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { videoId, video, playlist, playlistId, autoplay = true } = route.params || {};
  
  // Redux state
  const currentVideo = useSelector(selectCurrentVideo);
  const playerState = useSelector(selectPlayerState);
  const quizState = useSelector(selectQuizState);
  const quizMetrics = useSelector(selectQuizMetrics);
  // Local state
  const [showVideoInfo, setShowVideoInfo] = useState(false);
  const [showQuizMetrics, setShowQuizMetrics] = useState(false);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

  const targetVideoId = videoId || video?.id;
  const targetVideo = video || currentVideo;

  /**
   * Update playlist progress
   */
  const updatePlaylistProgress = useCallback(async (watchedSeconds: number, totalSeconds: number) => {
    if (!playlistId || !targetVideoId) return;
    
    try {
      await playlistService.updateVideoProgress(playlistId, targetVideoId, watchedSeconds, totalSeconds);
    } catch (error) {
      console.error('Error updating playlist progress:', error);
    }
  }, [playlistId, targetVideoId]);

  /**
   * Handle progress updates from video player
   */
  useEffect(() => {
    if (playerState.currentTime > 0 && playerState.duration > 0) {
      const currentTime = playerState.currentTime;
      const duration = playerState.duration;
      
      // Update progress every 10 seconds to avoid too many Firebase calls
      if (currentTime - lastProgressUpdate >= 10) {
        updatePlaylistProgress(currentTime, duration);
        setLastProgressUpdate(currentTime);
      }
    }
  }, [playerState.currentTime, playerState.duration, updatePlaylistProgress, lastProgressUpdate]);

  /**
   * Handle video end - mark as completed
   */
  const handleVideoEnd = useCallback(() => {
    if (playlistId && targetVideoId) {
      playlistService.markVideoAsCompleted(playlistId, targetVideoId);
    }
    if (onVideoEnd) onVideoEnd();
  }, [playlistId, targetVideoId, onVideoEnd]);
  const targetVideoId = videoId || video?.id;
  const targetVideo = video || currentVideo;

  /**
   * Initialize video and quiz session
   */
  useEffect(() => {
    if (targetVideoId && targetVideo) {
      // Set current video
      dispatch(setCurrentVideo(targetVideo));
      
      // Start quiz session if quizzes are enabled
      if (quizState.quizzesEnabled) {
        dispatch(startQuizSession(targetVideoId));
        dispatch(generateQuizzesForVideo(targetVideoId));
      }
    }

    // Cleanup on unmount
    return () => {
      if (quizState.currentVideoId) {
        dispatch(endQuizSession());
      }
    };
  }, [targetVideoId, targetVideo, dispatch, quizState.quizzesEnabled]);

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = useCallback((quizId: string, correct: boolean) => {
    // Calculate time spent (simplified for now)
    const timeSpent = 10; // This should be tracked properly
    
    dispatch(submitQuizAnswer({
      quizId,
      selectedAnswer: correct ? 0 : 1, // Simplified
      timeSpent,
    }));
  }, [dispatch]);

  /**
   * Handle video end
   */
  const handleVideoEnd = useCallback(() => {
    // End quiz session when video ends
    if (quizState.currentVideoId) {
      dispatch(endQuizSession());
    }

    // Navigate to next video if in playlist
    if (playlist && playlist.videos && playlist.videos.length > 1) {
      // Find current video index and go to next
      const currentIndex = playlist.videos.findIndex((v: any) => v.id === targetVideoId);
      const nextVideo = playlist.videos[currentIndex + 1];
      
      if (nextVideo) {
        navigation.replace('VideoPlayer', { 
          video: nextVideo, 
          playlist, 
          autoplay: true 
        });
      } else {
        navigation.goBack();
      }
    } else {
      navigation.goBack();
    }
  }, [quizState.currentVideoId, playlist, targetVideoId, navigation, dispatch]);

  /**
   * Handle video error
   */
  const handleVideoError = useCallback((error: string) => {
    Alert.alert(
      'Video Error',
      error,
      [
        { text: 'Try Again', onPress: () => navigation.replace('VideoPlayer', route.params) },
        { text: 'Go Back', onPress: () => navigation.goBack() },
      ]
    );
  }, [navigation, route.params]);

  /**
   * Toggle quiz metrics display
   */
  const toggleQuizMetrics = () => {
    setShowQuizMetrics(!showQuizMetrics);
  };

  /**
   * Toggle video info display
   */
  const toggleVideoInfo = () => {
    setShowVideoInfo(!showVideoInfo);
  };

  if (!targetVideoId || !targetVideo) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="video-off" 
            size={64} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>No video to play</Text>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      
      {/* Main Video Player */}
      <View style={styles.playerSection}>
        <DistractionFreePlayer
          video={targetVideo}
          autoplay={autoplay}
          enableQuizzes={quizState.quizzesEnabled}
          onVideoEnd={handleVideoEnd}
          onError={handleVideoError}
          onQuizComplete={handleQuizComplete}
        />
      </View>

      {/* Control Panel */}
      <View style={styles.controlPanel}>
        {/* Back Button */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.controlButton}
        >
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>

        {/* Video Info Button */}
        <TouchableOpacity 
          onPress={toggleVideoInfo}
          style={[styles.controlButton, showVideoInfo && styles.controlButtonActive]}
        >
          <MaterialCommunityIcons 
            name="information" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>

        {/* Quiz Metrics Button */}
        {quizState.quizzesEnabled && (
          <TouchableOpacity 
            onPress={toggleQuizMetrics}
            style={[styles.controlButton, showQuizMetrics && styles.controlButtonActive]}
          >
            <MaterialCommunityIcons 
              name="brain" 
              size={24} 
              color={theme.colors.text} 
            />
            {quizProgress.completed > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{quizProgress.completed}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Loading indicator for quiz generation */}
        {quizState.isGeneratingQuizzes && (
          <View style={styles.quizLoadingIndicator}>
            <MaterialCommunityIcons 
              name="loading" 
              size={20} 
              color={theme.colors.primary} 
            />
          </View>
        )}
      </View>

      {/* Video Information Panel */}
      {showVideoInfo && (
        <View style={styles.infoPanel}>
          <GlassCard style={styles.infoCard}>
            <ScrollView>
              <Text style={styles.videoTitle}>{targetVideo.title}</Text>
              <Text style={styles.videoAuthor}>by {targetVideo.author}</Text>
              <Text style={styles.videoDuration}>Duration: {targetVideo.duration}</Text>
              
              {targetVideo.description && (
                <>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.videoDescription}>
                    {targetVideo.description}
                  </Text>
                </>
              )}

              {targetVideo.tags && targetVideo.tags.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {targetVideo.tags.map((tag: string, index: number) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </GlassCard>
        </View>
      )}

      {/* Quiz Metrics Panel */}
      {showQuizMetrics && quizState.quizzesEnabled && (
        <View style={styles.metricsPanel}>
          <GlassCard style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Quiz Progress</Text>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{quizProgress.completed}</Text>
                <Text style={styles.metricLabel}>Completed</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{quizProgress.total}</Text>
                <Text style={styles.metricLabel}>Total</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>
                  {Math.round(quizMetrics.accuracy)}%
                </Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
              </View>
              
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{quizProgress.remaining}</Text>
                <Text style={styles.metricLabel}>Remaining</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${quizProgress.percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {Math.round(quizProgress.percentage)}% Complete
              </Text>
            </View>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  playerSection: {
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 25,
    padding: 12,
    position: 'relative',
  },
  controlButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quizLoadingIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.lg,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
  },
  infoPanel: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    maxHeight: '60%',
    zIndex: 90,
  },
  infoCard: {
    padding: 20,
    maxHeight: 400,
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 24,
  },
  videoAuthor: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.md,
    marginBottom: 8,
  },
  videoDuration: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  videoDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: theme.colors.primary + '30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xs,
  },
  metricsPanel: {
    position: 'absolute',
    top: 100,
    right: 20,
    width: 250,
    zIndex: 90,
  },
  metricsCard: {
    padding: 20,
  },
  metricsTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
  },
  metricLabel: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
    marginTop: 4,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },
});

export default VideoPlayerScreen;
