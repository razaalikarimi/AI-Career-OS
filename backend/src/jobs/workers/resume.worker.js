const { Worker } = require('bullmq');
const fs = require('fs').promises;
const path = require('path');
const { getRedisClient } = require('../config/redis');
const resumeRepository = require('../modules/resume/resume.repository');
const aiService = require('../modules/ai/ai.service');
const logger = require('../utils/logger');
const { emailQueue, notificationQueue } = require('./queues');

/**
 * Naive text extraction (replace with pdf-parse / mammoth in production)
 */
async function extractTextFromFile(filePath, mimeType) {
  try {
    // In production: use pdf-parse for PDF, mammoth for DOCX
    const content = await fs.readFile(filePath, 'utf8').catch(() => null);
    if (content) return content;

    // Placeholder for binary files
    return `[Text extracted from ${path.basename(filePath)}]`;
  } catch {
    return '[Text extraction failed]';
  }
}

const resumeWorker = new Worker(
  'resume-processing',
  async (job) => {
    const { resumeId, userId, filePath, fileUrl, targetRole, targetIndustry } = job.data;

    logger.info({ message: 'Processing resume job', jobId: job.id, resumeId });

    try {
      // Step 1: Update status to processing
      await resumeRepository.updateStatus(resumeId, 'processing');
      await job.updateProgress(10);

      // Step 2: Extract text
      const resumeText = filePath
        ? await extractTextFromFile(filePath)
        : 'Resume text extraction from URL - implement PDF fetch here';
      await job.updateProgress(30);

      // Step 3: AI Analysis
      const analysis = await aiService.call('resume-analysis/v1', {
        resumeText,
        targetRole,
        targetIndustry,
      });
      await job.updateProgress(70);

      // Step 4: Save extracted data
      await resumeRepository.saveExtractedData(resumeId, {
        rawText: resumeText,
        extractedData: analysis,
        skillsJson: analysis.extractedSkills || {},
        experienceJson: analysis.experience || {},
      });

      // Step 5: Update resume status with ATS score
      await resumeRepository.updateStatus(resumeId, 'analyzed', { atsScore: analysis.atsScore });
      await job.updateProgress(90);

      // Step 6: Queue notification to user
      await notificationQueue.add('resume-analyzed', {
        userId,
        type: 'RESUME_ANALYSIS_COMPLETE',
        data: {
          resumeId,
          atsScore: analysis.atsScore,
          message: `Your resume analysis is complete! ATS Score: ${analysis.atsScore}/100`,
        },
      });

      await job.updateProgress(100);
      logger.info({ message: 'Resume processing complete', resumeId, atsScore: analysis.atsScore });

      return { success: true, resumeId, atsScore: analysis.atsScore };
    } catch (error) {
      logger.error({ message: 'Resume processing failed', resumeId, error: error.message });
      await resumeRepository.updateStatus(resumeId, 'failed');
      throw error; // BullMQ will handle retry
    }
  },
  {
    connection: getRedisClient,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY) || 3,
    limiter: { max: 5, duration: 60000 }, // 5 jobs per minute
  }
);

resumeWorker.on('completed', (job, result) => {
  logger.info({ message: 'Resume job completed', jobId: job.id, result });
});

resumeWorker.on('failed', (job, err) => {
  logger.error({ message: 'Resume job failed', jobId: job.id, error: err.message });
});

resumeWorker.on('stalled', (jobId) => {
  logger.warn({ message: 'Resume job stalled', jobId });
});

module.exports = resumeWorker;
