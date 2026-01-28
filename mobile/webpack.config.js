// CRITICAL: Set EXPO_ROUTER_APP_ROOT BEFORE any requires
// This must be at the very top to prevent expo-router from failing during module loading
const path = require('path');
const projectRoot = path.resolve(__dirname);

// ALWAYS set these - don't check, just set them immediately
// This ensures they're available when expo-router code runs
process.env.EXPO_ROUTER_APP_ROOT = projectRoot;
process.env.EXPO_ROUTER_PROJECT_ROOT = projectRoot;

// Also set on global for any code that checks there
if (typeof global !== 'undefined') {
  global.EXPO_ROUTER_APP_ROOT = projectRoot;
  global.EXPO_ROUTER_PROJECT_ROOT = projectRoot;
}

const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  // Ensure projectRoot is set for Expo Router
  // Use __dirname to get the directory where webpack.config.js is located
  
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
        // CRITICAL: Exclude webpack.config.js from babel processing
        // This prevents expo-router's babel plugin from processing it and checking for fromDir
        exclude: [
          /webpack\.config\.js$/,
          /\.config\.js$/,
          /scripts\//,
        ],
      },
    },
    argv
  );
  
  // Exclude webpack.config.js and config files from babel processing
  // This prevents expo-router from trying to process webpack.config.js
  if (config.module && config.module.rules) {
    config.module.rules.forEach(rule => {
      if (rule.use) {
        const useArray = Array.isArray(rule.use) ? rule.use : [rule.use];
        useArray.forEach(use => {
          if (typeof use === 'object' && use.loader && use.loader.includes('babel-loader')) {
            if (!rule.exclude) {
              rule.exclude = [];
            } else if (!Array.isArray(rule.exclude)) {
              rule.exclude = [rule.exclude];
            }
            // Exclude webpack.config.js and other config files
            if (!rule.exclude.some(ex => ex.toString().includes('webpack.config'))) {
              rule.exclude.push(/webpack\.config\.js$/);
            }
            if (!rule.exclude.some(ex => ex.toString().includes('\.config\.js'))) {
              rule.exclude.push(/\.config\.js$/);
            }
          }
        });
      }
    });
  }
  
  // Exclude webpack.config.js and other config files from babel/expo-router processing
  if (!config.module) {
    config.module = {};
  }
  if (!config.module.rules) {
    config.module.rules = [];
  }
  // Find babel-loader rule and add exclude for config files
  config.module.rules.forEach(rule => {
    if (rule.use && Array.isArray(rule.use)) {
      const babelLoader = rule.use.find(loader => 
        typeof loader === 'object' && loader.loader && loader.loader.includes('babel-loader')
      );
      if (babelLoader) {
        if (!rule.exclude) {
          rule.exclude = [];
        } else if (!Array.isArray(rule.exclude)) {
          rule.exclude = [rule.exclude];
        }
        rule.exclude.push(/webpack\.config\.js$/);
        rule.exclude.push(/\.config\.js$/);
      }
    }
  });
  
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
    // Node.js built-ins not available in browser - set to false
    fs: false,
    module: false,
    tty: false,
    net: false,
    dns: false,
    child_process: false,
    readline: false,
    repl: false,
    dgram: false,
    cluster: false,
    worker_threads: false,
    inspector: false,
    perf_hooks: false,
    async_hooks: false,
    v8: false,
    vm: false,
    constants: false,
    domain: false,
    punycode: false,
    querystring: false,
    string_decoder: false,
    sys: false,
    timers: false,
    _stream_duplex: false,
    _stream_passthrough: false,
    _stream_readable: false,
    _stream_transform: false,
    _stream_writable: false,
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
