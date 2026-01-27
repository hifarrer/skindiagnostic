/**
 * Web entry point - Minimal setup
 */

if (typeof window !== 'undefined') {
  // Polyfill setImmediate
  if (!window.setImmediate) {
    window.setImmediate = function(callback) {
      return window.setTimeout(callback, 0);
    };
  }
  if (typeof global !== 'undefined') {
    global.setImmediate = window.setImmediate;
  }

  // Initialize ErrorUtils
  if (!global.ErrorUtils) {
    global.ErrorUtils = {
      setGlobalHandler: () => {},
      reportFatalError: (error) => console.error('Fatal error:', error),
      reportError: (error) => console.error('Error:', error),
    };
  }

  // Initialize __fbBatchedBridgeConfig
  if (!window.__fbBatchedBridgeConfig) {
    window.__fbBatchedBridgeConfig = { remoteModuleConfig: [] };
  }
}

// Now require the actual entry point
require('expo-router/entry');
