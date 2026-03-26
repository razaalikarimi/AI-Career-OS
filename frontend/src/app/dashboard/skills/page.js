'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Target, TrendingUp, Clock, ChevronRight,
  CircleDot, Sparkles, BookOpen, ExternalLink, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, CartesianGrid
} from 'recharts';

const skillGapData = [
  { skill: 'System Design', current: 30, required: 90, category: 'technical' },
  { skill: 'Kubernetes', current: 20, required: 80, category: 'tool' },
  { skill: 'GraphQL', current: 45, required: 75, category: 'technical' },
  { skill: 'Microservices', current: 55, required: 85, category: 'technical' },
  { skill: 'AWS Advanced', current: 40, required: 80, category: 'cloud' },
  { skill: 'TypeScript', current: 70, required: 90, category: 'language' },
  { skill: 'Testing (E2E)', current: 35, required: 70, category: 'tool' },
  { skill: 'Leadership', current: 60, required: 75, category: 'soft' },
];

const criticalSkills = [
  {
    skill: 'System Design',
    gap: 60,
    estimatedTime: '8 weeks',
    importance: 'critical',
    resources: ['Designing Data-Intensive Applications (Book)', 'System Design Primer (GitHub)', 'Grokking the System Design Interview'],
  },
  {
    skill: 'Kubernetes',
    gap: 60,
    estimatedTime: '4 weeks',
    importance: 'critical',
    resources: ['Kubernetes Official Docs', 'KodeKloud CKA Course', 'Kubernetes Up & Running'],
  },
  {
    skill: 'AWS Advanced',
    gap: 40,
    estimatedTime: '6 weeks',
    importance: 'important',
    resources: ['AWS Solutions Architect Cert', 'A Cloud Guru', 'AWS Workshops'],
  },
  {
    skill: 'GraphQL',
    gap: 30,
    estimatedTime: '2 weeks',
    importance: 'important',
    resources: ['GraphQL.org official tutorial', 'Fullstack GraphQL (Ben Awad)', 'Apollo Documentation'],
  },
];

const importanceConfig = {
  critical: { color: 'var(--color-tertiary)', bg: 'rgba(var(--color-tertiary-rgb), 0.15)', label: 'Critical' },
  important: { color: 'var(--color-tertiary)', bg: 'rgba(var(--color-tertiary-rgb), 0.15)', label: 'Important' },
  'nice-to-have': { color: 'var(--color-tertiary)', bg: 'rgba(var(--color-tertiary-rgb), 0.15)', label: 'Nice to Have' },
};

export default function SkillsPage() {
  const [targetRole, setTargetRole] = useState('Senior Full Stack Developer');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const gapScore = Math.round(
    skillGapData.reduce((sum, s) => sum + (s.required - s.current), 0) / skillGapData.length
  );

  const readinessScore = 100 - gapScore;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Skill Gap Analysis" subtitle="Understand what you need to reach your target role" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="glass-card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Target size={16} style={{ color: 'var(--color-primary)' }} />
            <span className="text-sm font-semibold text-slate-800">Target Role:</span>
          </div>
          <div className="flex-1 min-w-[200px]">
            <select
              className="input-field py-2 text-sm"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            >
              <option>Senior Full Stack Developer</option>
              <option>Staff Software Engineer</option>
              <option>Lead Backend Engineer</option>
              <option>DevOps Engineer</option>
              <option>Machine Learning Engineer</option>
            </select>
          </div>
          <button className="btn-primary text-xs">
            <Sparkles size={14} /> Analyze Gap
          </button>
        </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>Overall Gap</div>
            <div className="text-4xl font-black text-slate-800">{gapScore}
              <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-tertiary)' }}>Significant gap to close</div>
            <div className="progress-bar mt-3">
              <div className="progress-fill"
                style={{ width: `${gapScore}%`, background: 'linear-gradient(90deg, var(--color-tertiary), var(--color-tertiary))' }} />
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>Job Readiness</div>
            <div className="text-4xl font-black text-slate-800">{readinessScore}%</div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-tertiary)' }}>Strong foundation</div>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: `${readinessScore}%` }} />
            </div>
          </div>
          <div className="glass-card p-5">
            <div className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--text-muted)' }}>Estimated Time</div>
            <div className="text-4xl font-black text-slate-800">4–6
              <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}> mo</span>
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              At 10 hrs/week to be job-ready
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock size={12} /> 4 critical skills to focus on
            </div>
          </div>
        </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-5">Skill Gap Visualization</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={skillGapData}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
              >
                <CartesianGrid horizontal={false} stroke="rgba(0, 0, 0,0.04)" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="skill"
                  type="category"
                  width={110}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="current" name="Current Level" fill="var(--color-primary)" fillOpacity={0.8}
                  radius={[0, 4, 4, 0]} barSize={10} />
                <Bar dataKey="required" name="Required Level" fill="rgba(0, 0, 0,0.08)"
                  radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Current Level</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ background: 'rgba(0, 0, 0,0.15)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Required Level</span>
              </div>
            </div>
          </div>

                    <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">Priority Skills to Learn</h3>
              <span className="badge badge-rose">{criticalSkills.length} skills</span>
            </div>
            <div className="space-y-3">
              {criticalSkills.map((skill) => {
                const config = importanceConfig[skill.importance];
                return (
                  <div
                    key={skill.skill}
                    className="p-4 rounded-xl cursor-pointer"
                    style={{
                      background: 'rgba(0, 0, 0,0.02)',
                      border: `1px solid ${selectedSkill === skill.skill
                        ? 'rgba(var(--color-primary-rgb), 0.15)'
                        : 'rgba(0, 0, 0,0.05)'}`,
                    }}
                    onClick={() => setSelectedSkill(selectedSkill === skill.skill ? null : skill.skill)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: config.bg }}>
                          <AlertTriangle size={14} style={{ color: config.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{skill.skill}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium capitalize"
                              style={{ color: config.color }}>{config.label}</span>
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              · {skill.estimatedTime}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold" style={{ color: config.color }}>
                          {skill.gap}pt gap
                        </span>
                        <ChevronRight size={14} className="ml-auto"
                          style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                    {selectedSkill === skill.skill && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                          style={{ color: 'var(--text-muted)' }}>
                          Recommended Resources
                        </p>
                        <ul className="space-y-2">
                          {skill.resources.map((r, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs"
                              style={{ color: 'var(--text-secondary)' }}>
                              <BookOpen size={12} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
                              {r}
                              <ExternalLink size={10} className="ml-auto flex-shrink-0"
                                style={{ color: 'var(--text-muted)' }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
