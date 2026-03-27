const logger = require('../../utils/logger');
const { ServiceUnavailableError, AppError } = require('../../utils/errors');

/**
 * Prompt template registry with versioning
 */
const PROMPT_TEMPLATES = {
  'resume-analysis/v1': {
    version: 'v1',
    template: (data) => `
You are an expert ATS (Applicant Tracking System) analyzer and career coach with 20+ years of experience.

Analyze the following resume and provide a comprehensive evaluation:

**Resume Content:**
${data.resumeText}

**Target Role:** ${data.targetRole || 'Not specified'}
**Target Industry:** ${data.targetIndustry || 'Not specified'}

Provide your analysis in the following JSON format:
{
  "atsScore": <number 0-100>,
  "overallRating": "<excellent|good|fair|poor>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "extractedSkills": {
    "technical": ["<skill1>", ...],
    "soft": ["<skill1>", ...],
    "tools": ["<tool1>", ...]
  },
  "experience": {
    "totalYears": <number>,
    "level": "<entry|mid|senior|lead|executive>",
    "roles": ["<role1>", ...]
  },
  "education": [{"degree": "", "field": "", "institution": ""}],
  "improvements": [
    {"category": "<keywords|formatting|content|quantification>", "suggestion": "<specific advice>", "priority": "<high|medium|low>"}
  ],
  "keywords": {
    "found": ["<keyword1>", ...],
    "missing": ["<suggested keyword1>", ...]
  }
}
`,
  },
  'skill-gap/v1': {
    version: 'v1',
    template: (data) => `
You are a career development expert and technical recruiter.

Identify the skill gap between the candidate's current skills and the target role requirements.

**Current Skills:** ${JSON.stringify(data.currentSkills)}
**Target Role:** ${data.targetRole}
**Target Industry:** ${data.targetIndustry || 'Technology'}
**Experience Level:** ${data.experienceLevel || 'mid'}

Return a structured JSON analysis:
{
  "gapScore": <number 0-100, higher = bigger gap>,
  "readinessScore": <number 0-100, higher = more ready>,
  "missingCriticalSkills": [
    {"skill": "<name>", "importance": "<critical|important|nice-to-have>", "estimatedLearningTime": "<e.g., 2 weeks>"}
  ],
  "missingNiceToHaveSkills": ["<skill1>", ...],
  "existingRelevantSkills": ["<skill1>", ...],
  "roadmapSummary": "<3-4 sentence roadmap overview>",
  "prioritizedLearningPath": [
    {"week": <number>, "focus": "<focus area>", "skills": ["<skill1>", ...], "resources": ["<resource1>", ...]}
  ],
  "estimatedTimeToReady": "<e.g., 3-6 months>"
}
`,
  },
  'roadmap-generation/v1': {
    version: 'v1',
    template: (data) => `
You are a world-class career coach and learning expert.

Create a detailed, personalized learning roadmap for:
**Target Role:** ${data.targetRole}
**Skill Gaps:** ${JSON.stringify(data.skillGaps)}
**Available Hours Per Week:** ${data.hoursPerWeek || 10}
**Duration:** ${data.durationWeeks || 12} weeks

Return JSON:
{
  "title": "<roadmap title>",
  "totalDuration": "<X weeks>",
  "weeklyCommitment": "<X hours/week>",
  "phases": [
    {
      "phase": <number>,
      "title": "<phase title>",
      "weeks": "<e.g., 1-3>",
      "objective": "<phase goal>",
      "topics": [
        {
          "topic": "<topic name>",
          "resources": [
            {"type": "<video|article|course|book|project>", "title": "<title>", "url": "<url if known>", "estimatedHours": <number>}
          ],
          "project": "<mini project to practice>"
        }
      ]
    }
  ],
  "milestones": [
    {"week": <number>, "milestone": "<achievement>", "verification": "<how to verify>"}
  ],
  "finalProject": {"title": "<capstone project>", "description": "<detailed description>"}
}
`,
  },
  'interview-question/v1': {
    version: 'v1',
    template: (data) => `
You are a senior technical interviewer at a top tech company.

Generate ${data.count || 5} interview questions for:
**Role:** ${data.jobRole}
**Level:** ${data.experienceLevel}
**Type:** ${data.interviewType}

Return JSON:
{
  "questions": [
    {
      "id": "<uuid-like-string>",
      "question": "<question text>",
      "type": "<technical|behavioral|situational|system-design>",
      "difficulty": "<easy|medium|hard>",
      "category": "<e.g., algorithms, leadership, architecture>",
      "hints": ["<hint1>", "<hint2>"],
      "idealAnswerFramework": "<what a good answer includes>",
      "followUpQuestions": ["<follow-up1>"]
    }
  ]
}
`,
  },
  'interview-feedback/v1': {
    version: 'v1',
    template: (data) => `
You are an expert interview coach evaluating a candidate's answer.

**Question:** ${data.question}
**Candidate's Answer:** ${data.answer}
**Role:** ${data.jobRole}
**Level:** ${data.experienceLevel}

Evaluate and return JSON:
{
  "score": <number 0-10>,
  "rating": "<excellent|good|fair|poor>",
  "strengths": ["<strength1>", ...],
  "improvements": ["<improvement1>", ...],
  "missedPoints": ["<point1>", ...],
  "idealAnswer": "<brief ideal answer outline>",
  "communicationScore": <0-10>,
  "technicalAccuracy": <0-10>,
  "overallFeedback": "<2-3 sentence comprehensive feedback>"
}
`,
  },
  'career-assistant/v1': {
    version: 'v1',
    template: (data) => `
You are an intelligent AI career advisor with deep expertise in career development, job markets, and professional growth.

**User Context:**
- Current Role: ${data.currentRole || 'Unknown'}
- Target Role: ${data.targetRole || 'Not specified'}
- Experience: ${data.experience || 'Unknown'} years
- Skills: ${JSON.stringify(data.skills || [])}

**Conversation History:**
${data.conversationHistory?.map((m) => `${m.role}: ${m.content}`).join('\n') || 'None'}

**User Question:** ${data.question}

Provide a helpful, specific, and actionable response. Be concise but comprehensive. Use bullet points where appropriate.
`,
  },
};

/**
 * AI Provider abstraction — supports multiple AI backends
 */
class AIOrchestrationService {
  constructor() {
    this.providers = {
      openai: this._callOpenAI.bind(this),
      anthropic: this._callAnthropic.bind(this),
      google: this._callGemini.bind(this),
      gemini: this._callGemini.bind(this),
    };
    this.defaultProvider = process.env.AI_PROVIDER || 'openai';
    this.fallbackProvider = process.env.AI_FALLBACK_PROVIDER || 'anthropic';
  }

  /**
   * Central AI call with retry and fallback
   */
  async call(templateKey, data, options = {}) {
    const template = PROMPT_TEMPLATES[templateKey];
    if (!template) {
      throw new AppError(`Unknown prompt template: ${templateKey}`, 400);
    }

    const prompt = template.template(data);
    const maxRetries = options.maxRetries || 3;
    const providers = [options.provider || this.defaultProvider, this.fallbackProvider];

    for (const provider of providers) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          logger.info({
            message: 'AI call initiated',
            template: templateKey,
            provider,
            attempt,
          });

          const result = await this.providers[provider](prompt, options);
          return this._parseJSONResponse(result);
        } catch (error) {
          logger.warn({
            message: `AI call failed`,
            provider,
            attempt,
            error: error.message,
            template: templateKey,
          });

          if (attempt < maxRetries) {
            await this._sleep(1000 * attempt); // Exponential-ish backoff
          }
        }
      }
    }

    throw new ServiceUnavailableError('AI Service');
  }

  // ─── Provider Implementations ──────────────────────────────────────

  async _callOpenAI(prompt, options = {}) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: options.model || process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are an AI Career OS assistant. Always respond with valid JSON when asked to return JSON format.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 4096,
        response_format: options.jsonMode !== false ? { type: 'json_object' } : undefined,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`OpenAI error: ${err.error?.message}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async _callAnthropic(prompt, options = {}) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: options.maxTokens || 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Anthropic error: ${err.error?.message}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async _callGemini(prompt, options = {}) {
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.3,
            maxOutputTokens: options.maxTokens || 4096,
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Gemini error: ${JSON.stringify(err.error)}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // ─── Utilities ─────────────────────────────────────────────────────

  _parseJSONResponse(text) {
    try {
      // Strip markdown code fences if present
      const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from the response
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          throw new Error('Failed to parse AI response as JSON');
        }
      }
      throw new Error('No valid JSON found in AI response');
    }
  }

  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getAvailableTemplates() {
    return Object.keys(PROMPT_TEMPLATES);
  }
}

module.exports = new AIOrchestrationService();
