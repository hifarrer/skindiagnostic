// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure web platform is supported
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Add web source extensions
config.resolver.sourceExts.push('web.js', 'web.jsx', 'web.ts', 'web.tsx');

// Disable HMR on web to avoid WebSocket issues
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Disable HMR endpoints on web
      if (req.url && req.url.includes('/hot') && req.headers['user-agent']?.includes('Mozilla')) {
        return res.status(404).end();
      }
      return middleware(req, res, next);
    };
  },
};

// Custom resolver to handle React Native internal imports on web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, realModuleName, platform, moduleName) => {
  // On web, intercept critical React Native internal modules and redirect them to shims
  if (platform === 'web') {
    
    // 1. Shim URL (Fixes "URL.pathname not implemented")
    if (
      realModuleName === 'react-native/Libraries/Blob/URL' || 
      realModuleName.endsWith('/Blob/URL') ||
      realModuleName.endsWith('/Blob/URL.js')
    ) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'web-shims/URL.js'),
      };
    }

    // 2. Shim Timers (Fixes "setTimeout is not a function")
    if (
      realModuleName === 'react-native/Libraries/Core/setUpTimers' ||
      realModuleName.endsWith('/Core/setUpTimers') ||
      realModuleName.endsWith('/Core/setUpTimers.js')
    ) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(__dirname, 'web-shims/Timers.js'),
      };
    }

    // 3. Shim setUpXHR (Prevent unwanted polyfills like URL/Fetch)
    if (
        realModuleName === 'react-native/Libraries/Core/setUpXHR' ||
        realModuleName.endsWith('/Core/setUpXHR') ||
        realModuleName.endsWith('/Core/setUpXHR.js')
      ) {
        return {
          type: 'sourceFile',
          filePath: path.resolve(__dirname, 'web-shims/setUpXHR.js'),
        };
      }

    // 4. Shim Platform (General compatibility)
    const isFromRNLibrary = context.originModulePath && 
      context.originModulePath.includes('react-native/Libraries');
    
    if (isFromRNLibrary && realModuleName) {
      if (realModuleName.includes('Utilities/Platform') || 
          realModuleName.endsWith('/Platform') ||
          (realModuleName.includes('../') && context.originModulePath.includes('TextInput'))) {
        return {
          type: 'sourceFile',
          filePath: require.resolve('react-native-web/dist/exports/Platform'),
        };
      }
    }
    
    if (realModuleName === 'react-native/Libraries/Utilities/Platform') {
      return {
        type: 'sourceFile',
        filePath: require.resolve('react-native-web/dist/exports/Platform'),
      };
    }
  }
  
  // Use default resolver
  if (originalResolveRequest) {
    return originalResolveRequest(context, realModuleName, platform, moduleName);
  }
  
  return context.resolveRequest(context, realModuleName, platform, moduleName);
};

module.exports = config;
