'use client';

import { useQuery } from '@tanstack/react-query';
import { authAPI, resumeAPI, jobAPI } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  TrendingUp, FileText, Briefcase, Mic2, BookOpen,
  Target, ArrowUpRight, Clock, CheckCircle2, AlertCircle,
  Zap, Star, Activity, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card-solid p-3 text-xs" style={{ border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}>
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <p style={{ color: 'var(--color-primary)' }}>Success Index: {payload[0]?.value}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  // 1. Fetch User Profile
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => authAPI.getProfile().then(res => res.data),
  });

  // 2. Fetch Resumes for Latest Score
  const { data: resumesData, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => resumeAPI.getAll().then(res => res.data),
  });

  // 3. Fetch Applications
  const { data: appsData } = useQuery({
    queryKey: ['applications'],
    queryFn: () => jobAPI.getApplications().then(res => res.data),
  });

  const user = profileData?.data;
  const latestResume = resumesData?.data?.resumes?.[0];
  const appsCount = appsData?.data?.total || 0;

  const metrics = [
    {
      label: 'ATS Score',
      value: latestResume?.ats_score || '0',
      unit: '/100',
      change: latestResume ? '+10' : '0',
      trend: 'up',
      icon: Target,
      color: 'var(--color-primary)',
      description: latestResume ? 'Based on latest upload' : 'Upload resume to see',
    },
    {
      label: 'Job Applications',
      value: appsCount,
      unit: ' sent',
      change: '+1',
      trend: 'up',
      icon: Briefcase,
      color: 'var(--color-secondary)',
      description: 'Active applications',
    },
    {
      label: 'Interview Readiness',
      value: '7.2',
      unit: '/10',
      change: '+0.4',
      trend: 'up',
      icon: Mic2,
      color: 'var(--color-primary)',
      description: 'Mock session average',
    },
    {
      label: 'Skills in Focus',
      value: '12',
      unit: ' skills',
      change: '+2',
      trend: 'up',
      icon: Zap,
      color: 'var(--color-tertiary)',
      description: 'Learning path progress',
    },
  ];

  // Dummy activity chart (could be real if backend tracked it)
  const activityData = [
    { day: 'Mon', score: 60 },
    { day: 'Tue', score: 65 },
    { day: 'Wed', score: 62 },
    { day: 'Thu', score: 70 },
    { day: 'Fri', score: 75 },
    { day: 'Sat', score: 72 },
    { day: 'Sun', score: 78 },
  ];

  if (isLoadingResumes) {
    return (
       <div className="flex-1 flex items-center justify-center">
         <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
       </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" subtitle={`Welcome back, ${user?.first_name || 'User'} 👋`} />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card metric-card p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg" style={{ background: `${metric.color}18` }}>
                  <metric.icon size={18} style={{ color: metric.color }} />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--color-tertiary)' }}>
                  {metric.change} <ArrowUpRight size={12} />
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-slate-800">{metric.value}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{metric.unit}</span>
              </div>
              <div className="text-sm font-medium text-slate-800 mt-1">{metric.label}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{metric.description}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="glass-card p-5 xl:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Growth Performance</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Overall career success index</p>
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
                </defs>
                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="var(--color-primary)" strokeWidth={2} fill="url(#scoreGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Actions / Progress */}
          <div className="glass-card p-5 flex flex-col">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Next Action Items</h2>
            <div className="space-y-3 flex-1">
              {[
                { title: 'Upload Latest Resume', icon: FileText, href: '/dashboard/resume', color: 'var(--color-primary)' },
                { title: 'Practice Mock Interview', icon: Mic2, href: '/dashboard/interview', color: 'var(--color-secondary)' },
                { title: 'Discover High-Match Jobs', icon: Briefcase, href: '/dashboard/jobs', color: 'var(--color-primary)' },
                { title: 'Update Learning Goal', icon: BookOpen, href: '/dashboard/learning', color: 'var(--color-tertiary)' },
              ].map((action) => (
                <div key={action.title} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200"
                  onClick={() => window.location.href = action.href}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${action.color}18` }}>
                    <action.icon size={15} style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{action.title}</span>
                  <ArrowUpRight size={14} className="ml-auto text-slate-400" />
                </div>
              ))}
            </div>
            
            <div className="divider my-4" />
            <div className="p-3 rounded-xl bg-indigo-600 text-white flex items-center justify-between cursor-pointer">
               <div>
                  <p className="text-[10px] font-bold uppercase opacity-80">Pro Tip</p>
                  <p className="text-xs font-semibold">Analyze skills gap</p>
               </div>
               <TrendingUp size={16} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
