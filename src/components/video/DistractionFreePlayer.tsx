/**
 * Distraction-Free YouTube Player Component
 * Provides clean, educational-focused video playback without YouTube distractions
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
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
import { VideoMetadata, QuizQuestion } from '../../types/video';
import { quizGenerator } from '../../services/ai/quizGenerator';
import { InVideoQuizOverlay } from '../quiz/InVideoQuizOverlay';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DistractionFreePlayerProps {
  videoId?: string;
  video?: VideoMetadata;
  autoplay?: boolean;
  showControls?: boolean;
  enableQuizzes?: boolean;
  onVideoEnd?: () => void;
  onError?: (error: string) => void;
  onQuizComplete?: (quizId: string, correct: boolean) => void;
}

export const DistractionFreePlayer: React.FC<DistractionFreePlayerProps> = ({
  videoId,
  video,
  autoplay = false,
  showControls = true,
  enableQuizzes = true,
  onVideoEnd,
  onError,
  onQuizComplete,
}) => {
  const dispatch = useDispatch();
  const webViewRef = useRef<any>(null);
  const playerState = useSelector(selectPlayerState);
  const currentVideo = useSelector(selectCurrentVideo);
  
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizzesGenerated, setQuizzesGenerated] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const currentVideoId = videoId || video?.id || currentVideo?.id;
  const currentVideoData = video || currentVideo;

  // Generate distraction-free embed URL
  const embedUrl = currentVideoId ? generateDistractionFreeEmbedUrl(currentVideoId, {
    autoplay,
    controls: false, // We'll use custom controls
    modestBranding: true,
    showInfo: false,
    showRelated: false,
    disableKeyboard: false,
    allowFullscreen: true,
  }) : null;

  /**
   * Generate distraction-free YouTube embed URL
   */
  function generateDistractionFreeEmbedUrl(videoId: string, options: any): string {
    const params = new URLSearchParams({
      enablejsapi: '1',
      autoplay: options.autoplay ? '1' : '0',
      controls: '0', // Disable YouTube controls
      modestbranding: '1',
      showinfo: '0',
      rel: '0', // Don't show related videos
      fs: '1', // Allow fullscreen
      disablekb: '0',
      playsinline: '1',
      iv_load_policy: '3', // Hide annotations
      cc_load_policy: '0', // Hide captions by default
      origin: 'https://edutube.app',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * Generate quizzes for the current video
   */
  const generateQuizzes = useCallback(async () => {
    if (!currentVideoId || quizzesGenerated) return;

    try {
      dispatch(setPlayerLoading(true));
      console.log(`Generating quizzes for video: ${currentVideoId}`);
      
      const generatedQuizzes = await quizGenerator.generateQuizzesForVideo(currentVideoId);
      setQuizzes(generatedQuizzes);
      setQuizzesGenerated(true);
      
      console.log(`Generated ${generatedQuizzes.length} quizzes for video`);
    } catch (error) {
      console.error('Error generating quizzes:', error);
      onError?.('Failed to generate interactive quizzes');
    } finally {
      dispatch(setPlayerLoading(false));
    }
  }, [currentVideoId, quizzesGenerated, dispatch, onError]);

  /**
   * Check if quiz should be shown at current time
   */
  const checkForQuiz = useCallback((currentTime: number) => {
    if (!enableQuizzes || quizzes.length === 0 || showQuiz) return;

    const quiz = quizGenerator.shouldShowQuiz(quizzes, currentTime, 2);
    if (quiz && quiz.id !== currentQuiz?.id) {
      setCurrentQuiz(quiz);
      setShowQuiz(true);
      // Pause video for quiz
      handlePause();
    }
  }, [enableQuizzes, quizzes, showQuiz, currentQuiz]);

  /**
   * Handle quiz completion
   */
  const handleQuizComplete = (quizId: string, selectedAnswer: number, correct: boolean) => {
    setShowQuiz(false);
    setCurrentQuiz(null);
    onQuizComplete?.(quizId, correct);
    
    // Resume video after quiz
    handlePlay();
  };

  /**
   * Show/hide custom controls
   */
  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Auto-hide controls after 3 seconds
    const timeout = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  /**
   * Custom player controls
   */
  const handlePlay = () => {
    dispatch(playVideo());
    webViewRef.current?.postMessage(JSON.stringify({ action: 'play' }));
  };

  const handlePause = () => {
    dispatch(pauseVideo());
    webViewRef.current?.postMessage(JSON.stringify({ action: 'pause' }));
  };

  const handleSeek = (seconds: number) => {
    const newTime = Math.max(0, playerState.currentTime + seconds);
    dispatch(setCurrentTime(newTime));
    webViewRef.current?.postMessage(JSON.stringify({ 
      action: 'seekTo', 
      time: newTime 
    }));
  };

  const handleFullscreen = () => {
    dispatch(toggleFullscreen());
    webViewRef.current?.postMessage(JSON.stringify({ action: 'fullscreen' }));
  };

  /**
   * Handle messages from YouTube player
   */
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'timeupdate':
          dispatch(setCurrentTime(data.currentTime));
          checkForQuiz(data.currentTime);
          break;
        case 'durationchange':
          dispatch(setDuration(data.duration));
          break;
        case 'play':
          dispatch(playVideo());
          break;
        case 'pause':
          dispatch(pauseVideo());
          break;
        case 'ended':
          onVideoEnd?.();
          break;
        case 'error':
          dispatch(setPlayerError(data.error));
          onError?.(data.error);
          break;
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  /**
   * Custom YouTube player JavaScript for communication
   */
  const playerScript = `
    let player;
    let isReady = false;

    function onYouTubeIframeAPIReady() {
      player = new YT.Player('player', {
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': onPlayerError
        }
      });
    }

    function onPlayerReady() {
      isReady = true;
      setInterval(() => {
        if (player && player.getCurrentTime) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'timeupdate',
            currentTime: player.getCurrentTime(),
            duration: player.getDuration()
          }));
        }
      }, 1000);
    }

    function onPlayerStateChange(event) {
      switch(event.data) {
        case YT.PlayerState.PLAYING:
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'play'}));
          break;
        case YT.PlayerState.PAUSED:
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'pause'}));
          break;
        case YT.PlayerState.ENDED:
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'ended'}));
          break;
      }
    }

    function onPlayerError(event) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'error',
        error: 'Video playback error: ' + event.data
      }));
    }

    // Listen for messages from React Native
    document.addEventListener('message', function(event) {
      const data = JSON.parse(event.data);
      if (!isReady || !player) return;

      switch(data.action) {
        case 'play':
          player.playVideo();
          break;
        case 'pause':
          player.pauseVideo();
          break;
        case 'seekTo':
          player.seekTo(data.time);
          break;
        case 'fullscreen':
          // Handle fullscreen request
          break;
      }
    });

    // Load YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  `;

  // Initialize video and generate quizzes
  useEffect(() => {
    if (currentVideoId && currentVideoData) {
      dispatch(setCurrentVideo(currentVideoData));
      
      if (enableQuizzes) {
        generateQuizzes();
      }
    }
  }, [currentVideoId, currentVideoData, enableQuizzes, generateQuizzes, dispatch]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  if (!currentVideoId || !embedUrl) {
    return (
      <GlassCard style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons 
            name="video-off" 
            size={48} 
            color={theme.colors.error} 
          />
          <Text style={styles.errorText}>No video selected</Text>
        </View>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={playerState.isFullscreen} />
      
      {/* Video Player */}
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={toggleControls}
        style={styles.playerContainer}
      >
        <WebView
          ref={webViewRef}
          source={{ uri: embedUrl }}
          style={styles.webview}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled={true}
          injectedJavaScript={playerScript}
          onMessage={handleWebViewMessage}
          onLoadStart={() => dispatch(setPlayerLoading(true))}
          onLoadEnd={() => dispatch(setPlayerLoading(false))}
          onError={(error: any) => {
            dispatch(setPlayerError(error.nativeEvent.description));
            onError?.(error.nativeEvent.description);
          }}
        />

        {/* Loading Indicator */}
        {playerState.isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}

        {/* Custom Controls Overlay */}
        {showControls && controlsVisible && (
          <View style={styles.controlsOverlay}>
            <View style={styles.controlsContainer}>
              {/* Play/Pause Button */}
              <TouchableOpacity
                onPress={playerState.isPlaying ? handlePause : handlePlay}
                style={styles.playButton}
              >
                <MaterialCommunityIcons
                  name={playerState.isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              {/* Seek Buttons */}
              <TouchableOpacity
                onPress={() => handleSeek(-10)}
                style={styles.seekButton}
              >
                <MaterialCommunityIcons
                  name="rewind-10"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSeek(10)}
                style={styles.seekButton}
              >
                <MaterialCommunityIcons
                  name="fast-forward-10"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>

              {/* Fullscreen Button */}
              <TouchableOpacity
                onPress={handleFullscreen}
                style={styles.fullscreenButton}
              >
                <MaterialCommunityIcons
                  name="fullscreen"
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            </View>

            {/* Video Info */}
            {currentVideoData && (
              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {currentVideoData.title}
                </Text>
                <Text style={styles.videoAuthor}>
                  {currentVideoData.author}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Quiz Overlay */}
      {showQuiz && currentQuiz && (
        <InVideoQuizOverlay
          quiz={currentQuiz}
          onComplete={handleQuizComplete}
          onSkip={() => {
            setShowQuiz(false);
            setCurrentQuiz(null);
            handlePlay();
          }}
        />
      )}

      {/* Quiz Generation Status */}
      {enableQuizzes && !quizzesGenerated && currentVideoId && (
        <View style={styles.quizStatus}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.quizStatusText}>
            Generating interactive quizzes...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  playerContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.md,
    marginTop: 10,
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    marginTop: 10,
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
    padding: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 12,
    marginHorizontal: 10,
  },
  seekButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
  },
  fullscreenButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 5,
  },
  videoInfo: {
    alignItems: 'center',
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 5,
  },
  videoAuthor: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
  },
  quizStatus: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
  },
  quizStatusText: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    marginLeft: 10,
  },
});

export default DistractionFreePlayer;
