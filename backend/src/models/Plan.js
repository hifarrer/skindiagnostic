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

  static async findByAppleProductId(appleProductId) {
    const result = await pool.query('SELECT * FROM plans WHERE apple_product_id = $1', [appleProductId]);
    return result.rows[0];
  }

  static async findByGoogleProductId(googleProductId) {
    const result = await pool.query('SELECT * FROM plans WHERE google_product_id = $1', [googleProductId]);
    return result.rows[0];
  }

  static async findFree() {
    const result = await pool.query('SELECT * FROM plans WHERE price = 0 AND is_active = true LIMIT 1');
    return result.rows[0];
  }
}

