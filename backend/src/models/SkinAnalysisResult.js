import pool from '../config/database.js';

export class SkinAnalysisResult {
  static async create(resultData) {
    const { user_id, task_id, image_url, scores } = resultData;
    
    const result = await pool.query(
      `INSERT INTO skin_analysis_results (user_id, task_id, image_url, scores)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user_id, task_id, image_url, JSON.stringify(scores)]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query(
      `SELECT sar.*, t.created_at as task_created_at
       FROM skin_analysis_results sar
       JOIN tasks t ON sar.task_id = t.id
       WHERE sar.user_id = $1
       ORDER BY sar.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT sar.*, t.created_at as task_created_at
       FROM skin_analysis_results sar
       JOIN tasks t ON sar.task_id = t.id
       WHERE sar.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByTaskId(taskId) {
    const result = await pool.query(
      `SELECT * FROM skin_analysis_results WHERE task_id = $1`,
      [taskId]
    );
    return result.rows[0];
  }
}

