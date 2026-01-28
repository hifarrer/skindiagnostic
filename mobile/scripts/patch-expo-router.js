#!/usr/bin/env node
/**
 * Patch script to fix expo-router _ctx.web.js fromDir issue
 * This runs before the build to patch the expo-router package
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const expoRouterPath = path.join(projectRoot, 'node_modules', 'expo-router', '_ctx.web.js');

if (!fs.existsSync(expoRouterPath)) {
  console.log('expo-router _ctx.web.js not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(expoRouterPath, 'utf8');

// Check if already patched - look for the replaced path pattern instead of comment
// The patched file will have a quoted absolute path instead of process.env.EXPO_ROUTER_APP_ROOT
if (!content.includes('process.env.EXPO_ROUTER_APP_ROOT')) {
  console.log('expo-router already patched (process.env.EXPO_ROUTER_APP_ROOT not found)');
  process.exit(0);
}

// Find the fromDir usage and patch it
// The issue is that fromDir is undefined, so we need to provide a fallback
const fromDirPattern = /fromDir\s*=\s*([^,;}\]]+)/g;
const projectRootPattern = /process\.env\.EXPO_ROUTER_APP_ROOT|projectRoot|__dirname/;

// Always try to patch - the error shows fromDir is used even if we can't find it in the source
// The error message indicates fromDir is being validated somewhere
console.log('Attempting to patch expo-router _ctx.web.js...');
console.log('File size:', content.length, 'bytes');
console.log('File content preview:', content.substring(0, 200));

// Get the fromDir value from environment
const fromDirValue = process.env.EXPO_ROUTER_APP_ROOT || 
                     path.resolve(__dirname, '..');

console.log('Setting fromDir to:', fromDirValue);

// The file uses require.context with process.env.EXPO_ROUTER_APP_ROOT
// Webpack's require.context needs the actual path, not an env var
// We need to replace process.env.EXPO_ROUTER_APP_ROOT with the actual path value
// Escape the path properly for use in a JavaScript string
const escapedPath = fromDirValue.replace(/\\/g, '/').replace(/"/g, '\\"');
const patchedContent = content.replace(
  /process\.env\.EXPO_ROUTER_APP_ROOT/g,
  `"${escapedPath}"`
);

// Write the patched content directly (no extra comments that might confuse webpack)
fs.writeFileSync(expoRouterPath, patchedContent);
console.log('Successfully patched expo-router _ctx.web.js with fromDir fix');
console.log('Replaced process.env.EXPO_ROUTER_APP_ROOT with:', fromDirValue);
console.log('Patched file size:', patchedContent.length, 'bytes');
