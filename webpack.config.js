const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "fs": false,
    "path": false,
    "os": false,
    "crypto": false,
    "stream": false,
    "buffer": false,
    "util": false,
    "url": false,
    "querystring": false,
    "http": false,
    "https": false,
    "zlib": false,
    "net": false,
    "tls": false,
    "child_process": false,
  };

  return config;
};
