// Vercel serverless function wrapper for Express app
import app from '../src/server.js';

// Vercel expects a default export that handles requests
export default async (req, res) => {
  return app(req, res);
};
