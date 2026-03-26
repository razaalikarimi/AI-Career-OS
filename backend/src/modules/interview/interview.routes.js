const interviewService = require('./interview.service');
const { authenticate } = require('../../middleware/auth');
const { validate, interviewSchemas } = require('../../middleware/validation');
const { aiRateLimiter } = require('../../middleware/security');
const { Router } = require('express');

const router = Router();
router.use(authenticate);

// Create session
router.post(
  '/sessions',
  aiRateLimiter,
  validate(interviewSchemas.create),
  async (req, res, next) => {
    try {
      const session = await interviewService.createSession(req.user.id, req.body);
      res.status(201).json({ success: true, data: session });
    } catch (e) {
      next(e);
    }
  }
);

// Get all sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const result = await interviewService.getUserSessions(req.user.id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

// Get session detail
router.get('/sessions/:sessionId', async (req, res, next) => {
  try {
    const session = await interviewService.getSession(req.params.sessionId, req.user.id);
    res.status(200).json({ success: true, data: session });
  } catch (e) {
    next(e);
  }
});

// Submit answer
router.post(
  '/sessions/:sessionId/answers',
  aiRateLimiter,
  validate(interviewSchemas.submitAnswer),
  async (req, res, next) => {
    try {
      const result = await interviewService.submitAnswer(req.user.id, req.params.sessionId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

// Complete session
router.post('/sessions/:sessionId/complete', async (req, res, next) => {
  try {
    const result = await interviewService.completeSession(req.params.sessionId, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

// Get session feedback report
router.get('/sessions/:sessionId/feedback', async (req, res, next) => {
  try {
    const feedbacks = await interviewService.getSessionFeedback(req.params.sessionId, req.user.id);
    res.status(200).json({ success: true, data: feedbacks });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
