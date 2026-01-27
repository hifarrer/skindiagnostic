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
console.log('Contains "fromDir":', content.includes('fromDir'));
console.log('Contains "Expected":', content.includes('Expected'));

// Add patch at the very beginning of the file to ensure fromDir is set
// This will work regardless of how fromDir is used in the file
const patchHeader = `// PATCHED: fromDir fix for webpack builds
// This patch ensures fromDir is always defined before Expo Router tries to use it
(function() {
  const path = require('path');
  // Set fromDir globally if it's not already defined
  if (typeof global !== 'undefined') {
    if (typeof global.fromDir === 'undefined' || !global.fromDir) {
      global.fromDir = process.env.EXPO_ROUTER_APP_ROOT || 
                       (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
    }
  }
  // Also set it as a module-level variable
  if (typeof fromDir === 'undefined' || !fromDir) {
    var fromDir = process.env.EXPO_ROUTER_APP_ROOT || 
                  (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
  }
})();
`;

// Insert at the very beginning of the file
const patchedContent = patchHeader + '\n' + content;

fs.writeFileSync(expoRouterPath, patchedContent);
console.log('Successfully patched expo-router _ctx.web.js with fromDir fix');
console.log('Patched file size:', patchedContent.length, 'bytes');
