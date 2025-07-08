const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver aliases
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native-web-webview': 'react-native-web-webview',
};

// Add web-specific platform extensions
config.resolver.platforms = [
  'web',
  'native',
  'ios',
  'android',
];

module.exports = config;
