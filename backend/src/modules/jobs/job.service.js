const jobRepository = require('./job.repository');
const resumeRepository = require('../resume/resume.repository');
const { cache } = require('../../config/redis');
const { ConflictError, NotFoundError } = require('../../utils/errors');
const logger = require('../../utils/logger');

class JobService {
  async searchJobs(filters) {
    const cacheKey = `jobs:search:${JSON.stringify(filters)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const result = await jobRepository.findAll(filters);
    // Parse skills_required JSON where applicable
    result.jobs = result.jobs.map((job) => ({
      ...job,
      skills_required: this._parseJSON(job.skills_required, []),
    }));

    await cache.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  async getJobById(jobId) {
    const cacheKey = `job:${jobId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const job = await jobRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job');

    job.skills_required = this._parseJSON(job.skills_required, []);
    await cache.set(cacheKey, job, 600); // 10 min cache
    return job;
  }

  async getMatchingJobs(userId) {
    const cacheKey = `jobs:match:${userId}`;
    const cached = await cache.get(cacheKey);
    if (cached) return cached;

    const latestResume = await resumeRepository.getLatestAnalyzed(userId);
    let userSkills = [];

    if (latestResume?.skills_json) {
      const skills = this._parseJSON(latestResume.skills_json, {});
      userSkills = [
        ...(skills.technical || []),
        ...(skills.tools || []),
      ].slice(0, 10);
    }

    const jobs = await jobRepository.getMatchingJobs(userId, userSkills);
    const result = jobs.map((job) => ({
      ...job,
      skills_required: this._parseJSON(job.skills_required, []),
      matchPercentage: Math.min(100, job.match_score),
    }));

    await cache.set(cacheKey, result, 1800); // 30 min cache
    return result;
  }

  async applyToJob(userId, jobId, { coverLetter, resumeId }) {
    const job = await jobRepository.findById(jobId);
    if (!job) throw new NotFoundError('Job');

    const alreadyApplied = await jobRepository.hasApplied(userId, jobId);
    if (alreadyApplied) throw new ConflictError('You have already applied to this job');

    const application = await jobRepository.createApplication({
      userId,
      jobId,
      coverLetter,
      resumeId,
    });

    // Invalidate match cache
    await cache.del(`jobs:match:${userId}`);

    logger.info({ message: 'Job application submitted', userId, jobId });
    return application;
  }

  async getUserApplications(userId, pagination) {
    return jobRepository.getUserApplications(userId, pagination);
  }

  _parseJSON(value, fallback) {
    if (!value) return fallback;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
}

module.exports = new JobService();
