// This file is loaded via NODE_OPTIONS before any other code runs
// It sets EXPO_ROUTER_APP_ROOT so it's available when webpack.config.js loads
const path = require('path');

// Get the project root (mobile directory)
const projectRoot = path.resolve(__dirname, '..');

// ALWAYS set these - don't check if they exist, just set them
// This ensures they're available when webpack.config.js is loaded
process.env.EXPO_ROUTER_APP_ROOT = projectRoot;
process.env.EXPO_ROUTER_PROJECT_ROOT = projectRoot;

// Also set it on global for any code that might check there
if (typeof global !== 'undefined') {
  global.EXPO_ROUTER_APP_ROOT = projectRoot;
  global.EXPO_ROUTER_PROJECT_ROOT = projectRoot;
}
