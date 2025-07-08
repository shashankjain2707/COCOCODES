/**
 * WebView Platform Resolver
 * Fixes react-native-webview compatibility with Expo
 */

import React from 'react';
import { Platform, View, Text } from 'react-native';

// Define a simple WebView interface for our usage
interface WebViewProps {
  source: { uri: string } | { html: string };
  style?: any;
  onMessage?: (event: any) => void;
  onLoad?: () => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  injectedJavaScript?: string;
  javaScriptEnabled?: boolean;
  domStorageEnabled?: boolean;
  allowsInlineMediaPlayback?: boolean;
  mediaPlaybackRequiresUserAction?: boolean;
  ref?: any;
  [key: string]: any;
}

let WebView: React.ComponentType<WebViewProps>;

if (Platform.OS === 'web') {
  // For web platform, use our custom iframe implementation
  WebView = require('./WebViewWeb').WebView;
} else {
  // For native platforms, create a fallback component that shows instructions
  WebView = React.forwardRef<any, WebViewProps>(({ style, ...props }, ref) => {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }, style]}>
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
          WebView requires native build.{'\n'}
          Please run on a physical device or emulator.{'\n'}
          Web version uses iframe fallback.
        </Text>
      </View>
    );
  });
}

export { WebView };
export default WebView;
