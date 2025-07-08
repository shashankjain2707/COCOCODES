/**
 * Simple Video Player Screen with Progress Tracking
 * A simpler implementation focused on video playback and progress tracking
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { SimpleYouTubePlayer } from '../../components/video/SimpleYouTubePlayer';
import { playlistService } from '../../services/playlists/playlistService';

interface SimpleVideoPlayerScreenProps {
  route: {
    params: {
      videoId?: string;
      video?: any;
      playlist?: any;
      playlistId?: string;
      autoplay?: boolean;
    };
  };
  navigation: any;
}

export const SimpleVideoPlayerScreen: React.FC<SimpleVideoPlayerScreenProps> = ({
  route,
  navigation,
}) => {
  const { videoId, video, playlist, playlistId, autoplay = true } = route.params || {};
  const [videoTitle, setVideoTitle] = useState(video?.title || 'Video');
  const [currentProgress, setCurrentProgress] = useState({ current: 0, total: 0 });

  const targetVideoId = videoId || video?.id;

  useEffect(() => {
    if (video?.title) {
      setVideoTitle(video.title);
    }
  }, [video]);

  const handleVideoEnd = () => {
    Alert.alert(
      'Video Complete',
      'You have finished watching this video!',
      [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleError = (error: string) => {
    Alert.alert(
      'Video Error',
      'There was an error playing this video. Please try again.',
      [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]
    );
  };

  const handleProgressUpdate = (current: number, total: number) => {
    setCurrentProgress({ current, total });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = currentProgress.total > 0 
    ? (currentProgress.current / currentProgress.total) * 100 
    : 0;

  if (!targetVideoId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.slate[950]} />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>No video to play</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.slate[950]} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle}</Text>
        <View style={styles.headerButton} />
      </View>

      {/* Video Player */}
      <SimpleYouTubePlayer
        videoId={targetVideoId}
        playlistId={playlistId}
        autoplay={autoplay}
        onVideoEnd={handleVideoEnd}
        onError={handleError}
        onProgressUpdate={handleProgressUpdate}
      />

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{videoTitle}</Text>
        
        {/* Progress Info */}
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {formatTime(currentProgress.current)} / {formatTime(currentProgress.total)}
          </Text>
          <Text style={styles.progressText}>
            {Math.round(progressPercentage)}% watched
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View 
            style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
          />
        </View>
      </View>

      {/* Additional Controls */}
      <View style={styles.additionalControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            if (playlistId && targetVideoId) {
              playlistService.markVideoAsCompleted(playlistId, targetVideoId);
              Alert.alert('Success', 'Video marked as complete!');
            }
          }}
        >
          <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.green[400]} />
          <Text style={styles.controlButtonText}>Mark as Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="playlist-music" size={20} color={theme.colors.blue[400]} />
          <Text style={styles.controlButtonText}>Back to Playlist</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.slate[950],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  videoInfo: {
    padding: 16,
    backgroundColor: theme.colors.slate[900],
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.slate[300],
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 2,
  },
  additionalControls: {
    padding: 16,
    backgroundColor: theme.colors.slate[900],
    gap: 12,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  controlButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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
});
