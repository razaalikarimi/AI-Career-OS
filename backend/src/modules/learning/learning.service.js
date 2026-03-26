const aiService = require('../ai/ai.service');
const { query, transaction } = require('../../config/database');
const { cache } = require('../../config/redis');
const { NotFoundError } = require('../../utils/errors');
const { v4: uuidv4 } = require('uuid');
const logger = require('../../utils/logger');

class LearningService {
  async generateStudyPlan(userId, { title, skillGaps, targetRole, durationWeeks }) {
    const roadmap = await aiService.call('roadmap-generation/v1', {
      targetRole,
      skillGaps,
      durationWeeks,
      hoursPerWeek: 10,
    });

    return transaction(async (conn) => {
      const planId = uuidv4();
      await conn.execute(
        `INSERT INTO study_plans (id, user_id, title, target_role, skill_gaps, roadmap_data, duration_weeks, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [
          planId,
          userId,
          title,
          targetRole,
          JSON.stringify(skillGaps),
          JSON.stringify(roadmap),
          durationWeeks,
        ]
      );

      // Create progress tracking rows for each phase
      if (roadmap.phases) {
        for (const phase of roadmap.phases) {
          await conn.execute(
            `INSERT INTO learning_progress (id, study_plan_id, user_id, phase_number, phase_title, status)
             VALUES (UUID(), ?, ?, ?, ?, 'not_started')`,
            [planId, userId, phase.phase, phase.title]
          );
        }
      }

      logger.info({ message: 'Study plan generated', userId, planId, targetRole });
      return { planId, title, targetRole, roadmap, durationWeeks };
    });
  }

  async getStudyPlans(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      query(
        `SELECT id, title, target_role, duration_weeks, status, created_at, updated_at
         FROM study_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      query('SELECT COUNT(*) as total FROM study_plans WHERE user_id = ?', [userId]),
    ]);
    return { plans: rows, total: count[0].total };
  }

  async getStudyPlanById(planId, userId) {
    const rows = await query(
      `SELECT sp.*, 
              JSON_ARRAYAGG(
                JSON_OBJECT('phase', lp.phase_number, 'title', lp.phase_title, 
                            'status', lp.status, 'completedAt', lp.completed_at)
              ) as progress
       FROM study_plans sp
       LEFT JOIN learning_progress lp ON lp.study_plan_id = sp.id
       WHERE sp.id = ? AND sp.user_id = ?
       GROUP BY sp.id`,
      [planId, userId]
    );

    if (!rows[0]) throw new NotFoundError('Study plan');

    const plan = rows[0];
    plan.roadmap_data =
      typeof plan.roadmap_data === 'string' ? JSON.parse(plan.roadmap_data) : plan.roadmap_data;
    plan.skill_gaps =
      typeof plan.skill_gaps === 'string' ? JSON.parse(plan.skill_gaps) : plan.skill_gaps;

    return plan;
  }

  async updateProgress(planId, userId, phaseNumber, status) {
    const plan = await this.getStudyPlanById(planId, userId);

    await query(
      `UPDATE learning_progress 
       SET status = ?, completed_at = IF(? = 'completed', NOW(), NULL)
       WHERE study_plan_id = ? AND user_id = ? AND phase_number = ?`,
      [status, status, planId, userId, phaseNumber]
    );

    // Check if all phases complete
    const remaining = await query(
      `SELECT COUNT(*) as count FROM learning_progress 
       WHERE study_plan_id = ? AND status != 'completed'`,
      [planId]
    );

    if (remaining[0].count === 0) {
      await query(
        "UPDATE study_plans SET status = 'completed', updated_at = NOW() WHERE id = ?",
        [planId]
      );
    }

    await cache.del(`learning:${userId}:analytics`);
  }

  async getAnalytics(userId) {
    const cacheKey = `learning:${userId}:analytics`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const [planStats, progressStats, interviewStats] = await Promise.all([
      query(
        `SELECT status, COUNT(*) as count FROM study_plans WHERE user_id = ? GROUP BY status`,
        [userId]
      ),
      query(
        `SELECT status, COUNT(*) as count FROM learning_progress WHERE user_id = ? GROUP BY status`,
        [userId]
      ),
      query(
        `SELECT AVG(overall_score) as avg_score, COUNT(*) as total
         FROM interview_sessions WHERE user_id = ? AND status = 'completed'`,
        [userId]
      ),
    ]);

    const analytics = {
      studyPlans: planStats.reduce((acc, r) => ({ ...acc, [r.status]: r.count }), {}),
      learningProgress: progressStats.reduce((acc, r) => ({ ...acc, [r.status]: r.count }), {}),
      interview: interviewStats[0] || { avg_score: 0, total: 0 },
    };

    await cache.set(cacheKey, analytics, 300);
    return analytics;
  }
}

module.exports = new LearningService();
