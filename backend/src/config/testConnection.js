import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Determine if we should use SSL
const getSSLConfig = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  
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
    return { rejectUnauthorized: false };
  }
  
  return false;
};

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Parse and display connection info (without password)
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log('Host:', url.hostname);
    console.log('Port:', url.port || '5432 (default)');
    console.log('Database:', url.pathname.slice(1));
    console.log('User:', url.username);
    
    // Check if SSL is needed
    const needsSSL = getSSLConfig();
    console.log('SSL:', needsSSL ? 'Enabled' : 'Disabled');
    if (needsSSL) {
      console.log('  (SSL is required for this database provider)');
    }
  } catch (e) {
    console.log('Connection string format:', process.env.DATABASE_URL.substring(0, 20) + '...');
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: getSSLConfig(),
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20,
    allowExitOnIdle: true,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to database!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database query successful!');
    console.log('Current time:', result.rows[0].current_time);
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    client.release();
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Troubleshooting tips:');
      console.error('1. Check if the database host is correct');
      console.error('2. Verify the database port (default is 5432)');
      console.error('3. Check if your IP is whitelisted (for cloud databases)');
      console.error('4. Verify your firewall allows connections to the database');
      console.error('5. For external databases, you may need to enable SSL');
      console.error('   Add to .env: DATABASE_SSL=true');
    } else if (error.code === 'ECONNRESET') {
      console.error('\n💡 Connection was reset. This usually means:');
      console.error('1. SSL/TLS is required but not enabled');
      console.error('   Solution: Add DATABASE_SSL=true to .env');
      console.error('2. Connection timeout or network issue');
      console.error('3. Database server closed the connection');
      console.error('4. For Render.com: SSL is always required');
      console.error('\n🔧 Try adding this to your backend/.env:');
      console.error('DATABASE_SSL=true');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n💡 Host not found. Check your DATABASE_URL hostname.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n💡 Connection timeout. Check:');
      console.error('1. Database host is reachable');
      console.error('2. Your IP is whitelisted');
      console.error('3. Network/firewall settings');
    } else if (error.message.includes('password authentication failed')) {
      console.error('\n💡 Authentication failed. Check your username and password in DATABASE_URL.');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('\n💡 Database does not exist. Create it first or check the database name in DATABASE_URL.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();
