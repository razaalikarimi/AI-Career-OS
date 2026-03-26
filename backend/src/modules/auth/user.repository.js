const { query, transaction } = require('../../config/database');

class UserRepository {
  async findById(id) {
    const rows = await query(
      `SELECT id, email, first_name, last_name, role, avatar_url, is_active, 
              is_email_verified, last_login_at, created_at, updated_at
       FROM users WHERE id = ? AND is_active = 1`,
      [id]
    );
    return rows[0] || null;
  }

  async findByEmail(email) {
    const rows = await query(
      `SELECT id, email, first_name, last_name, role, password_hash, is_active,
              is_email_verified, refresh_token_hash, last_login_at, created_at
       FROM users WHERE email = ?`,
      [email]
    );
    return rows[0] || null;
  }

  async create({ firstName, lastName, email, passwordHash, role = 'user' }) {
    return transaction(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO users (id, email, first_name, last_name, password_hash, role)
         VALUES (UUID(), ?, ?, ?, ?, ?)`,
        [email, firstName, lastName, passwordHash, role]
      );
      const [rows] = await conn.execute(
        'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    });
  }

  async updateLastLogin(id) {
    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id]);
  }

  async updateRefreshToken(id, tokenHash) {
    await query('UPDATE users SET refresh_token_hash = ? WHERE id = ?', [tokenHash, id]);
  }

  async clearRefreshToken(id) {
    await query('UPDATE users SET refresh_token_hash = NULL WHERE id = ?', [id]);
  }

  async updateProfile(id, { firstName, lastName, avatarUrl }) {
    await query(
      `UPDATE users SET first_name = COALESCE(?, first_name),
                        last_name = COALESCE(?, last_name),
                        avatar_url = COALESCE(?, avatar_url),
                        updated_at = NOW()
       WHERE id = ?`,
      [firstName, lastName, avatarUrl, id]
    );
    return this.findById(id);
  }

  async updatePassword(id, passwordHash) {
    await query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [passwordHash, id]
    );
  }

  async verifyEmail(id) {
    await query(
      'UPDATE users SET is_email_verified = 1, updated_at = NOW() WHERE id = ?',
      [id]
    );
  }

  async findAll({ page = 1, limit = 20, role } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    let where = 'WHERE is_active = 1';
    if (role) {
      where += ' AND role = ?';
      params.push(role);
    }
    const [rows, countRows] = await Promise.all([
      query(
        `SELECT id, email, first_name, last_name, role, is_email_verified, created_at
         FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) as total FROM users ${where}`, params),
    ]);
    return { users: rows, total: countRows[0].total };
  }
}

module.exports = new UserRepository();
