module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'react' }],
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    // Exclude webpack.config.js and other config files from babel processing
    // This prevents expo-router's babel plugin from processing them
    exclude: [
      /webpack\.config\.js$/,
      /\.config\.js$/,
      /scripts\//,
    ],
  };
};
