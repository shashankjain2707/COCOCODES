import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { WebView } from '../common/WebViewResolver';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';
import {
  setCurrentVideo,
  playVideo,
  pauseVideo,
  setCurrentTime,
  setDuration,
  toggleFullscreen,
  setPlayerLoading,
  setPlayerError,
  updateVideoProgress,
  selectPlayerState,
  selectCurrentVideo,
} from '../../store/videoSlice';
import { generateEmbedUrl } from '../../utils/youtubeHelpers';
import { VideoMetadata } from '../../types/video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface YouTubePlayerProps {
  videoId?: string;
  video?: VideoMetadata;
  autoplay?: boolean;
  showControls?: boolean;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  video,
  autoplay = false,
  showControls: showControlsProp = true,
  onVideoEnd,
  onError,
}) => {
  const dispatch = useDispatch();
  const playerState = useSelector(selectPlayerState);
  const currentVideo = useSelector(selectCurrentVideo);
  
  const webViewRef = useRef<any>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Determine which video to play
  const activeVideoId = videoId || video?.id || currentVideo?.id;
  const activeVideo = video || currentVideo;

  useEffect(() => {
    if (video && video.id !== currentVideo?.id) {
      dispatch(setCurrentVideo(video));
    }
  }, [video, currentVideo, dispatch]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (isControlsVisible && playerState.isPlaying) {
      const timeout = setTimeout(() => {
        setIsControlsVisible(false);
      }, 3000);
      setControlsTimeout(timeout);

      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [isControlsVisible, playerState.isPlaying]);

  const showControls = () => {
    setIsControlsVisible(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
      setControlsTimeout(null);
    }
  };

  const handlePlay = () => {
    dispatch(playVideo());
    // Send message to WebView to play
    webViewRef.current?.postMessage(JSON.stringify({ action: 'play' }));
  };

  const handlePause = () => {
    dispatch(pauseVideo());
    // Send message to WebView to pause
    webViewRef.current?.postMessage(JSON.stringify({ action: 'pause' }));
  };

  const handleFullscreen = () => {
    dispatch(toggleFullscreen());
  };

  const handleTimeUpdate = (currentTime: number) => {
    dispatch(setCurrentTime(currentTime));
    
    if (activeVideoId && playerState.duration > 0) {
      dispatch(updateVideoProgress({
        videoId: activeVideoId,
        currentTime,
        duration: playerState.duration,
      }));
    }
  };

  const generatePlayerHTML = (videoId: string) => {
    const embedUrl = generateEmbedUrl(videoId, {
      autoplay,
      controls: false, // We'll use custom controls
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 0;
              background: #000;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
          </style>
        </head>
        <body>
          <iframe
            src="${embedUrl}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
          
          <script>
            // Listen for messages from React Native
            window.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                
                // Handle player controls
                // Note: Direct iframe control is limited, so this is a basic implementation
                if (data.action === 'play') {
                  // In a real implementation, you'd need YouTube Player API
                  console.log('Play requested');
                }
                if (data.action === 'pause') {
                  console.log('Pause requested');
                }
              } catch (e) {
                console.error('Error parsing message:', e);
              }
            });
            
            // Send periodic updates to React Native
            setInterval(() => {
              // In a real implementation, get actual player state
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'timeupdate',
                currentTime: Math.random() * 100, // Mock current time
                duration: 100, // Mock duration
              }));
            }, 1000);
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'timeupdate':
          handleTimeUpdate(data.currentTime);
          if (data.duration && data.duration !== playerState.duration) {
            dispatch(setDuration(data.duration));
          }
          break;
        case 'ended':
          onVideoEnd?.();
          break;
        case 'error':
          const errorMessage = data.message || 'Video playback error';
          dispatch(setPlayerError(errorMessage));
          onError?.(errorMessage);
          break;
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  if (!activeVideoId) {
    return (
      <View style={styles.container}>
        <GlassCard style={styles.placeholderCard}>
          <MaterialCommunityIcons
            name="youtube"
            size={64}
            color={theme.colors.slate[400]}
          />
          <Text style={styles.placeholderText}>No video selected</Text>
        </GlassCard>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      playerState.isFullscreen && styles.fullscreenContainer
    ]}>
      {playerState.isFullscreen && (
        <StatusBar hidden />
      )}
      
      <TouchableOpacity
        style={styles.playerContainer}
        activeOpacity={1}
        onPress={showControls}
      >
        <WebView
          ref={webViewRef}
          source={{ html: generatePlayerHTML(activeVideoId) }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          onLoadStart={() => dispatch(setPlayerLoading(true))}
          onLoadEnd={() => dispatch(setPlayerLoading(false))}
          onError={(syntheticEvent: any) => {
            const { nativeEvent } = syntheticEvent;
            const errorMessage = `WebView error: ${nativeEvent.description}`;
            dispatch(setPlayerError(errorMessage));
            onError?.(errorMessage);
          }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
        />

        {/* Loading Indicator */}
        {playerState.isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        {/* Custom Controls Overlay */}
        {showControlsProp && isControlsVisible && (
          <View style={styles.controlsOverlay}>
            {/* Top Controls */}
            <View style={styles.topControls}>
              {activeVideo && (
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {activeVideo.title}
                  </Text>
                  <Text style={styles.videoAuthor} numberOfLines={1}>
                    {activeVideo.author}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={handleFullscreen}
              >
                <MaterialCommunityIcons
                  name={playerState.isFullscreen ? "fullscreen-exit" : "fullscreen"}
                  size={24}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            {/* Center Play/Pause Button */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                style={styles.playPauseButton}
                onPress={playerState.isPlaying ? handlePause : handlePlay}
              >
                <MaterialCommunityIcons
                  name={playerState.isPlaying ? "pause" : "play"}
                  size={48}
                  color={theme.colors.white}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {Math.floor(playerState.currentTime / 60)}:
                {String(Math.floor(playerState.currentTime % 60)).padStart(2, '0')} / 
                {Math.floor(playerState.duration / 60)}:
                {String(Math.floor(playerState.duration % 60)).padStart(2, '0')}
              </Text>
            </View>
          </View>
        )}

        {/* Error Display */}
        {playerState.error && (
          <View style={styles.errorOverlay}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={48}
              color={theme.colors.error}
            />
            <Text style={styles.errorText}>{playerState.error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => dispatch(setPlayerError(null))}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  placeholderCard: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  placeholderText: {
    color: theme.colors.slate[400],
    fontSize: 16,
    marginTop: 16,
  },
  playerContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  videoInfo: {
    flex: 1,
    marginRight: 16,
  },
  videoTitle: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  videoAuthor: {
    color: theme.colors.slate[300],
    fontSize: 14,
  },
  controlButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centerControls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    padding: 16,
    alignItems: 'center',
  },
  timeText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.white,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
