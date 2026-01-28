const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  // Ensure projectRoot is set for Expo Router
  // Use __dirname to get the directory where webpack.config.js is located
  const projectRoot = path.resolve(__dirname);
  
  // Set environment variable for Expo Router (use env var if set, otherwise use projectRoot)
  // If EXPO_ROUTER_APP_ROOT is already an absolute path, use it; otherwise resolve relative to projectRoot
  let appRoot = projectRoot;
  if (process.env.EXPO_ROUTER_APP_ROOT) {
    appRoot = path.isAbsolute(process.env.EXPO_ROUTER_APP_ROOT)
      ? process.env.EXPO_ROUTER_APP_ROOT
      : path.resolve(projectRoot, process.env.EXPO_ROUTER_APP_ROOT);
  }
  // Ensure it's set as an absolute path
  process.env.EXPO_ROUTER_APP_ROOT = appRoot;
  
  console.log('Webpack config: projectRoot =', projectRoot);
  console.log('Webpack config: EXPO_ROUTER_APP_ROOT =', appRoot);
  
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
    path: require.resolve('path-browserify'),
    fs: false, // fs is not available in browser, scripts should not be bundled
  };
  
  // Add aliases for packages with native bindings that don't work in browser
  config.resolve.alias = {
    ...config.resolve.alias,
    // lightningcss has native Node.js bindings that don't work in browser
    'lightningcss': false,
  };
  
  // Exclude scripts directory from webpack processing using IgnorePlugin
  // Scripts are build-time only, not part of the web bundle
  // Convert projectRoot to RegExp by escaping special characters
  const projectRootRegex = new RegExp(projectRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /scripts/,
      contextRegExp: projectRootRegex,
    })
  );

  // Ensure plugins array exists and add our plugins
  config.plugins = config.plugins || [];
  
  // Add DefinePlugin to ensure EXPO_ROUTER_APP_ROOT is available at build time
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env.EXPO_ROUTER_APP_ROOT': JSON.stringify(appRoot),
      'process.env.EXPO_ROUTER_PROJECT_ROOT': JSON.stringify(projectRoot),
    })
  );
  
  // Provide global variables for packages that expect them
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );
  
  // Add a custom plugin to fix expo-router fromDir issue
  config.plugins.push({
    apply: (compiler) => {
      compiler.hooks.normalModuleFactory.tap('ExpoRouterFromDirFix', (nmf) => {
        nmf.hooks.beforeResolve.tap('ExpoRouterFromDirFix', (data) => {
          if (data && data.request && data.request.includes('expo-router/_ctx.web')) {
            // Ensure the context has the project root (modify in place, don't return)
            if (!data.context) {
              data.context = projectRoot;
            }
          }
          // Don't return anything - beforeResolve is a bailing hook
        });
      });
    },
  });

  return config;
};
