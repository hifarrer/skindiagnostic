import pool from '../config/database.js';

export class Task {
  static async create(taskData) {
    const { user_id, task_type, task_id, status = 'pending', metadata = {} } = taskData;
    
    const result = await pool.query(
      `INSERT INTO tasks (user_id, task_type, task_id, status, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, task_type, task_id, status, JSON.stringify(metadata)]
    );
    return result.rows[0];
  }

  static async findByTaskId(taskId) {
    const result = await pool.query('SELECT * FROM tasks WHERE task_id = $1', [taskId]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateStatus(taskId, status, resultUrl = null, metadata = null) {
    const updates = { status };
    if (resultUrl) updates.result_url = resultUrl;
    if (metadata) updates.metadata = JSON.stringify(metadata);
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    });

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId);

    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE task_id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async findByUserId(userId, taskType = null) {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    
    if (taskType) {
      query += ' AND task_type = $2';
      params.push(taskType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return result.rows;
  }
}

