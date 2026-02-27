import { queryWithRetry } from '../config/database.js';

export class Admin {
  static async findByUsername(username) {
    const result = await queryWithRetry(
      'SELECT * FROM admin_users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await queryWithRetry(
      'SELECT * FROM admin_users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updatePassword(id, newHashedPassword) {
    const result = await queryWithRetry(
      `UPDATE admin_users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, updated_at`,
      [newHashedPassword, id]
    );
    return result.rows[0];
  }
}
