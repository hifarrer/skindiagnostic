import pool, { queryWithRetry } from '../config/database.js';

export class User {
  static async findByEmail(email) {
    const result = await queryWithRetry('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findByOAuth(provider, oauthId) {
    const result = await queryWithRetry(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [provider, oauthId]
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await queryWithRetry('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(userData) {
    const {
      email,
      name,
      avatar_url,
      oauth_provider,
      oauth_id,
      subscription_plan_id = 1,
      subscription_status = 'inactive',
    } = userData;

    const result = await queryWithRetry(
      `INSERT INTO users (email, name, avatar_url, oauth_provider, oauth_id, subscription_plan_id, subscription_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [email, name, avatar_url, oauth_provider, oauth_id, subscription_plan_id, subscription_status]
    );
    return result.rows[0];
  }

  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await queryWithRetry(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async updateSubscription(userId, planId, status, stripeCustomerId = null) {
    const updates = {
      subscription_plan_id: planId,
      subscription_status: status,
    };
    if (stripeCustomerId) {
      updates.stripe_customer_id = stripeCustomerId;
    }
    return this.update(userId, updates);
  }

  static async updateSubscriptionFull(userId, {
    planId,
    status,
    source,
    expiresAt,
    cancelAtPeriodEnd,
    stripeCustomerId,
    revenuecatAppUserId,
  }) {
    const updates = {};
    if (planId !== undefined) updates.subscription_plan_id = planId;
    if (status !== undefined) updates.subscription_status = status;
    if (source !== undefined) updates.subscription_source = source;
    if (expiresAt !== undefined) updates.subscription_expires_at = expiresAt;
    if (cancelAtPeriodEnd !== undefined) updates.subscription_cancel_at_period_end = cancelAtPeriodEnd;
    if (stripeCustomerId !== undefined) updates.stripe_customer_id = stripeCustomerId;
    if (revenuecatAppUserId !== undefined) updates.revenuecat_app_user_id = revenuecatAppUserId;
    return this.update(userId, updates);
  }

  static async findByStripeCustomerId(stripeCustomerId) {
    const result = await queryWithRetry(
      'SELECT * FROM users WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );
    return result.rows[0];
  }

  static async findByRevenueCatId(revenuecatAppUserId) {
    const result = await queryWithRetry(
      'SELECT * FROM users WHERE revenuecat_app_user_id = $1',
      [revenuecatAppUserId]
    );
    return result.rows[0];
  }
}

