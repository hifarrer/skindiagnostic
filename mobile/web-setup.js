/**
 * Web setup for React Native
 * This initializes the necessary globals for web platform
 */

if (typeof window !== 'undefined') {
  // Set up __fbBatchedBridgeConfig for web
  if (!window.__fbBatchedBridgeConfig) {
    window.__fbBatchedBridgeConfig = {
      remoteModuleConfig: [],
    };
  }

  // Set up nativeModuleProxy as empty object for web
  if (!window.nativeModuleProxy) {
    window.nativeModuleProxy = {};
  }

  // Set up nativeExtensions flag
  if (typeof global !== 'undefined') {
    global.nativeExtensions = true;
  }
}
