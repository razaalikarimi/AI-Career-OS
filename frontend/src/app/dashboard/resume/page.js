'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Upload, FileText, CheckCircle2, AlertCircle, XCircle,
  Sparkles, TrendingUp, Target, ChevronRight, RotateCcw,
  Download, Trash2, Eye, Zap, Award, BookOpen
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const mockAnalysis = {
  fileName: 'John_Doe_Resume_2024.pdf',
  atsScore: 82,
  overallRating: 'good',
  summary:
    'Strong technical background with solid experience in full-stack development. Resume demonstrates relevant skills but lacks quantified achievements. ATS optimization needed for keyword density.',
  strengths: [
    'Strong technical skill set matching job requirements',
    'Clear progression in career history',
    'Relevant certifications listed',
    'Education section is complete and well-structured',
  ],
  weaknesses: [
    'Missing quantified achievements (no metrics/numbers)',
    'Summary section is too generic',
    'Skills section lacks proper keyword optimization',
    'No portfolio or GitHub links detected',
  ],
  improvements: [
    {
      category: 'quantification',
      suggestion: 'Add metrics to achievements: "Reduced API response time by 40%"',
      priority: 'high',
    },
    {
      category: 'keywords',
      suggestion: 'Include: "microservices", "distributed systems", "CI/CD pipeline"',
      priority: 'high',
    },
    {
      category: 'formatting',
      suggestion: 'Use bullet points consistently and keep entries under 2 lines',
      priority: 'medium',
    },
    {
      category: 'content',
      suggestion: 'Add a strong professional summary with your USP',
      priority: 'medium',
    },
  ],
  radarData: [
    { area: 'Keywords', score: 72, fullMark: 100 },
    { area: 'Format', score: 90, fullMark: 100 },
    { area: 'Content', score: 78, fullMark: 100 },
    { area: 'Metrics', score: 45, fullMark: 100 },
    { area: 'Skills', score: 88, fullMark: 100 },
    { area: 'ATS Tags', score: 65, fullMark: 100 },
  ],
  extractedSkills: {
    technical: ['React', 'Node.js', 'Python', 'MySQL', 'Docker', 'AWS'],
    soft: ['Leadership', 'Communication', 'Problem Solving'],
    tools: ['Git', 'Jira', 'VS Code', 'Postman'],
  },
};

const priorityColor = {
  high: 'var(--color-rose)',
  medium: 'var(--color-amber)',
  low: 'var(--color-emerald)',
};

const scoreColor = (score) => {
  if (score >= 80) return 'var(--color-tertiary)';
  if (score >= 60) return 'var(--color-tertiary)';
  return 'var(--color-tertiary)';
};

export default function ResumePage() {
  const [uploaded, setUploaded] = useState(true); // Demo: show analysis
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = ['overview', 'improvements', 'keywords', 'skills'];

  return (
    <div className="flex flex-col flex-1">
      <Topbar
        title="Resume Intelligence"
        subtitle="AI-powered ATS analysis and optimization"
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {!uploaded ? (
          /* Upload Zone */
          <div
            className="glass-card p-12 flex flex-col items-center justify-center text-center cursor-pointer"
            style={{
              border: isDragging
                ? '2px dashed var(--color-brand-500)'
                : '2px dashed var(--surface-border)',
              minHeight: 320,
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => setUploaded(true)}
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '2px solid rgba(var(--color-primary-rgb), 0.15)' }}
            >
              <Upload size={36} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Your Resume</h2>
            <p style={{ color: 'var(--text-muted)' }} className="mb-6 max-w-md text-sm">
              Drop your PDF or Word document here. Our AI will analyze ATS compatibility,
              extract skills, and provide actionable improvements.
            </p>
            <button className="btn-primary">
              <Upload size={16} /> Choose File
            </button>
            <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
              Supports PDF, DOC, DOCX — Max 5MB
            </p>
          </div>
        ) : (
          <>
                        <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(var(--color-primary-rgb), 0.15)' }}>
                <FileText size={20} style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{mockAnalysis.fileName}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Analyzed 2 hours ago · PDF · 248 KB
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost text-xs gap-1.5">
                  <RotateCcw size={13} /> Re-analyze
                </button>
                <button className="btn-secondary text-xs gap-1.5">
                  <Upload size={13} /> New Upload
                </button>
              </div>
            </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <div className="glass-card p-6 flex flex-col items-center text-center">
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--text-muted)' }}>ATS Score</div>
                  <div className="relative w-36 h-36 mx-auto">
                    <svg viewBox="0 0 120 120" className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(var(--color-primary-rgb), 0.3)" strokeWidth="8" />
                      <circle
                        cx="60" cy="60" r="54"
                        fill="none"
                        stroke={scoreColor(mockAnalysis.atsScore)}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(mockAnalysis.atsScore / 100) * 339.3} 339.3`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-800">{mockAnalysis.atsScore}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>out of 100</span>
                    </div>
                  </div>
                </div>
                <span className="badge badge-emerald mb-3">Good</span>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Your resume passes most ATS filters. Optimize keywords to reach 90+.
                </p>
                <div className="divider w-full my-4" />
                <div className="w-full space-y-3">
                  {[
                    { label: 'Keyword Match', value: 72 },
                    { label: 'Formatting', value: 90 },
                    { label: 'Content Quality', value: 78 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                        <span className="text-slate-800 font-medium">{item.value}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                            <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Resume Dimensions</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={mockAnalysis.radarData}>
                    <PolarGrid stroke="rgba(0, 0, 0,0.06)" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fill: '#475569', fontSize: 11 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

                            <div className="glass-card p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={15} style={{ color: 'var(--color-tertiary)' }} />
                    Strengths
                  </h3>
                  <ul className="space-y-2">
                    {mockAnalysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs"
                        style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: 'var(--color-tertiary)' }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="divider" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={15} style={{ color: 'var(--color-tertiary)' }} />
                    Areas to Improve
                  </h3>
                  <ul className="space-y-2">
                    {mockAnalysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs"
                        style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: 'var(--color-tertiary)' }} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

                        <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
                  AI-Powered Improvements
                </h3>
                <span className="badge badge-brand">{mockAnalysis.improvements.length} suggestions</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mockAnalysis.improvements.map((imp, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(0, 0, 0,0.02)', border: '1px solid rgba(0, 0, 0,0.05)' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-semibold capitalize px-2 py-0.5 rounded"
                        style={{
                          background: `${priorityColor[imp.priority]}18`,
                          color: priorityColor[imp.priority],
                        }}
                      >
                        {imp.priority} priority
                      </span>
                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                        {imp.category}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {imp.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

                        <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Zap size={15} style={{ color: 'var(--color-primary)' }} />
                Extracted Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(mockAnalysis.extractedSkills).map(([category, skills]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3 capitalize"
                      style={{ color: 'var(--text-muted)' }}>
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <span key={skill} className="badge badge-brand">{skill}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
