const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  // Ensure projectRoot is set for Expo Router
  const projectRoot = path.resolve(__dirname);
  
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      projectRoot: projectRoot,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['expo-modules-core', 'expo-router'],
      },
    },
    argv
  );
  
  // Ensure context is set correctly
  config.context = projectRoot;

  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    util: require.resolve('util'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify/browser'),
    url: require.resolve('url'),
    zlib: require.resolve('browserify-zlib'),
  };

  // Provide global variables for packages that expect them
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ];

  return config;
};
