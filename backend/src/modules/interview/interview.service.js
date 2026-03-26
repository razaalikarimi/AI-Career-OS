const aiService = require('../ai/ai.service');
const { query, transaction } = require('../../config/database');
const { cache } = require('../../config/redis');
const { NotFoundError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const { v4: uuidv4 } = require('uuid');

class InterviewService {
  async createSession(userId, { jobRole, experienceLevel, interviewType }) {
    // Generate questions via AI
    const result = await aiService.call('interview-question/v1', {
      jobRole,
      experienceLevel,
      interviewType,
      count: 8,
    });

    const sessionId = uuidv4();

    await transaction(async (conn) => {
      await conn.execute(
        `INSERT INTO interview_sessions (id, user_id, job_role, experience_level, interview_type, status, total_questions)
         VALUES (?, ?, ?, ?, ?, 'in_progress', ?)`,
        [sessionId, userId, jobRole, experienceLevel, interviewType, result.questions.length]
      );
    });

    // Cache questions for this session
    await cache.set(`interview:${sessionId}:questions`, result.questions, 3600 * 4);

    logger.info({ message: 'Interview session created', sessionId, userId, jobRole });

    return {
      sessionId,
      jobRole,
      experienceLevel,
      interviewType,
      totalQuestions: result.questions.length,
      questions: result.questions,
    };
  }

  async submitAnswer(userId, sessionId, { questionId, answer }) {
    const questions = await cache.get(`interview:${sessionId}:questions`);
    if (!questions) throw new NotFoundError('Interview session');

    const question = questions.find((q) => q.id === questionId);
    if (!question) throw new NotFoundError('Question');

    // Get AI feedback
    const session = await this.getSession(sessionId, userId);

    const feedback = await aiService.call('interview-feedback/v1', {
      question: question.question,
      answer,
      jobRole: session.job_role,
      experienceLevel: session.experience_level,
    });

    // Save feedback to DB
    const feedbackId = uuidv4();
    await query(
      `INSERT INTO interview_feedback 
       (id, session_id, question_id, question_text, candidate_answer, score, feedback_data, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        feedbackId,
        sessionId,
        questionId,
        question.question,
        answer,
        feedback.score,
        JSON.stringify(feedback),
      ]
    );

    return { feedbackId, feedback };
  }

  async getSession(sessionId, userId) {
    const rows = await query(
      'SELECT * FROM interview_sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    );
    if (!rows[0]) throw new NotFoundError('Interview session');
    return rows[0];
  }

  async completeSession(sessionId, userId) {
    const feedbacks = await query(
      'SELECT score FROM interview_feedback WHERE session_id = ?',
      [sessionId]
    );

    const avgScore =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length
        : 0;

    await query(
      `UPDATE interview_sessions 
       SET status = 'completed', overall_score = ?, completed_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [avgScore.toFixed(2), sessionId, userId]
    );

    // Clear cache
    await cache.del(`interview:${sessionId}:questions`);

    return { sessionId, overallScore: avgScore };
  }

  async getUserSessions(userId, { page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows, count] = await Promise.all([
      query(
        `SELECT id, job_role, experience_level, interview_type, status, 
                overall_score, total_questions, created_at, completed_at
         FROM interview_sessions WHERE user_id = ?
         ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      ),
      query('SELECT COUNT(*) as total FROM interview_sessions WHERE user_id = ?', [userId]),
    ]);
    return { sessions: rows, total: count[0].total };
  }

  async getSessionFeedback(sessionId, userId) {
    await this.getSession(sessionId, userId); // Verify ownership
    const feedbacks = await query(
      `SELECT id, question_text, candidate_answer, score, feedback_data, created_at
       FROM interview_feedback WHERE session_id = ? ORDER BY created_at ASC`,
      [sessionId]
    );
    return feedbacks.map((f) => ({
      ...f,
      feedback_data:
        typeof f.feedback_data === 'string' ? JSON.parse(f.feedback_data) : f.feedback_data,
    }));
  }
}

module.exports = new InterviewService();
