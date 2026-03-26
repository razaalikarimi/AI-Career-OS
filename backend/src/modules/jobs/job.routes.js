const jobService = require('./job.service');
const { validate, jobSchemas } = require('../../middleware/validation');
const { authenticate } = require('../../middleware/auth');
const { Router } = require('express');

const router = Router();
router.use(authenticate);

router.get('/', validate(jobSchemas.search), async (req, res, next) => {
  try {
    const result = await jobService.searchJobs(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

router.get('/matches', async (req, res, next) => {
  try {
    const jobs = await jobService.getMatchingJobs(req.user.id);
    res.status(200).json({ success: true, data: jobs });
  } catch (e) {
    next(e);
  }
});

router.get('/applications', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const result = await jobService.getUserApplications(req.user.id, { page: +page, limit: +limit });
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const job = await jobService.getJobById(req.params.id);
    res.status(200).json({ success: true, data: job });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/apply', async (req, res, next) => {
  try {
    const result = await jobService.applyToJob(req.user.id, req.params.id, req.body);
    res.status(201).json({ success: true, message: 'Application submitted', data: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
