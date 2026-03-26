const resumeService = require('./resume.service');

class ResumeController {
  async uploadResume(req, res, next) {
    try {
      const result = await resumeService.uploadResume(req.user.id, req.file, req.body);
      res.status(202).json({
        success: true,
        message: 'Resume uploaded. Analysis will be ready shortly.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getResumes(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const result = await resumeService.getResumes(req.user.id, { page: +page, limit: +limit });
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getResumeById(req, res, next) {
    try {
      const resume = await resumeService.getResumeById(req.params.id, req.user.id);
      res.status(200).json({ success: true, data: resume });
    } catch (error) {
      next(error);
    }
  }

  async analyzeResume(req, res, next) {
    try {
      const result = await resumeService.analyzeResume(req.params.id, req.user.id, req.body);
      res.status(202).json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async getSkillGapAnalysis(req, res, next) {
    try {
      const { targetRole } = req.query;
      const result = await resumeService.getSkillGapAnalysis(req.user.id, targetRole);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async deleteResume(req, res, next) {
    try {
      await resumeService.deleteResume(req.params.id, req.user.id);
      res.status(200).json({ success: true, message: 'Resume deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ResumeController();
