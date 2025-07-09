import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface WebCompatibleYouTubePlayerProps {
  videoId: string;
  maxWidth?: number;
}

const WebCompatibleYouTubePlayer: React.FC<WebCompatibleYouTubePlayerProps> = ({ 
  videoId, 
  maxWidth = 700 
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth - 32, maxWidth); // 32 for padding/margin
  const height = width * 9 / 16;

  // Create YouTube embed URL with minimal parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`;

  return (
    <View style={[styles.playerWrapper, { width, height }]}>
      {Platform.OS === 'web' ? (
        // Simple iframe for web
        <iframe
          title={`YouTube Video ${videoId}`}
          width={width}
          height={height}
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: 16 }}
        />
      ) : (
        // Simple WebView for native platforms
        <WebView
          source={{ uri: embedUrl }}
          style={{ width, height }}
          javaScriptEnabled={true}
          allowsFullscreenVideo={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  playerWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'black',
    alignSelf: 'center',
  },
});

export default WebCompatibleYouTubePlayer;
