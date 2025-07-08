/**
 * Simple YouTube Player with Progress Tracking
 * A simpler implementation using react-native-youtube-iframe
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { playlistService } from '../../services/playlists/playlistService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SimpleYouTubePlayerProps {
  videoId: string;
  playlistId?: string;
  autoplay?: boolean;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
  onProgressUpdate?: (current: number, total: number) => void;
}

export const SimpleYouTubePlayer: React.FC<SimpleYouTubePlayerProps> = ({
  videoId,
  playlistId,
  autoplay = false,
  onVideoEnd,
  onError,
  onProgressUpdate,
}) => {
  const [playing, setPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef<any>(null);

  const onStateChange = useCallback((state: string) => {
    if (state === 'ended') {
      if (playlistId && videoId) {
        playlistService.markVideoAsCompleted(playlistId, videoId);
      }
      if (onVideoEnd) onVideoEnd();
    }
  }, [playlistId, videoId, onVideoEnd]);

  const onProgress = useCallback((data: { currentTime: number; duration: number }) => {
    setCurrentTime(data.currentTime);
    setDuration(data.duration);
    
    if (onProgressUpdate) {
      onProgressUpdate(data.currentTime, data.duration);
    }

    // Update playlist progress every 10 seconds
    if (playlistId && videoId && data.currentTime > 0 && data.duration > 0) {
      const timeDiff = data.currentTime - currentTime;
      if (timeDiff >= 10 || timeDiff < 0) { // Update every 10 seconds or if time jumped
        playlistService.updateVideoProgress(playlistId, videoId, data.currentTime, data.duration);
      }
    }
  }, [playlistId, videoId, currentTime, onProgressUpdate]);

  const togglePlay = () => {
    setPlaying(!playing);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <View style={styles.playerContainer}>
        <YoutubePlayer
          ref={playerRef}
          height={isFullscreen ? screenHeight : 220}
          width={screenWidth}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onProgress={onProgress}
          onError={(error) => {
            console.error('YouTube Player Error:', error);
            if (onError) onError(error);
          }}
          webViewStyle={styles.webView}
          initialPlayerParams={{
            controls: false,
            modestbranding: true,
            showClosedCaptions: true,
            rel: false,
          }}
        />
      </View>

      {/* Custom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlay} style={styles.controlButton}>
          <MaterialCommunityIcons
            name={playing ? 'pause' : 'play'}
            size={24}
            color={theme.colors.white}
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <TouchableOpacity onPress={toggleFullscreen} style={styles.controlButton}>
          <MaterialCommunityIcons
            name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
            size={24}
            color={theme.colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.slate[950],
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  playerContainer: {
    backgroundColor: theme.colors.slate[950],
  },
  webView: {
    backgroundColor: theme.colors.slate[950],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  controlButton: {
    padding: 8,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  timeText: {
    color: theme.colors.white,
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.blue[400],
    borderRadius: 2,
  },
});
