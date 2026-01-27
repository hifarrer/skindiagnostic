const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  // Ensure projectRoot is set for Expo Router
  // Use __dirname to get the directory where webpack.config.js is located
  const projectRoot = path.resolve(__dirname);
  
  // Set environment variable for Expo Router (use env var if set, otherwise use projectRoot)
  const appRoot = process.env.EXPO_ROUTER_APP_ROOT 
    ? path.resolve(projectRoot, process.env.EXPO_ROUTER_APP_ROOT)
    : projectRoot;
  process.env.EXPO_ROUTER_APP_ROOT = appRoot;
  
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
  
  // Set resolve modules to include project root
  if (!config.resolve.modules) {
    config.resolve.modules = ['node_modules', projectRoot];
  } else if (!config.resolve.modules.includes(projectRoot)) {
    config.resolve.modules.push(projectRoot);
  }
  
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

  // Ensure plugins array exists and add our plugins
  config.plugins = config.plugins || [];
  
  // Add DefinePlugin to ensure EXPO_ROUTER_APP_ROOT is available at build time
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(appRoot),
    })
  );
  
  // Provide global variables for packages that expect them
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );

  return config;
};
