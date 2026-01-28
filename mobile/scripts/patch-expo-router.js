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

// Check if already patched
if (content.includes('// PATCHED: fromDir fix')) {
  console.log('expo-router already patched');
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
const patchedContent = content.replace(
  /process\.env\.EXPO_ROUTER_APP_ROOT/g,
  `"${fromDirValue.replace(/\\/g, '/')}"`
);

// Also add a comment at the top to mark it as patched
const finalContent = `// PATCHED: fromDir fix for webpack builds - replaced process.env.EXPO_ROUTER_APP_ROOT with actual path
${patchedContent}
`;

fs.writeFileSync(expoRouterPath, finalContent);
console.log('Successfully patched expo-router _ctx.web.js with fromDir fix');
console.log('Replaced process.env.EXPO_ROUTER_APP_ROOT with:', fromDirValue);
console.log('Patched file size:', finalContent.length, 'bytes');
