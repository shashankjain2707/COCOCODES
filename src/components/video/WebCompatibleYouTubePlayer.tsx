/**
 * Web-Compatible YouTube Player
 * Uses iframe for web and react-native-youtube-iframe for mobile
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { playlistService } from '../../services/playlists/playlistService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WebCompatibleYouTubePlayerProps {
  videoId: string;
  playlistId?: string;
  autoplay?: boolean;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
  onProgressUpdate?: (current: number, total: number) => void;
}

export const WebCompatibleYouTubePlayer: React.FC<WebCompatibleYouTubePlayerProps> = ({
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
  const [isLoading, setIsLoading] = useState(true);
  const playerRef = useRef<any>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${autoplay ? 1 : 0}&controls=0&modestbranding=1&rel=0&showinfo=0`;

  const handlePlayPause = () => {
    setPlaying(!playing);
    // In a real implementation, you'd send messages to the iframe
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Simulate progress for demo purposes
  useEffect(() => {
    if (playing && !isLoading) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (duration > 0 && newTime >= duration) {
            setPlaying(false);
            if (onVideoEnd) onVideoEnd();
            if (playlistId) {
              playlistService.markVideoAsCompleted(playlistId, videoId);
            }
            return duration;
          }
          
          // Update progress every 10 seconds
          if (newTime % 10 === 0 && playlistId) {
            playlistService.updateVideoProgress(playlistId, videoId, newTime, duration);
          }
          
          if (onProgressUpdate) {
            onProgressUpdate(newTime, duration);
          }
          
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [playing, isLoading, duration, videoId, playlistId, onVideoEnd, onProgressUpdate]);

  // Simulate loading and duration setting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setDuration(300); // 5 minutes as example
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
        <View style={styles.playerContainer}>
          <iframe
            ref={playerRef}
            src={embedUrl}
            width={screenWidth}
            height={isFullscreen ? screenHeight : 220}
            style={{
              border: 'none',
              backgroundColor: theme.colors.slate[950],
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
          />
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <MaterialCommunityIcons name="loading" size={48} color={theme.colors.blue[400]} />
              <Text style={styles.loadingText}>Loading video...</Text>
            </View>
          )}
        </View>

        {/* Custom Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
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

          <TouchableOpacity onPress={handleFullscreen} style={styles.controlButton}>
            <MaterialCommunityIcons
              name={isFullscreen ? 'fullscreen-exit' : 'fullscreen'}
              size={24}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // For mobile, use WebView
  return (
    <View style={[styles.container, isFullscreen && styles.fullscreenContainer]}>
      <View style={styles.playerContainer}>
        <WebView
          ref={playerRef}
          source={{ uri: embedUrl }}
          style={{ height: isFullscreen ? screenHeight : 220 }}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onError={(error) => {
            console.error('WebView error:', error);
            if (onError) onError(error.nativeEvent.description);
          }}
        />
        
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <MaterialCommunityIcons name="loading" size={48} color={theme.colors.blue[400]} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
      </View>

      {/* Custom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause} style={styles.controlButton}>
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

        <TouchableOpacity onPress={handleFullscreen} style={styles.controlButton}>
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
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.white,
    fontSize: 16,
    marginTop: 12,
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
