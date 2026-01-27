/**
 * Script to find and fix missing web imports in React Native
 * This helps identify files that need web stubs
 */

const fs = require('fs');
const path = require('path');

const rnPath = path.join(__dirname, '../node_modules/react-native/Libraries');
const missingModules = new Set();

function findMissingImports(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findMissingImports(filePath);
    } else if (file.endsWith('.js') && !file.includes('.web.') && !file.includes('.ios.') && !file.includes('.android.')) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const relativeImports = content.match(/require\(['"](\.\.\/[^'"]+)['"]\)|import.*from ['"](\.\.\/[^'"]+)['"]/g);
        
        if (relativeImports) {
          for (const imp of relativeImports) {
            const match = imp.match(/['"](\.\.\/[^'"]+)['"]/);
            if (match) {
              const importPath = match[1];
              const resolvedPath = path.resolve(path.dirname(filePath), importPath);
              
              // Check if file exists (try .js, .ios.js, .android.js)
              const possiblePaths = [
                resolvedPath + '.js',
                resolvedPath + '.ios.js',
                resolvedPath + '.android.js',
                resolvedPath + '.web.js',
              ];
              
              const exists = possiblePaths.some(p => {
                try {
                  return fs.existsSync(p);
                } catch {
                  return false;
                }
              });
              
              if (!exists && !importPath.includes('node_modules')) {
                missingModules.add(`${filePath} -> ${importPath}`);
              }
            }
          }
        }
      } catch (e) {
        // Skip files that can't be read
      }
    }
  }
}

console.log('Scanning for missing imports...');
findMissingImports(rnPath);

console.log(`\nFound ${missingModules.size} potentially missing imports:`);
Array.from(missingModules).slice(0, 20).forEach(m => console.log(`  ${m}`));
