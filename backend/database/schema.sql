-- ============================================================
-- AI Career OS - Complete MySQL Schema
-- Version: 1.0.0 | Engine: InnoDB | Charset: utf8mb4
-- ============================================================

CREATE DATABASE IF NOT EXISTS ai_career_os
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ai_career_os;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  VARCHAR(36)     NOT NULL,
  email               VARCHAR(255)    NOT NULL,
  first_name          VARCHAR(50)     NOT NULL,
  last_name           VARCHAR(50)     NOT NULL,
  password_hash       VARCHAR(255)    NOT NULL,
  role                ENUM('user','admin','moderator') NOT NULL DEFAULT 'user',
  avatar_url          VARCHAR(500)    NULL,
  is_active           TINYINT(1)      NOT NULL DEFAULT 1,
  is_email_verified   TINYINT(1)      NOT NULL DEFAULT 0,
  refresh_token_hash  VARCHAR(255)    NULL,
  last_login_at       TIMESTAMP       NULL,
  created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_is_active (is_active),
  INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Skills Taxonomy ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS skills (
  id          VARCHAR(36)     NOT NULL,
  name        VARCHAR(100)    NOT NULL,
  category    ENUM('technical','soft','tool','language','framework','database','cloud','other')
              NOT NULL DEFAULT 'technical',
  parent_id   VARCHAR(36)     NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_skills_name (name),
  INDEX idx_skills_category (category),
  FOREIGN KEY (parent_id) REFERENCES skills(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── User Skills (many-to-many) ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_skills (
  id              VARCHAR(36)     NOT NULL,
  user_id         VARCHAR(36)     NOT NULL,
  skill_id        VARCHAR(36)     NOT NULL,
  proficiency     ENUM('beginner','intermediate','advanced','expert') NOT NULL DEFAULT 'intermediate',
  years_of_exp    DECIMAL(4,1)    NULL,
  is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_user_skill (user_id, skill_id),
  INDEX idx_user_skills_user (user_id),
  INDEX idx_user_skills_skill (skill_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Resumes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id                VARCHAR(36)     NOT NULL,
  user_id           VARCHAR(36)     NOT NULL,
  file_name         VARCHAR(255)    NOT NULL,
  file_url          VARCHAR(1000)   NOT NULL,
  file_size         INT             NOT NULL,
  mime_type         VARCHAR(100)    NULL,
  status            ENUM('pending','processing','analyzed','failed') NOT NULL DEFAULT 'pending',
  ats_score         TINYINT UNSIGNED NULL COMMENT '0-100 ATS score',
  overall_rating    ENUM('excellent','good','fair','poor') NULL,
  target_role       VARCHAR(100)    NULL,
  target_industry   VARCHAR(100)    NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_resumes_user (user_id),
  INDEX idx_resumes_status (status),
  INDEX idx_resumes_ats_score (ats_score),
  INDEX idx_resumes_created (user_id, created_at DESC),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Extracted Resume Data ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS extracted_resume_data (
  id              VARCHAR(36)     NOT NULL,
  resume_id       VARCHAR(36)     NOT NULL,
  raw_text        LONGTEXT        NULL,
  extracted_data  JSON            NULL COMMENT 'Full AI analysis result',
  skills_json     JSON            NULL COMMENT 'Extracted skills by category',
  experience_json JSON            NULL COMMENT 'Extracted work experience',
  education_json  JSON            NULL COMMENT 'Extracted education',
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_erd_resume (resume_id),
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
  FULLTEXT INDEX ft_raw_text (raw_text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Jobs ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                VARCHAR(36)     NOT NULL,
  title             VARCHAR(200)    NOT NULL,
  company_name      VARCHAR(200)    NOT NULL,
  company_logo_url  VARCHAR(500)    NULL,
  location          VARCHAR(200)    NOT NULL,
  job_type          ENUM('full-time','part-time','contract','remote','hybrid') NOT NULL,
  experience_level  ENUM('entry','mid','senior','lead','executive') NOT NULL,
  salary_range      VARCHAR(100)    NULL,
  description       LONGTEXT        NOT NULL,
  requirements      LONGTEXT        NULL,
  skills_required   JSON            NOT NULL COMMENT 'Array of required skills',
  benefits          JSON            NULL,
  application_url   VARCHAR(1000)   NULL,
  source            VARCHAR(100)    NULL DEFAULT 'manual',
  is_active         TINYINT(1)      NOT NULL DEFAULT 1,
  posted_at         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at        TIMESTAMP       NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_jobs_active (is_active, posted_at DESC),
  INDEX idx_jobs_type (job_type),
  INDEX idx_jobs_level (experience_level),
  INDEX idx_jobs_location (location),
  INDEX idx_jobs_expires (expires_at),
  FULLTEXT INDEX ft_jobs_search (title, description, company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Job Roles (template/taxonomy) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_roles (
  id          VARCHAR(36)     NOT NULL,
  title       VARCHAR(100)    NOT NULL,
  category    VARCHAR(100)    NOT NULL,
  description TEXT            NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_role_title (title),
  INDEX idx_roles_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Job Requirements (role-skill mapping) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_requirements (
  id          VARCHAR(36)     NOT NULL,
  job_role_id VARCHAR(36)     NOT NULL,
  skill_id    VARCHAR(36)     NOT NULL,
  importance  ENUM('required','preferred','nice-to-have') NOT NULL DEFAULT 'required',
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_role_skill (job_role_id, skill_id),
  INDEX idx_req_role (job_role_id),
  INDEX idx_req_skill (skill_id),
  FOREIGN KEY (job_role_id) REFERENCES job_roles(id) ON DELETE CASCADE,
  FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Applications ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id            VARCHAR(36)     NOT NULL,
  user_id       VARCHAR(36)     NOT NULL,
  job_id        VARCHAR(36)     NOT NULL,
  resume_id     VARCHAR(36)     NULL,
  status        ENUM('applied','reviewing','shortlisted','interviewed','offered','rejected','withdrawn')
                NOT NULL DEFAULT 'applied',
  cover_letter  TEXT            NULL,
  applied_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_application (user_id, job_id),
  INDEX idx_apps_user (user_id),
  INDEX idx_apps_job (job_id),
  INDEX idx_apps_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Study Plans ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_plans (
  id              VARCHAR(36)     NOT NULL,
  user_id         VARCHAR(36)     NOT NULL,
  title           VARCHAR(200)    NOT NULL,
  target_role     VARCHAR(100)    NOT NULL,
  skill_gaps      JSON            NOT NULL,
  roadmap_data    JSON            NULL COMMENT 'Full AI-generated roadmap',
  duration_weeks  TINYINT UNSIGNED NOT NULL DEFAULT 12,
  status          ENUM('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_plans_user (user_id),
  INDEX idx_plans_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Learning Progress ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_progress (
  id              VARCHAR(36)     NOT NULL,
  study_plan_id   VARCHAR(36)     NOT NULL,
  user_id         VARCHAR(36)     NOT NULL,
  phase_number    TINYINT UNSIGNED NOT NULL,
  phase_title     VARCHAR(200)    NOT NULL,
  status          ENUM('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  notes           TEXT            NULL,
  completed_at    TIMESTAMP       NULL,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_progress_plan (study_plan_id),
  INDEX idx_progress_user (user_id),
  INDEX idx_progress_status (status),
  FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Interview Sessions ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_sessions (
  id                VARCHAR(36)     NOT NULL,
  user_id           VARCHAR(36)     NOT NULL,
  job_role          VARCHAR(100)    NOT NULL,
  experience_level  ENUM('entry','mid','senior','lead') NOT NULL,
  interview_type    ENUM('technical','behavioral','system-design','mixed') NOT NULL,
  status            ENUM('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
  overall_score     DECIMAL(4,2)    NULL COMMENT '0.00 - 10.00',
  total_questions   TINYINT         NOT NULL DEFAULT 0,
  completed_at      TIMESTAMP       NULL,
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_status (status),
  INDEX idx_sessions_role (job_role),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Interview Feedback ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview_feedback (
  id                VARCHAR(36)     NOT NULL,
  session_id        VARCHAR(36)     NOT NULL,
  question_id       VARCHAR(36)     NOT NULL,
  question_text     TEXT            NOT NULL,
  candidate_answer  TEXT            NOT NULL,
  score             DECIMAL(4,2)    NOT NULL COMMENT '0.00 - 10.00',
  feedback_data     JSON            NULL COMMENT 'Full AI feedback object',
  created_at        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_feedback_session (session_id),
  INDEX idx_feedback_score (score),
  FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          VARCHAR(36)     NOT NULL,
  user_id     VARCHAR(36)     NOT NULL,
  type        VARCHAR(100)    NOT NULL,
  title       VARCHAR(200)    NOT NULL,
  message     TEXT            NOT NULL,
  data        JSON            NULL,
  is_read     TINYINT(1)      NOT NULL DEFAULT 0,
  read_at     TIMESTAMP       NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_notif_user (user_id),
  INDEX idx_notif_is_read (user_id, is_read),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── AI Usage Logs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id              VARCHAR(36)     NOT NULL,
  user_id         VARCHAR(36)     NULL,
  template_key    VARCHAR(100)    NOT NULL,
  provider        VARCHAR(50)     NOT NULL,
  tokens_used     INT             NULL,
  response_time   INT             NULL COMMENT 'Milliseconds',
  status          ENUM('success','failed','fallback') NOT NULL DEFAULT 'success',
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_ai_log_user (user_id),
  INDEX idx_ai_log_template (template_key),
  INDEX idx_ai_log_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Seed Data: Skills Taxonomy ───────────────────────────────────────────────
INSERT IGNORE INTO skills (id, name, category) VALUES
  (UUID(), 'JavaScript', 'language'),
  (UUID(), 'Python', 'language'),
  (UUID(), 'TypeScript', 'language'),
  (UUID(), 'Java', 'language'),
  (UUID(), 'Go', 'language'),
  (UUID(), 'Rust', 'language'),
  (UUID(), 'React', 'framework'),
  (UUID(), 'Next.js', 'framework'),
  (UUID(), 'Node.js', 'framework'),
  (UUID(), 'Express.js', 'framework'),
  (UUID(), 'Django', 'framework'),
  (UUID(), 'Spring Boot', 'framework'),
  (UUID(), 'MySQL', 'database'),
  (UUID(), 'PostgreSQL', 'database'),
  (UUID(), 'MongoDB', 'database'),
  (UUID(), 'Redis', 'database'),
  (UUID(), 'AWS', 'cloud'),
  (UUID(), 'GCP', 'cloud'),
  (UUID(), 'Azure', 'cloud'),
  (UUID(), 'Docker', 'tool'),
  (UUID(), 'Kubernetes', 'tool'),
  (UUID(), 'Git', 'tool'),
  (UUID(), 'CI/CD', 'tool'),
  (UUID(), 'System Design', 'technical'),
  (UUID(), 'Data Structures & Algorithms', 'technical'),
  (UUID(), 'Communication', 'soft'),
  (UUID(), 'Leadership', 'soft'),
  (UUID(), 'Problem Solving', 'soft'),
  (UUID(), 'Teamwork', 'soft');

-- ─── Seed Data: Job Roles ─────────────────────────────────────────────────────
INSERT IGNORE INTO job_roles (id, title, category) VALUES
  (UUID(), 'Frontend Developer', 'Engineering'),
  (UUID(), 'Backend Developer', 'Engineering'),
  (UUID(), 'Full Stack Developer', 'Engineering'),
  (UUID(), 'Data Scientist', 'Data & AI'),
  (UUID(), 'Machine Learning Engineer', 'Data & AI'),
  (UUID(), 'DevOps Engineer', 'Infrastructure'),
  (UUID(), 'Product Manager', 'Product'),
  (UUID(), 'UX Designer', 'Design');
