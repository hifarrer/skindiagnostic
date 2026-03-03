import pool from './database.js';
import bcrypt from 'bcryptjs';

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        age INTEGER,
        avatar_url TEXT,
        oauth_provider VARCHAR(50),
        oauth_id VARCHAR(255),
        subscription_plan_id INTEGER,
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        stripe_customer_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(oauth_provider, oauth_id)
      )
    `);

    // Add age column if it doesn't exist (for existing databases)
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'age'
        ) THEN
          ALTER TABLE users ADD COLUMN age INTEGER;
        END IF;
      END $$;
    `);

    // Plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        features JSONB DEFAULT '[]',
        stripe_price_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Site settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tasks table (for async API calls)
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_type VARCHAR(50) NOT NULL,
        task_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        result_url TEXT,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Skin analysis results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS skin_analysis_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        scores JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Admin users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add foreign key for subscription_plan_id
    await client.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'users_subscription_plan_id_fkey'
        ) THEN
          ALTER TABLE users 
          ADD CONSTRAINT users_subscription_plan_id_fkey 
          FOREIGN KEY (subscription_plan_id) REFERENCES plans(id);
        END IF;
      END $$;
    `);

    // Deduplicate plans: keep one row per (name, price) with the smallest id; point users to it; remove duplicates
    await client.query(`
      WITH kept AS (
        SELECT min(id) AS kept_id, name, price FROM plans GROUP BY name, price
      )
      UPDATE users u
      SET subscription_plan_id = k.kept_id
      FROM plans p
      JOIN kept k ON k.name = p.name AND k.price = p.price
      WHERE p.id = u.subscription_plan_id AND u.subscription_plan_id <> k.kept_id
    `);
    await client.query(`
      WITH kept AS (
        SELECT min(id) AS id FROM plans GROUP BY name, price
      )
      DELETE FROM plans WHERE id NOT IN (SELECT id FROM kept)
    `);

    // Add unique constraint so default plans are not re-inserted on future migrations
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'plans' AND constraint_name = 'plans_name_price_key'
        ) THEN
          ALTER TABLE plans ADD CONSTRAINT plans_name_price_key UNIQUE (name, price);
        END IF;
      END $$
    `);

    // Insert default plans (only if not already present)
    await client.query(`
      INSERT INTO plans (name, description, price, features, is_active)
      VALUES 
        ('Free', 'Basic features', 0.00, '["skin_analysis_limited"]', true),
        ('Pro', 'Full access to all features', 29.99, '["skin_analysis", "makeup_vto", "look_vto", "unlimited_analyses"]', true),
        ('Premium', 'Everything in Pro plus priority support', 49.99, '["skin_analysis", "makeup_vto", "look_vto", "unlimited_analyses", "priority_support", "api_access"]', true)
      ON CONFLICT (name, price) DO NOTHING
    `);

    // Seed default admin user (admin / admin123)
    const existingAdmin = await client.query(
      `SELECT id FROM admin_users WHERE username = 'admin'`
    );
    if (existingAdmin.rows.length === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await client.query(
        `INSERT INTO admin_users (username, password_hash) VALUES ('admin', $1)`,
        [hash]
      );
    }

    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

createTables()
  .then(() => {
    console.log('Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    console.error('\n💡 Troubleshooting:');
    if (error.code === 'ECONNREFUSED') {
      console.error('1. Run: npm run test-db to test your connection');
      console.error('2. Verify DATABASE_URL in backend/.env');
      console.error('3. For external databases, add: DATABASE_SSL=true');
      console.error('4. Check if your IP is whitelisted');
    }
    process.exit(1);
  });

