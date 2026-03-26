'use client';

import Topbar from '@/components/layout/Topbar';
import {
  TrendingUp, FileText, Briefcase, Mic2, BookOpen,
  Target, ArrowUpRight, Clock, CheckCircle2, AlertCircle,
  Zap, Star, Activity
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

// Demo data — replace with React Query hooks in production
const activityData = [
  { day: 'Mon', score: 65, applications: 2 },
  { day: 'Tue', score: 70, applications: 4 },
  { day: 'Wed', score: 68, applications: 1 },
  { day: 'Thu', score: 75, applications: 5 },
  { day: 'Fri', score: 82, applications: 3 },
  { day: 'Sat', score: 80, applications: 2 },
  { day: 'Sun', score: 85, applications: 6 },
];

const metrics = [
  {
    label: 'ATS Score',
    value: '82',
    unit: '/100',
    change: '+12',
    trend: 'up',
    icon: Target,
    color: 'var(--color-primary)',
    description: 'Resume strength',
  },
  {
    label: 'Job Matches',
    value: '24',
    unit: ' jobs',
    change: '+8',
    trend: 'up',
    icon: Briefcase,
    color: 'var(--color-secondary)',
    description: 'Personalized for you',
  },
  {
    label: 'Interview Score',
    value: '7.8',
    unit: '/10',
    change: '+0.6',
    trend: 'up',
    icon: Mic2,
    color: 'var(--color-primary)',
    description: 'Average mock score',
  },
  {
    label: 'Skills Learned',
    value: '14',
    unit: ' skills',
    change: '+3',
    trend: 'up',
    icon: Zap,
    color: 'var(--color-tertiary)',
    description: 'This month',
  },
];

const recentActivities = [
  { type: 'resume', message: 'Resume analyzed — ATS score improved to 82', time: '2h ago', status: 'success' },
  { type: 'job', message: 'Applied to Senior Developer at Stripe', time: '4h ago', status: 'info' },
  { type: 'interview', message: 'Completed behavioral interview practice', time: '1d ago', status: 'success' },
  { type: 'skill', message: 'Completed "System Design Basics" module', time: '2d ago', status: 'success' },
  { type: 'job', message: 'New job match: Staff Engineer at Vercel', time: '2d ago', status: 'info' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-solid p-3 text-xs" style={{ border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}>
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <p style={{ color: 'var(--color-primary)' }}>ATS Score: {payload[0]?.value}</p>
        <p style={{ color: 'var(--color-secondary)' }}>Applications: {payload[1]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" subtitle="Welcome back, John 👋" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card metric-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: `${metric.color}18` }}
                >
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: 'var(--color-tertiary)' }}
                >
                  {metric.change}
                  <ArrowUpRight size={12} />
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-800">{metric.value}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{metric.unit}</span>
              </div>
              <div className="text-sm font-medium text-slate-800 mt-1">{metric.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {metric.description}
              </div>
            </div>
          ))}
        </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="glass-card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Weekly Performance</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  ATS score & applications this week
                </p>
              </div>
              <span className="badge badge-brand">Last 7 days</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="appGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#475569', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-secondary)"
                  strokeWidth={2}
                  fill="url(#appGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

                    <div className="glass-card p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Career Progress</h2>
            <div className="space-y-4 flex-1">
              {[
                { label: 'Resume Strength', value: 82, color: 'var(--color-primary)' },
                { label: 'Job Readiness', value: 74, color: 'var(--color-secondary)' },
                { label: 'Interview Readiness', value: 68, color: 'var(--color-primary)' },
                { label: 'Skill Completeness', value: 61, color: 'var(--color-tertiary)' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {item.label}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.value}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${item.value}%`,
                        background: `linear-gradient(90deg, ${item.color}, ${item.color}99)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="divider mt-4" />
            <div
              className="mt-4 p-3 rounded-lg flex items-start gap-3"
              style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}
            >
              <Star size={14} style={{ color: 'var(--color-tertiary)', marginTop: 2, flexShrink: 0 }} />
              <div>
                <p className="text-xs font-semibold text-slate-800">AI Recommendation</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  Add 3 more quantified achievements to boost your ATS score to 90+
                </p>
              </div>
            </div>
          </div>
        </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Recent Activity</h2>
              <button className="btn-ghost text-xs">View all</button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg"
                  style={{ background: 'rgba(0, 0, 0,0.02)' }}>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: activity.status === 'success'
                        ? 'rgba(var(--color-tertiary-rgb), 0.15)'
                        : 'rgba(var(--color-primary-rgb), 0.15)',
                    }}
                  >
                    {activity.status === 'success'
                      ? <CheckCircle2 size={14} style={{ color: 'var(--color-tertiary)' }} />
                      : <Activity size={14} style={{ color: 'var(--color-primary)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-800 truncate">{activity.message}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={10} style={{ color: 'var(--text-muted)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

                    <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-800">Next Steps</h2>
              <span className="badge badge-cyan">3 pending</span>
            </div>
            <div className="space-y-3">
              {[
                {
                  title: 'Complete Resume Analysis',
                  desc: 'Upload your latest resume for a fresh ATS score',
                  icon: FileText,
                  color: 'var(--color-primary)',
                  href: '/dashboard/resume',
                  priority: 'high',
                },
                {
                  title: 'Practice Interview Questions',
                  desc: '8 behavioral questions queued for your role',
                  icon: Mic2,
                  color: 'var(--color-primary)',
                  href: '/dashboard/interview',
                  priority: 'medium',
                },
                {
                  title: 'Review Job Matches',
                  desc: '24 new jobs matching your profile',
                  icon: Briefcase,
                  color: 'var(--color-secondary)',
                  href: '/dashboard/jobs',
                  priority: 'low',
                },
                {
                  title: 'Continue Learning Path',
                  desc: 'Phase 2: Advanced React Patterns — 40% done',
                  icon: BookOpen,
                  color: 'var(--color-tertiary)',
                  href: '/dashboard/learning',
                  priority: 'medium',
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer group"
                  style={{
                    background: 'rgba(0, 0, 0,0.02)',
                    border: '1px solid rgba(0, 0, 0,0.04)',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => window.location.href = step.href}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${step.color}18` }}
                  >
                    <step.icon size={15} style={{ color: step.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{step.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                      {step.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={14}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: step.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
