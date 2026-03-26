const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const resumeController = require('./resume.controller');
const { authenticate } = require('../../middleware/auth');
const { validate, resumeSchemas } = require('../../middleware/validation');
const { aiRateLimiter } = require('../../middleware/security');

const router = Router();

// Multer config for local storage (swap to S3 multer-s3 in production)
const storage = multer.diskStorage({
  destination: 'uploads/resumes/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

router.use(authenticate);

/**
 * @swagger
 * /resumes:
 *   post:
 *     summary: Upload a resume for analysis
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *               targetRole:
 *                 type: string
 *               targetIndustry:
 *                 type: string
 */
router.post('/', upload.single('resume'), resumeController.uploadResume);

/**
 * @swagger
 * /resumes:
 *   get:
 *     summary: Get all resumes for current user
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', resumeController.getResumes);

/**
 * @swagger
 * /resumes/skill-gap:
 *   get:
 *     summary: Get skill gap analysis vs target role
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 */
router.get('/skill-gap', aiRateLimiter, resumeController.getSkillGapAnalysis);

/**
 * @swagger
 * /resumes/{id}:
 *   get:
 *     summary: Get resume with full analysis
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', resumeController.getResumeById);

/**
 * @swagger
 * /resumes/{id}/analyze:
 *   post:
 *     summary: Re-analyze an existing resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/:id/analyze',
  aiRateLimiter,
  validate(resumeSchemas.analyze),
  resumeController.analyzeResume
);

/**
 * @swagger
 * /resumes/{id}:
 *   delete:
 *     summary: Delete a resume
 *     tags: [Resume]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', resumeController.deleteResume);

module.exports = router;
