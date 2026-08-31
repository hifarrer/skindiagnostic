/**
 * Frontend origin helpers.
 *
 * FRONTEND_URL may hold a single origin or a comma-separated list (e.g. the www
 * and apex forms of the site). The first entry is the canonical origin used for
 * redirects; every entry is accepted by CORS.
 *
 * Read lazily so dotenv.config() has run by the time these are called.
 */

const DEFAULT_FRONTEND_URL = 'http://localhost:8081';

const normalizeOrigin = (value) => {
  const trimmed = value.trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const getAllowedOrigins = () => {
  const origins = (process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(normalizeOrigin);

  return origins.length > 0 ? origins : [DEFAULT_FRONTEND_URL];
};

// Canonical origin for redirects back to the site (OAuth callback, Stripe).
export const getFrontendUrl = () => getAllowedOrigins()[0];
