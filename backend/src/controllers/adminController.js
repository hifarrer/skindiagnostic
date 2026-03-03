import bcrypt from 'bcryptjs';
import pool, { queryWithRetry } from '../config/database.js';
import { Admin } from '../models/Admin.js';
import { generateAdminToken } from '../middleware/adminAuth.js';

// ── Auth ────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateAdminToken(admin.id);
    res.json({ token, admin: { id: admin.id, username: admin.username } });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  res.json({ admin: { id: req.admin.id, username: req.admin.username } });
};

// ── Users ───────────────────────────────────────────────────────────────

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let where = '';
    const params = [];
    if (search) {
      where = `WHERE u.email ILIKE $1 OR u.name ILIKE $1`;
      params.push(`%${search}%`);
    }

    const countResult = await queryWithRetry(
      `SELECT COUNT(*) FROM users u ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const paramOffset = params.length;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await queryWithRetry(
      `SELECT u.*, p.name as plan_name
       FROM users u
       LEFT JOIN plans p ON u.subscription_plan_id = p.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${paramOffset + 1} OFFSET $${paramOffset + 2}`,
      params
    );

    res.json({ users: result.rows, total, page: parseInt(page, 10), limit: parseInt(limit, 10) });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUser = async (req, res) => {
  try {
    const result = await queryWithRetry(
      `SELECT u.*, p.name as plan_name
       FROM users u
       LEFT JOIN plans p ON u.subscription_plan_id = p.id
       WHERE u.id = $1`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, subscription_plan_id, subscription_status } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (subscription_plan_id !== undefined) { fields.push(`subscription_plan_id = $${idx++}`); values.push(subscription_plan_id); }
    if (subscription_status !== undefined) { fields.push(`subscription_status = $${idx++}`); values.push(subscription_status); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await queryWithRetry(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const result = await queryWithRetry(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ── Plans ───────────────────────────────────────────────────────────────

export const getPlans = async (_req, res) => {
  try {
    const result = await queryWithRetry('SELECT * FROM plans ORDER BY price ASC');
    res.json({ plans: result.rows });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { name, description, price, features, stripe_price_id, is_active = true } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }

    const result = await queryWithRetry(
      `INSERT INTO plans (name, description, price, features, stripe_price_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description || '', price, JSON.stringify(features || []), stripe_price_id || null, is_active]
    );
    res.status(201).json({ plan: result.rows[0] });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { name, description, price, features, stripe_price_id, is_active } = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (price !== undefined) { fields.push(`price = $${idx++}`); values.push(price); }
    if (features !== undefined) { fields.push(`features = $${idx++}`); values.push(JSON.stringify(features)); }
    if (stripe_price_id !== undefined) { fields.push(`stripe_price_id = $${idx++}`); values.push(stripe_price_id); }
    if (is_active !== undefined) { fields.push(`is_active = $${idx++}`); values.push(is_active); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.params.id);

    const result = await queryWithRetry(
      `UPDATE plans SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ plan: result.rows[0] });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const result = await queryWithRetry(
      `UPDATE plans SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ plan: result.rows[0], message: 'Plan deactivated' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ error: 'Failed to deactivate plan' });
  }
};

/** Permanently delete a plan. Users on this plan are set to subscription_plan_id NULL. */
export const deletePlanPermanent = async (req, res) => {
  try {
    const planId = req.params.id;
    const plan = await queryWithRetry('SELECT id FROM plans WHERE id = $1', [planId]);
    if (!plan.rows[0]) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    await queryWithRetry('UPDATE users SET subscription_plan_id = NULL WHERE subscription_plan_id = $1', [planId]);
    await queryWithRetry('DELETE FROM plans WHERE id = $1', [planId]);
    res.json({ message: 'Plan deleted permanently' });
  } catch (error) {
    console.error('Delete plan permanent error:', error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
};

// ── Statistics ──────────────────────────────────────────────────────────

export const getOverview = async (_req, res) => {
  try {
    const [usersR, activeSubsR, revenueR, tasksR] = await Promise.all([
      queryWithRetry('SELECT COUNT(*) FROM users'),
      queryWithRetry(`SELECT COUNT(*) FROM users WHERE subscription_status = 'active'`),
      queryWithRetry(
        `SELECT COALESCE(SUM(p.price), 0) as revenue
         FROM users u
         JOIN plans p ON u.subscription_plan_id = p.id
         WHERE u.subscription_status = 'active'`
      ),
      queryWithRetry('SELECT COUNT(*) FROM tasks'),
    ]);

    res.json({
      totalUsers: parseInt(usersR.rows[0].count, 10),
      activeSubscriptions: parseInt(activeSubsR.rows[0].count, 10),
      monthlyRevenue: parseFloat(revenueR.rows[0].revenue),
      totalTasks: parseInt(tasksR.rows[0].count, 10),
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
};

export const getUsersOverTime = async (req, res) => {
  try {
    const { period = 'day', days = 30 } = req.query;
    const trunc = period === 'month' ? 'month' : period === 'week' ? 'week' : 'day';

    const result = await queryWithRetry(
      `SELECT DATE_TRUNC($1, created_at) as date, COUNT(*) as count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '${parseInt(days, 10)} days'
       GROUP BY DATE_TRUNC($1, created_at)
       ORDER BY date ASC`,
      [trunc]
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Get users over time error:', error);
    res.status(500).json({ error: 'Failed to fetch user growth data' });
  }
};

export const getTasksOverTime = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await queryWithRetry(
      `SELECT DATE_TRUNC('day', created_at) as date, task_type, COUNT(*) as count
       FROM tasks
       WHERE created_at >= NOW() - INTERVAL '${parseInt(days, 10)} days'
       GROUP BY DATE_TRUNC('day', created_at), task_type
       ORDER BY date ASC`,
      []
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Get tasks over time error:', error);
    res.status(500).json({ error: 'Failed to fetch task activity data' });
  }
};

export const getSubscriptionStats = async (_req, res) => {
  try {
    const result = await queryWithRetry(
      `SELECT p.name, p.id as plan_id, COUNT(u.id) as count
       FROM plans p
       LEFT JOIN users u ON u.subscription_plan_id = p.id
       GROUP BY p.id, p.name
       ORDER BY p.price ASC`
    );
    res.json({ data: result.rows });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription stats' });
  }
};

// ── Settings ────────────────────────────────────────────────────────────

export const getSettings = async (_req, res) => {
  try {
    const result = await queryWithRetry('SELECT * FROM site_settings ORDER BY key ASC');
    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ error: 'Settings array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const { key, value } of settings) {
        await client.query(
          `INSERT INTO site_settings (key, value, updated_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP`,
          [key, JSON.stringify(value)]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const result = await queryWithRetry('SELECT * FROM site_settings ORDER BY key ASC');
    res.json({ settings: result.rows });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const admin = await Admin.findById(req.admin.id);
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await Admin.updatePassword(admin.id, hash);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
