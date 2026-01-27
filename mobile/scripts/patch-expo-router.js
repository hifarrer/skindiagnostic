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

// Try to patch by adding a fallback
if (content.includes('fromDir') && !content.includes('// PATCHED: fromDir fix')) {
  // Add a fallback at the top of the file or where fromDir is used
  const patchCode = `
// PATCHED: fromDir fix for webpack builds
const path = require('path');
const getFromDir = () => {
  if (typeof fromDir !== 'undefined' && fromDir) return fromDir;
  if (process.env.EXPO_ROUTER_APP_ROOT) return process.env.EXPO_ROUTER_APP_ROOT;
  if (typeof __dirname !== 'undefined') return __dirname;
  return process.cwd();
};
`;

  // Try to insert the patch before the first use of fromDir
  const fromDirIndex = content.indexOf('fromDir');
  if (fromDirIndex > -1) {
    // Find the function or block that contains fromDir
    const beforeFromDir = content.substring(0, fromDirIndex);
    const afterFromDir = content.substring(fromDirIndex);
    
    // Try to find a good insertion point (before the function that uses fromDir)
    const functionStart = beforeFromDir.lastIndexOf('function');
    const asyncStart = beforeFromDir.lastIndexOf('async');
    const constStart = beforeFromDir.lastIndexOf('const');
    
    let insertPoint = Math.max(functionStart, asyncStart, constStart);
    if (insertPoint === -1) {
      insertPoint = 0;
    }
    
    // Insert the patch
    const newContent = content.substring(0, insertPoint) + patchCode + content.substring(insertPoint);
    
    // Also replace fromDir usage with getFromDir()
    const patchedContent = newContent.replace(/fromDir/g, 'getFromDir()');
    
    fs.writeFileSync(expoRouterPath, patchedContent);
    console.log('Patched expo-router _ctx.web.js');
  } else {
    console.log('Could not find fromDir in expo-router _ctx.web.js');
  }
} else {
  console.log('expo-router _ctx.web.js does not need patching or already patched');
}
