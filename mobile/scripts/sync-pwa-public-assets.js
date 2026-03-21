#!/usr/bin/env node
/**
 * Copy PWA icons from assets/ to public/ so manifest URLs (/logo192.png, etc.) resolve.
 */
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const assetsDir = path.join(projectRoot, 'assets');
const files = ['logo192.png', 'logo512.png'];

fs.mkdirSync(publicDir, { recursive: true });

for (const name of files) {
  const from = path.join(assetsDir, name);
  const to = path.join(publicDir, name);
  if (!fs.existsSync(from)) {
    console.warn(`sync-pwa-public-assets: missing ${from}, skipping`);
    continue;
  }
  fs.copyFileSync(from, to);
  console.log('sync-pwa-public-assets: copied', name, '→ public/');
}
