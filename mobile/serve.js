#!/usr/bin/env node
/**
 * Start script for production static server.
 * Reads PORT from env and binds to 0.0.0.0 so Railway can reach the app.
 */
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.error('Error: dist/ folder not found. Run the build first.');
  process.exit(1);
}

console.log('Serving dist at 0.0.0.0:' + port);

const child = spawn(
  'npx',
  ['serve', 'dist', '-s', '-l', `0.0.0.0:${port}`],
  { stdio: 'inherit', cwd: __dirname }
);

child.on('exit', (code) => {
  process.exit(code || 0);
});
