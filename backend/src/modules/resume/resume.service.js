const resumeRepository = require('./resume.repository');
const aiService = require('../ai/ai.service');
const { resumeQueue } = require('../../jobs/queues');
const { cache } = require('../../config/redis');
const logger = require('../../utils/logger');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const path = require('path');

class ResumeService {
  async uploadResume(userId, file, { targetRole, targetIndustry } = {}) {
    if (!file) throw new ValidationError('No file uploaded');

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ValidationError('Invalid file type. Only PDF and Word documents are accepted.');
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ValidationError(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`);
    }

    // Construct file URL (S3 or local)
    const fileUrl = `${process.env.STORAGE_BASE_URL || '/uploads'}/${file.filename}`;

    const resume = await resumeRepository.create({
      userId,
      fileName: file.originalname,
      fileUrl,
      fileSize: file.size,
    });

    // Queue async processing
    await resumeQueue.add(
      'analyze-resume',
      {
        resumeId: resume.id,
        userId,
        fileUrl,
        filePath: file.path,
        targetRole,
        targetIndustry,
      },
      {
        priority: 2,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      }
    );

    // Invalidate user resume cache
    await cache.del(`resumes:${userId}`);

    logger.info({ message: 'Resume uploaded, queued for analysis', resumeId: resume.id, userId });
    return resume;
  }

  async getResumes(userId, pagination) {
    const cacheKey = `resumes:${userId}:${JSON.stringify(pagination)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const result = await resumeRepository.findByUserId(userId, pagination);
    await cache.set(cacheKey, result, 60); // 1 min cache
    return result;
  }

  async getResumeById(resumeId, userId) {
    const resume = await resumeRepository.findById(resumeId, userId);
    if (!resume) throw new NotFoundError('Resume');

    if (resume.extracted_data && typeof resume.extracted_data === 'string') {
      resume.extracted_data = JSON.parse(resume.extracted_data);
    }
    if (resume.skills_json && typeof resume.skills_json === 'string') {
      resume.skills_json = JSON.parse(resume.skills_json);
    }

    return resume;
  }

  async analyzeResume(resumeId, userId, { targetRole, targetIndustry } = {}) {
    const resume = await this.getResumeById(resumeId, userId);

    // Re-trigger analysis via queue
    await resumeQueue.add(
      'analyze-resume',
      {
        resumeId,
        userId,
        fileUrl: resume.file_url,
        filePath: null,
        targetRole: targetRole || resume.target_role,
        targetIndustry,
        reanalysis: true,
      },
      { priority: 1, attempts: 3 }
    );

    return { message: 'Analysis queued. Results will be available shortly.' };
  }

  async getSkillGapAnalysis(userId, targetRole) {
    const cacheKey = `skill-gap:${userId}:${targetRole}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const latestResume = await resumeRepository.getLatestAnalyzed(userId);
    if (!latestResume) throw new NotFoundError('Analyzed resume');

    const currentSkills = JSON.parse(latestResume.skills_json || '{}');

    const analysis = await aiService.call('skill-gap/v1', {
      currentSkills,
      targetRole,
      experienceLevel: 'mid',
    });

    await cache.set(cacheKey, analysis, 3600); // 1 hour cache
    return analysis;
  }

  async deleteResume(resumeId, userId) {
    const resume = await resumeRepository.findById(resumeId, userId);
    if (!resume) throw new NotFoundError('Resume');

    await resumeRepository.delete(resumeId, userId);
    await cache.del(`resumes:${userId}`);

    logger.info({ message: 'Resume deleted', resumeId, userId });
  }
}

module.exports = new ResumeService();
