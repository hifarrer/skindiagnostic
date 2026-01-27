import pool from '../config/database.js';

export class Plan {
  static async findAll(activeOnly = true) {
    const query = activeOnly
      ? 'SELECT * FROM plans WHERE is_active = true ORDER BY price ASC'
      : 'SELECT * FROM plans ORDER BY price ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM plans WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByStripePriceId(stripePriceId) {
    const result = await pool.query('SELECT * FROM plans WHERE stripe_price_id = $1', [stripePriceId]);
    return result.rows[0];
  }
}

