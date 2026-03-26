const { query, transaction } = require('../../config/database');

class JobRepository {
  async findAll({ keyword, location, experienceLevel, jobType, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = ['j.is_active = 1'];

    if (keyword) {
      conditions.push('(j.title LIKE ? OR j.description LIKE ? OR j.company_name LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (location) {
      conditions.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }
    if (experienceLevel) {
      conditions.push('j.experience_level = ?');
      params.push(experienceLevel);
    }
    if (jobType) {
      conditions.push('j.job_type = ?');
      params.push(jobType);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows, countRows] = await Promise.all([
      query(
        `SELECT j.id, j.title, j.company_name, j.location, j.job_type, j.experience_level,
                j.salary_range, j.description, j.skills_required, j.posted_at, j.expires_at
         FROM jobs j ${where}
         ORDER BY j.posted_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      query(`SELECT COUNT(*) as total FROM jobs j ${where}`, params),
    ]);

    return { jobs: rows, total: countRows[0].total };
  }

  async findById(id) {
    const rows = await query(
      `SELECT j.*, 
              (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) as applicant_count
       FROM jobs j WHERE j.id = ? AND j.is_active = 1`,
      [id]
    );
    return rows[0] || null;
  }

  async getMatchingJobs(userId, userSkills, limit = 10) {
    // Skill-based matching using MATCH score simulation via LIKE queries
    // In production, use a dedicated search engine (Elasticsearch/MeiliSearch)
    const skillConditions = userSkills
      .slice(0, 5)
      .map(() => 'j.skills_required LIKE ?')
      .join(' OR ');

    const params = userSkills.slice(0, 5).map((s) => `%${s}%`);

    const rows = await query(
      `SELECT j.id, j.title, j.company_name, j.location, j.job_type,
              j.experience_level, j.salary_range, j.skills_required,
              (
                ${userSkills
                  .slice(0, 5)
                  .map(() => "IF(j.skills_required LIKE ?, 20, 0)")
                  .join(' + ')}
              ) as match_score
       FROM jobs j
       WHERE j.is_active = 1 AND (${skillConditions || '1=1'})
       ORDER BY match_score DESC, j.posted_at DESC
       LIMIT ?`,
      [...params, ...params, limit]
    );

    return rows;
  }

  async createApplication(data) {
    return transaction(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO applications (id, user_id, job_id, status, cover_letter, resume_id)
         VALUES (UUID(), ?, ?, 'applied', ?, ?)`,
        [data.userId, data.jobId, data.coverLetter || null, data.resumeId || null]
      );
      const [rows] = await conn.execute(
        'SELECT * FROM applications WHERE user_id = ? AND job_id = ? ORDER BY created_at DESC LIMIT 1',
        [data.userId, data.jobId]
      );
      return rows[0];
    });
  }

  async getUserApplications(userId, { page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      query(
        `SELECT a.id, a.status, a.created_at, a.updated_at,
                j.title, j.company_name, j.location, j.job_type
         FROM applications a
         JOIN jobs j ON j.id = a.job_id
         WHERE a.user_id = ?
         ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      query('SELECT COUNT(*) as total FROM applications WHERE user_id = ?', [userId]),
    ]);
    return { applications: rows, total: count[0].total };
  }

  async hasApplied(userId, jobId) {
    const rows = await query(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [userId, jobId]
    );
    return rows.length > 0;
  }
}

module.exports = new JobRepository();
