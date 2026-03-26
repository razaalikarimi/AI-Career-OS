const { query, transaction } = require('../../config/database');

class ResumeRepository {
  async findByUserId(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      query(
        `SELECT id, file_name, file_url, file_size, status, 
                ats_score, target_role, target_industry, created_at, updated_at
         FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      query('SELECT COUNT(*) as total FROM resumes WHERE user_id = ?', [userId]),
    ]);
    return { resumes: rows, total: count[0].total };
  }

  async findById(id, userId) {
    const rows = await query(
      `SELECT r.*, erd.raw_text, erd.extracted_data, erd.skills_json, erd.experience_json
       FROM resumes r
       LEFT JOIN extracted_resume_data erd ON erd.resume_id = r.id
       WHERE r.id = ? AND r.user_id = ?`,
      [id, userId]
    );
    return rows[0] || null;
  }

  async create({ userId, fileName, fileUrl, fileSize }) {
    return transaction(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO resumes (id, user_id, file_name, file_url, file_size, status)
         VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
        [userId, fileName, fileUrl, fileSize]
      );
      const [rows] = await conn.execute(
        'SELECT * FROM resumes WHERE file_url = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1',
        [fileUrl, userId]
      );
      return rows[0];
    });
  }

  async updateStatus(id, status, analysisData = null) {
    const updates = ['status = ?', 'updated_at = NOW()'];
    const params = [status];

    if (analysisData?.atsScore !== undefined) {
      updates.push('ats_score = ?');
      params.push(analysisData.atsScore);
    }

    params.push(id);
    await query(`UPDATE resumes SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  async saveExtractedData(resumeId, { rawText, extractedData, skillsJson, experienceJson }) {
    await query(
      `INSERT INTO extracted_resume_data (id, resume_id, raw_text, extracted_data, skills_json, experience_json)
       VALUES (UUID(), ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         raw_text = VALUES(raw_text),
         extracted_data = VALUES(extracted_data),
         skills_json = VALUES(skills_json),
         experience_json = VALUES(experience_json),
         updated_at = NOW()`,
      [
        resumeId,
        rawText,
        JSON.stringify(extractedData),
        JSON.stringify(skillsJson),
        JSON.stringify(experienceJson),
      ]
    );
  }

  async getLatestAnalyzed(userId) {
    const rows = await query(
      `SELECT r.id, r.ats_score, r.target_role, erd.extracted_data, erd.skills_json
       FROM resumes r
       LEFT JOIN extracted_resume_data erd ON erd.resume_id = r.id
       WHERE r.user_id = ? AND r.status = 'analyzed'
       ORDER BY r.updated_at DESC LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  async delete(id, userId) {
    await query('DELETE FROM resumes WHERE id = ? AND user_id = ?', [id, userId]);
  }
}

module.exports = new ResumeRepository();
