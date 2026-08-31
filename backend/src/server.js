import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getAllowedOrigins } from './config/urls.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import skinAnalysisRoutes from './routes/skinAnalysisRoutes.js';
import makeupVTORoutes from './routes/makeupVTORoutes.js';
import lookVTORoutes from './routes/lookVTORoutes.js';
import planRoutes from './routes/planRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dermatologistRoutes from './routes/dermatologistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminPageRoute from './routes/adminPageRoute.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// FRONTEND_URL may list several origins (e.g. www and apex); accept them all.
// Requests without an Origin header (native app, curl, server-to-server) pass through.
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || getAllowedOrigins().includes(origin)),
  credentials: true,
}));

// Webhook routes BEFORE express.json() — Stripe requires raw body for
// signature verification; each webhook route applies its own body parser.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/skin-analysis', skinAnalysisRoutes);
app.use('/api/makeup-vto', makeupVTORoutes);
app.use('/api/look-vto', lookVTORoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/dermatologists', dermatologistRoutes);
app.use('/api/admin', adminRoutes);

// Serve admin dashboard (inline HTML, works in Vercel serverless)
app.use('/admin', adminPageRoute);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Only start the server if not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export the app for Vercel serverless functions
export default app;

