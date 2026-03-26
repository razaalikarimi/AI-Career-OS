'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Briefcase, MapPin, Clock, DollarSign, Star, ExternalLink,
  Filter, Search, Zap, ChevronRight, Building2, CheckCircle2
} from 'lucide-react';

const mockJobs = [
  {
    id: '1',
    title: 'Senior Full Stack Engineer',
    company: 'Stripe',
    location: 'San Francisco, CA (Hybrid)',
    type: 'full-time',
    level: 'senior',
    salary: '$180K – $240K',
    matchScore: 92,
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    posted: '2 days ago',
    description: 'Join our Payments team to build the infrastructure that processes billions of dollars globally.',
    logo: 'S',
    logoColor: '#635bff',
  },
  {
    id: '2',
    title: 'Staff Software Engineer',
    company: 'Vercel',
    location: 'Remote (Global)',
    type: 'remote',
    level: 'lead',
    salary: '$200K – $260K',
    matchScore: 87,
    skills: ['Next.js', 'React', 'Node.js', 'Rust', 'AWS'],
    posted: '5 days ago',
    description: 'Shape the future of web development by working on the Next.js framework and Vercel edge network.',
    logo: 'V',
    logoColor: '#000000',
  },
  {
    id: '3',
    title: 'Backend Engineer – Platform',
    company: 'Linear',
    location: 'Remote (US/EU)',
    type: 'remote',
    level: 'mid',
    salary: '$150K – $190K',
    matchScore: 81,
    skills: ['Node.js', 'GraphQL', 'PostgreSQL', 'TypeScript'],
    posted: '1 week ago',
    description: 'Build the backend infrastructure powering Linear\'s product management tools used by thousands of teams.',
    logo: 'L',
    logoColor: '#5e6ad2',
  },
  {
    id: '4',
    title: 'Full Stack Developer',
    company: 'Notion',
    location: 'New York, NY',
    type: 'full-time',
    level: 'mid',
    salary: '$160K – $200K',
    matchScore: 78,
    skills: ['React', 'TypeScript', 'Node.js', 'SQLite', 'Electron'],
    posted: '3 days ago',
    description: 'Help us reimagine how teams work by building features used by millions of knowledge workers.',
    logo: 'N',
    logoColor: '#191919',
  },
  {
    id: '5',
    title: 'Senior React Developer',
    company: 'Figma',
    location: 'San Francisco, CA',
    type: 'full-time',
    level: 'senior',
    salary: '$170K – $220K',
    matchScore: 75,
    skills: ['React', 'WebGL', 'TypeScript', 'WebAssembly'],
    posted: '4 days ago',
    description: 'Join the Figma editor team to push the boundaries of collaborative design tools.',
    logo: 'F',
    logoColor: '#f24e1e',
  },
];

const matchColor = (score) => {
  if (score >= 90) return 'var(--color-tertiary)';
  if (score >= 75) return 'var(--color-tertiary)';
  return '#94a3b8';
};

const levelBadge = {
  entry: 'badge-emerald',
  mid: 'badge-cyan',
  senior: 'badge-brand',
  lead: 'badge-violet',
};

export default function JobsPage() {
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(mockJobs[0]);
  const [applied, setApplied] = useState(new Set());

  const filtered = mockJobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = (jobId) => {
    setApplied((prev) => new Set([...prev, jobId]));
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Job Matching" subtitle="AI-curated jobs based on your profile" />

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-5">
                <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              className="bg-transparent outline-none text-sm text-slate-800 placeholder-slate-500 flex-1"
              placeholder="Search jobs by title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-secondary text-xs">
            <Filter size={13} /> Filters
          </button>
          <div className="flex items-center gap-2">
            <span className="badge badge-brand">
              <Zap size={11} /> AI Matching On
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} matches
            </span>
          </div>
        </div>

                <div className="flex gap-5 flex-1 overflow-hidden min-h-0">
                    <div
            className="w-80 flex-shrink-0 overflow-y-auto space-y-3 pb-4"
            style={{ scrollbarWidth: 'thin' }}
          >
            {filtered.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="glass-card p-4 cursor-pointer"
                style={{
                  borderColor: selectedJob?.id === job.id ? 'rgba(var(--color-primary-rgb), 0.15)' : undefined,
                  background: selectedJob?.id === job.id ? 'rgba(var(--color-primary-rgb), 0.15)' : undefined,
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{ background: `${job.logoColor}20`, color: job.logoColor, border: `1px solid ${job.logoColor}30` }}
                  >
                    {job.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{job.company}</p>
                  </div>
                                    <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{
                      background: `${matchColor(job.matchScore)}18`,
                      color: matchColor(job.matchScore),
                      border: `1.5px solid ${matchColor(job.matchScore)}40`,
                    }}
                  >
                    {job.matchScore}%
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {job.location}
                  </span>
                  <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{job.posted}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: 'var(--color-tertiary)' }}>{job.salary}</span>
                  {applied.has(job.id) && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-tertiary)' }}>
                      <CheckCircle2 size={12} /> Applied
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

                    {selectedJob && (
            <div className="flex-1 glass-card p-6 overflow-y-auto">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black flex-shrink-0"
                  style={{
                    background: `${selectedJob.logoColor}18`,
                    color: selectedJob.logoColor,
                    border: `1px solid ${selectedJob.logoColor}30`,
                  }}
                >
                  {selectedJob.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-800">{selectedJob.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={13} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {selectedJob.company}
                    </span>
                    <span className={`badge ${levelBadge[selectedJob.level]} capitalize`}>
                      {selectedJob.level}
                    </span>
                  </div>
                </div>
                                <div className="text-center">
                  <div
                    className="text-3xl font-black"
                    style={{ color: matchColor(selectedJob.matchScore) }}
                  >
                    {selectedJob.matchScore}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>match</div>
                </div>
              </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: MapPin, label: selectedJob.location },
                  { icon: DollarSign, label: selectedJob.salary },
                  { icon: Briefcase, label: selectedJob.type },
                  { icon: Clock, label: selectedJob.posted },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Icon size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>

                            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-2">About This Role</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                  {selectedJob.description}
                </p>
              </div>

                            <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill) => (
                    <span key={skill} className="badge badge-brand">{skill}</span>
                  ))}
                </div>
              </div>

                            <div className="glass-card-solid p-4 mb-6">
                <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--text-muted)' }}>
                  AI Match Breakdown
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'Skills Match', score: 88 },
                    { label: 'Experience Level', score: 90 },
                    { label: 'Industry Fit', score: 95 },
                    { label: 'Location Preference', score: 80 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-xs w-36" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <div className="flex-1 progress-bar">
                        <div className="progress-fill" style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right text-slate-800">{item.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

                            <div className="flex gap-3">
                {applied.has(selectedJob.id) ? (
                  <div className="btn-secondary flex-1 justify-center cursor-default">
                    <CheckCircle2 size={15} style={{ color: 'var(--color-tertiary)' }} />
                    <span style={{ color: 'var(--color-tertiary)' }}>Application Submitted</span>
                  </div>
                ) : (
                  <button
                    className="btn-primary flex-1 justify-center"
                    onClick={() => handleApply(selectedJob.id)}
                  >
                    Apply Now <ChevronRight size={14} />
                  </button>
                )}
                <button className="btn-secondary text-xs">
                  <Star size={14} /> Save
                </button>
                <button className="btn-secondary text-xs">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
