#!/usr/bin/env node
/**
 * Pre-build script to set up environment for Expo Router web builds
 */
const path = require('path');
const fs = require('fs');

// Get the project root (directory where this script is located, then go up to mobile/)
const projectRoot = path.resolve(__dirname, '..');

// Set EXPO_ROUTER_APP_ROOT to the project root
process.env.EXPO_ROUTER_APP_ROOT = projectRoot;

// Also set it in a way that webpack can access
if (!process.env.EXPO_PUBLIC_ROUTER_APP_ROOT) {
  process.env.EXPO_PUBLIC_ROUTER_APP_ROOT = projectRoot;
}

console.log('Pre-build: Setting EXPO_ROUTER_APP_ROOT to:', projectRoot);
console.log('Pre-build: Current working directory:', process.cwd());

// Verify the app directory exists
const appDir = path.join(projectRoot, 'app');
if (!fs.existsSync(appDir)) {
  console.error('Error: app directory not found at:', appDir);
  process.exit(1);
}

console.log('Pre-build: App directory found at:', appDir);

require('./sync-pwa-public-assets.js');
