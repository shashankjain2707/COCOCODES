import React, { useRef } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

interface WebCompatibleYouTubePlayerProps {
  videoId: string;
  maxWidth?: number; // Optional: allow parent to set a max width
}

const WebCompatibleYouTubePlayer: React.FC<WebCompatibleYouTubePlayerProps> = ({ videoId, maxWidth = 700 }) => {
  const playerRef = useRef<any>(null);
  const { width: windowWidth } = useWindowDimensions();
  const width = Math.min(windowWidth - 32, maxWidth); // 32 for padding/margin
  const height = width * 9 / 16;

  return (
    <View style={[styles.playerWrapper, { width, height }]}> 
      <YoutubePlayer
        ref={playerRef}
        height={height}
        width={width}
        play={false}
        videoId={videoId}
        webViewStyle={{
          borderRadius: 16,
          backgroundColor: 'black',
        }}
        initialPlayerParams={{
          controls: true,
          modestbranding: true,
          rel: false,
          showinfo: false,
        }}
        forceAndroidAutoplay={false}
      />
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
