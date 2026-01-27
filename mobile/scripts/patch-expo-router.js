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

// Try to patch by finding where fromDir is used and providing a fallback
if (content.includes('fromDir') && !content.includes('// PATCHED: fromDir fix')) {
  console.log('Found fromDir in expo-router _ctx.web.js, attempting to patch...');
  
  // Look for the pattern where fromDir is expected to be a string
  // Common pattern: fromDir parameter or fromDir variable
  const fromDirPattern = /(?:fromDir\s*[=:]\s*|Expected\s+`fromDir`)/;
  
  // Try to find where fromDir is used and add a fallback
  // The error says "Expected `fromDir` to be of type `string`, got `undefined`"
  // So we need to ensure fromDir has a value before it's checked
  
  // Find all occurrences of fromDir
  const fromDirMatches = [];
  let searchIndex = 0;
  while ((searchIndex = content.indexOf('fromDir', searchIndex)) !== -1) {
    fromDirMatches.push(searchIndex);
    searchIndex += 7; // length of 'fromDir'
  }
  
  if (fromDirMatches.length > 0) {
    // Try to find the function that uses fromDir
    // Look for the transform function or similar
    const transformMatch = content.match(/(?:function|const|let|var)\s+(\w+)?\s*[=\(].*?fromDir/);
    
    // Add patch at the beginning of the file
    const patchHeader = `// PATCHED: fromDir fix for webpack builds
const path = require('path');
// Ensure fromDir is set before any usage
if (typeof fromDir === 'undefined' || !fromDir) {
  fromDir = process.env.EXPO_ROUTER_APP_ROOT || (typeof __dirname !== 'undefined' ? __dirname : process.cwd());
}
`;

    // Insert at the very beginning, after any existing comments/requires
    const requireEnd = content.lastIndexOf('require(');
    const firstFunction = content.indexOf('function');
    const firstConst = content.indexOf('const');
    const firstExport = content.indexOf('export');
    
    let insertPoint = Math.max(requireEnd, firstFunction, firstConst, firstExport);
    if (insertPoint === -1) insertPoint = 0;
    
    // Find the end of the first statement/line
    const lineEnd = content.indexOf('\n', insertPoint);
    insertPoint = lineEnd > -1 ? lineEnd + 1 : 0;
    
    const patchedContent = content.substring(0, insertPoint) + patchHeader + content.substring(insertPoint);
    
    fs.writeFileSync(expoRouterPath, patchedContent);
    console.log('Successfully patched expo-router _ctx.web.js with fromDir fix');
  } else {
    console.log('Could not find fromDir usage pattern in expo-router _ctx.web.js');
  }
} else if (content.includes('// PATCHED: fromDir fix')) {
  console.log('expo-router _ctx.web.js already patched');
} else {
  console.log('expo-router _ctx.web.js does not contain fromDir, may not need patching');
}
