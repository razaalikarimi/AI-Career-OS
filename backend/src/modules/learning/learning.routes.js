const learningService = require('./learning.service');
const { authenticate } = require('../../middleware/auth');
const { validate, studyPlanSchemas } = require('../../middleware/validation');
const { aiRateLimiter } = require('../../middleware/security');
const { Router } = require('express');
const Joi = require('joi');

const router = Router();
router.use(authenticate);

// Generate study plan
router.post(
  '/plans',
  aiRateLimiter,
  validate(studyPlanSchemas.create),
  async (req, res, next) => {
    try {
      const plan = await learningService.generateStudyPlan(req.user.id, req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (e) {
      next(e);
    }
  }
);

// List study plans
router.get('/plans', async (req, res, next) => {
  try {
    const result = await learningService.getStudyPlans(req.user.id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

// Get study plan with roadmap
router.get('/plans/:planId', async (req, res, next) => {
  try {
    const plan = await learningService.getStudyPlanById(req.params.planId, req.user.id);
    res.status(200).json({ success: true, data: plan });
  } catch (e) {
    next(e);
  }
});

// Update phase progress
router.patch('/plans/:planId/phases/:phaseNumber', async (req, res, next) => {
  try {
    const { status } = req.body;
    await learningService.updateProgress(
      req.params.planId,
      req.user.id,
      parseInt(req.params.phaseNumber),
      status
    );
    res.status(200).json({ success: true, message: 'Progress updated' });
  } catch (e) {
    next(e);
  }
});

// Get learning analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const analytics = await learningService.getAnalytics(req.user.id);
    res.status(200).json({ success: true, data: analytics });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
