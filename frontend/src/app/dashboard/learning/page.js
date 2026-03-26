'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  BookOpen, CheckCircle2, Circle, Clock, Sparkles, ChevronDown,
  ChevronRight, Play, ExternalLink, Trophy, Plus
} from 'lucide-react';

const mockPlan = {
  title: 'Full Stack Developer Roadmap',
  targetRole: 'Senior Full Stack Developer',
  durationWeeks: 12,
  overallProgress: 33,
  phases: [
    {
      phase: 1,
      title: 'Foundation & Core Skills',
      weeks: '1–3',
      status: 'completed',
      objective: 'Strengthen JavaScript fundamentals and modern React patterns',
      topics: [
        { topic: 'Advanced JavaScript (ES2024)', done: true },
        { topic: 'React Hooks & State Management', done: true },
        { topic: 'Next.js App Router', done: true },
        { topic: 'TypeScript Fundamentals', done: true },
      ],
    },
    {
      phase: 2,
      title: 'Backend Mastery',
      weeks: '4–7',
      status: 'in_progress',
      objective: 'Build scalable Node.js APIs with proper architecture',
      topics: [
        { topic: 'Node.js & Express Architecture', done: true },
        { topic: 'Database Design (MySQL + Redis)', done: false },
        { topic: 'REST API Best Practices', done: false },
        { topic: 'Authentication & Security', done: false },
      ],
    },
    {
      phase: 3,
      title: 'System Design & DevOps',
      weeks: '8–10',
      status: 'not_started',
      objective: 'Learn to design scalable systems and deploy with confidence',
      topics: [
        { topic: 'System Design Principles', done: false },
        { topic: 'Docker & Kubernetes Basics', done: false },
        { topic: 'CI/CD with GitHub Actions', done: false },
        { topic: 'AWS Core Services', done: false },
      ],
    },
    {
      phase: 4,
      title: 'Capstone & Portfolio',
      weeks: '11–12',
      status: 'not_started',
      objective: 'Build a production-grade project and polish portfolio',
      topics: [
        { topic: 'Capstone Project Development', done: false },
        { topic: 'Portfolio & Resume Polish', done: false },
        { topic: 'Interview Preparation', done: false },
        { topic: 'Mock Interviews & Networking', done: false },
      ],
    },
  ],
};

const statusConfig = {
  completed: { color: 'var(--color-tertiary)', bg: 'rgba(var(--color-tertiary-rgb), 0.15)', label: 'Completed', icon: CheckCircle2 },
  in_progress: { color: 'var(--color-primary)', bg: 'rgba(var(--color-primary-rgb), 0.15)', label: 'In Progress', icon: Play },
  not_started: { color: '#475569', bg: 'rgba(71,85,105,0.1)', label: 'Not Started', icon: Circle },
};

export default function LearningPage() {
  const [expanded, setExpanded] = useState(2); // Phase 2 expanded by default
  const [showGenerate, setShowGenerate] = useState(false);

  const togglePhase = (phase) => setExpanded(expanded === phase ? null : phase);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Study Planner" subtitle="AI-generated personalized learning roadmap" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="glass-card p-5 flex flex-wrap items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}
          >
            <BookOpen size={22} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-slate-800">{mockPlan.title}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Target: {mockPlan.targetRole} · {mockPlan.durationWeeks} weeks · {mockPlan.phases.length} phases
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gradient">{mockPlan.overallProgress}%</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Complete</div>
          </div>
        </div>

                <div className="grid grid-cols-4 gap-3">
          {mockPlan.phases.map((phase) => {
            const config = statusConfig[phase.status];
            const completedTopics = phase.topics.filter((t) => t.done).length;
            const pct = Math.round((completedTopics / phase.topics.length) * 100);
            return (
              <div
                key={phase.phase}
                className="glass-card p-4"
                style={{ borderColor: phase.status === 'in_progress' ? 'rgba(var(--color-primary-rgb), 0.15)' : undefined }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                    Phase {phase.phase}
                  </span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded"
                    style={{ background: config.bg, color: config.color }}
                  >
                    {config.label}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-800 mb-1 leading-snug">
                  {phase.title}
                </div>
                <div className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  Week {phase.weeks}
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>{completedTopics}/{phase.topics.length}</span>
                  <span className="font-bold" style={{ color: config.color }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${pct}%`,
                      background: phase.status === 'completed'
                        ? 'linear-gradient(90deg, var(--color-tertiary), var(--color-secondary))'
                        : phase.status === 'in_progress'
                        ? 'linear-gradient(90deg, var(--color-primary), var(--color-primary))'
                        : 'linear-gradient(90deg, #475569, #334155)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

                <div className="space-y-3">
          {mockPlan.phases.map((phase) => {
            const config = statusConfig[phase.status];
            const isExpanded = expanded === phase.phase;

            return (
              <div
                key={phase.phase}
                className="glass-card overflow-hidden"
                style={{
                  borderColor: phase.status === 'in_progress' ? 'rgba(var(--color-primary-rgb), 0.15)' : undefined,
                }}
              >
                                <div
                  className="p-5 flex items-center gap-4 cursor-pointer"
                  onClick={() => togglePhase(phase.phase)}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: config.bg, border: `1px solid ${config.color}30` }}
                  >
                    <span className="text-sm font-black" style={{ color: config.color }}>
                      {phase.phase}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-slate-800">{phase.title}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded font-medium"
                        style={{ background: config.bg, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Week {phase.weeks} · {phase.topics.filter((t) => t.done).length}/{phase.topics.length} topics complete
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    : <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  }
                </div>

                                {isExpanded && (
                  <div
                    className="px-5 pb-5 border-t"
                    style={{ borderColor: 'var(--surface-border)' }}
                  >
                    <div className="mt-4 mb-4 p-3 rounded-lg text-xs"
                      style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)', color: 'var(--text-secondary)' }}>
                      🎯 <strong>Objective:</strong> {phase.objective}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {phase.topics.map((topic, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg"
                          style={{ background: 'rgba(0, 0, 0,0.02)', border: '1px solid rgba(0, 0, 0,0.05)' }}
                        >
                          <div className="flex-shrink-0">
                            {topic.done
                              ? <CheckCircle2 size={16} style={{ color: 'var(--color-tertiary)' }} />
                              : <Circle size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                            }
                          </div>
                          <span
                            className="text-xs flex-1"
                            style={{
                              color: topic.done ? 'var(--text-muted)' : 'var(--text-secondary)',
                              textDecoration: topic.done ? 'line-through' : 'none',
                            }}
                          >
                            {topic.topic}
                          </span>
                          <ExternalLink size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </div>
                      ))}
                    </div>
                    {phase.status === 'in_progress' && (
                      <div className="mt-4 flex gap-3">
                        <button className="btn-primary text-xs">
                          <Play size={13} /> Continue Learning
                        </button>
                        <button className="btn-secondary text-xs">
                          Mark Phase Complete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

                <div
          className="glass-card p-6 flex items-center gap-4 cursor-pointer"
          onClick={() => setShowGenerate(true)}
          style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.15)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(var(--color-primary-rgb), 0.15)' }}
          >
            <Plus size={22} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Generate New Learning Plan</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Create an AI-powered roadmap for a different skill or role
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="badge badge-brand text-xs">AI</span>
            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
