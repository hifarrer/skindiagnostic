// This file is loaded via NODE_OPTIONS before any other code runs
// It sets EXPO_ROUTER_APP_ROOT so it's available when webpack.config.js loads
const path = require('path');

// Get the project root (mobile directory)
const projectRoot = path.resolve(__dirname, '..');

// Set environment variables if not already set
if (!process.env.EXPO_ROUTER_APP_ROOT) {
  process.env.EXPO_ROUTER_APP_ROOT = projectRoot;
}
if (!process.env.EXPO_ROUTER_PROJECT_ROOT) {
  process.env.EXPO_ROUTER_PROJECT_ROOT = projectRoot;
}
