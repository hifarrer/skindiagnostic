#!/usr/bin/env node
/**
 * Dev proxy: run the app on 8081 while keeping API and OAuth on the same origin.
 * Proxies /api to the backend (default 3000); everything else to Expo (default 19006).
 *
 * Usage:
 *   Terminal 1: cd backend && npm run dev          # backend on 3000
 *   Terminal 2: PORT=19006 npx expo start --web   # Expo on 19006
 *   Terminal 3: node scripts/dev-proxy.js        # proxy on 8081
 *   Open http://localhost:8081
 *
 * In mobile/.env: EXPO_PUBLIC_API_URL=http://localhost:8081/api
 * In backend/.env: OAUTH_CALLBACK_URL=http://localhost:8081/api/auth/oauth/google/callback
 *                 FRONTEND_URL=http://localhost:8081
 * In Google Console: add redirect URI http://localhost:8081/api/auth/oauth/google/callback
 */

const http = require('http');
const https = require('https');

const PROXY_PORT = parseInt(process.env.PROXY_PORT || '8081', 10);
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const EXPO_URL = process.env.EXPO_URL || 'http://localhost:19006';

const backendOrigin = new URL(BACKEND_URL).origin;
const expoOrigin = new URL(EXPO_URL).origin;

function proxyRequest(clientReq, clientRes, targetOrigin, path) {
  const url = targetOrigin + (path || clientReq.url);
  const parsed = new URL(url);
  const lib = parsed.protocol === 'https:' ? https : http;
  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: clientReq.method,
    headers: { ...clientReq.headers, host: parsed.host },
  };
  const proxyReq = lib.request(options, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes);
  });
  proxyReq.on('error', (err) => {
    console.error('Proxy upstream error:', err.message);
    clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
    clientRes.end('Bad Gateway: could not reach ' + targetOrigin);
  });
  clientReq.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api')) {
    proxyRequest(req, res, backendOrigin, req.url);
  } else {
    proxyRequest(req, res, expoOrigin, req.url);
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`Dev proxy: http://localhost:${PROXY_PORT}`);
  console.log(`  /api/* -> ${BACKEND_URL}`);
  console.log(`  /*     -> ${EXPO_URL}`);
  console.log('');
  console.log('Set EXPO_PUBLIC_API_URL=http://localhost:' + PROXY_PORT + '/api');
  console.log('Set backend OAUTH_CALLBACK_URL=http://localhost:' + PROXY_PORT + '/api/auth/oauth/google/callback');
});
