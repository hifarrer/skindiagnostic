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
                     (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

console.log('Setting fromDir to:', fromDirValue);

// Strategy: Wrap the entire file content to intercept function calls
// Since fromDir is likely a parameter, we need to intercept the function that uses it
// Replace the entire file with a version that provides fromDir

// If the file is very small (like 192 bytes), it's probably just exporting a function
// We'll wrap it to provide fromDir as a parameter
const patchedContent = `// PATCHED: fromDir fix for webpack builds
// This patch ensures fromDir is provided to Expo Router functions
const path = require('path');

// Set fromDir value from environment or fallback
const fromDir = process.env.EXPO_ROUTER_APP_ROOT || 
                (typeof __dirname !== 'undefined' ? __dirname : process.cwd());

// Original file content wrapped to provide fromDir
${content}

// If the original exports a function, ensure fromDir is available
if (typeof module !== 'undefined' && module.exports) {
  const originalExport = module.exports;
  if (typeof originalExport === 'function') {
    // Wrap the exported function to inject fromDir
    module.exports = function(...args) {
      // Ensure fromDir is in the arguments or context
      if (args.length > 0 && typeof args[0] === 'object' && !args[0].fromDir) {
        args[0] = { ...args[0], fromDir };
      } else if (args.length === 0 || (args[0] && typeof args[0] !== 'object')) {
        args.unshift({ fromDir });
      }
      return originalExport.apply(this, args);
    };
  }
}

// Make fromDir available globally for any direct access
if (typeof global !== 'undefined') {
  global.fromDir = fromDir;
}
`;

fs.writeFileSync(expoRouterPath, patchedContent);
console.log('Successfully patched expo-router _ctx.web.js with fromDir fix');
console.log('Patched file size:', patchedContent.length, 'bytes');
