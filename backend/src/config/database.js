import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine if we should use SSL
// For external databases (like Heroku, AWS RDS, Render, etc.), SSL is usually required
const getSSLConfig = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // If DATABASE_URL contains common external database indicators, enable SSL
  if (
    dbUrl.includes('amazonaws.com') ||
    dbUrl.includes('herokuapp.com') ||
    dbUrl.includes('digitalocean.com') ||
    dbUrl.includes('azure.com') ||
    dbUrl.includes('render.com') ||
    dbUrl.includes('supabase.co') ||
    dbUrl.includes('neon.tech') ||
    dbUrl.includes('railway.app') ||
    process.env.DATABASE_SSL === 'true' ||
    process.env.NODE_ENV === 'production'
  ) {
    // For external databases, we need SSL but don't verify the certificate
    // This is safe for managed database services
    return { rejectUnauthorized: false };
  }
  
  // For local databases, SSL is usually not needed
  return false;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(),
  // Add connection timeout for external databases
  connectionTimeoutMillis: 30000, // Increased for external DBs
  idleTimeoutMillis: 30000,
  // Additional options for better connection stability
  max: 20, // Maximum number of clients in the pool
  allowExitOnIdle: true,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

