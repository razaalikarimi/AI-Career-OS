'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobAPI } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  Briefcase, MapPin, Clock, DollarSign, Star, ExternalLink,
  Filter, Search, Zap, ChevronRight, Building2, CheckCircle2,
  Loader2, AlertCircle
} from 'lucide-react';

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
  executive: 'badge-violet',
};

export default function JobsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);

  // 1. Fetch Jobs
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['jobs', search],
    queryFn: () => jobAPI.search({ q: search }).then(res => res.data),
    placeholderData: (previousData) => previousData,
  });

  const jobs = jobsData?.data?.jobs || [];

  // 2. Fetch Job Details
  const { data: jobDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['job', selectedJob?.id],
    queryFn: () => jobAPI.getById(selectedJob.id).then(res => res.data),
    enabled: !!selectedJob?.id,
  });

  const job = jobDetailData?.data || selectedJob;

  // 3. Apply Mutation
  const applyMutation = useMutation({
    mutationFn: (id) => jobAPI.apply(id, {}),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries(['applications']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Application failed');
    }
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Job Matching" subtitle="AI-curated jobs based on your profile" />

      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-5">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px]"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
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
              {jobs.length} jobs found
            </span>
          </div>
        </div>

        <div className="flex gap-5 flex-1 overflow-hidden min-h-0">
          {/* List Section */}
          <div className="w-80 flex-shrink-0 overflow-y-auto space-y-3 pb-4 scrollbar-hide">
            {isLoading && !jobs.length ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin" color="var(--color-primary)" /></div>
            ) : jobs.length === 0 ? (
              <div className="text-center p-10">
                 <AlertCircle size={24} className="mx-auto mb-2 opacity-20" />
                 <p className="text-xs text-slate-400">No jobs found</p>
              </div>
            ) : (
              jobs.map((j) => (
                <div key={j.id} onClick={() => setSelectedJob(j)}
                  className={`glass-card p-4 cursor-pointer transition-all hover:translate-x-1 ${selectedJob?.id === j.id ? 'border-indigo-400 bg-indigo-50/50' : ''}`}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 bg-slate-100 text-slate-500 border border-slate-200">
                      {j.company?.[0] || 'J'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{j.title}</p>
                      <p className="text-xs text-slate-400">{j.company}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{ background: 'rgba(var(--color-tertiary-rgb), 0.15)', color: 'var(--color-tertiary)', border: '1.5px solid rgba(var(--color-tertiary-rgb), 0.3)' }}>
                      90%
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-500">{j.location}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-xs text-slate-500">{new Date(j.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Detail Section */}
          <div className="flex-1 glass-card p-6 overflow-y-auto">
            {!selectedJob ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <Briefcase size={48} className="mb-4" />
                <p className="text-sm font-medium">Select a job to view details</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black bg-slate-100 text-slate-400 border border-slate-200">
                    {job.company?.[0]}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Building2 size={13} className="text-slate-400" />
                      <span className="text-sm text-slate-600">{job.company}</span>
                      <span className={`badge ${levelBadge[job.experience_level] || 'badge-cyan'} capitalize`}>
                        {job.experience_level}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { icon: MapPin, label: job.location },
                    { icon: DollarSign, label: `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k` },
                    { icon: Briefcase, label: job.type },
                    { icon: Clock, label: 'Full time' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                      <Icon size={14} className="text-slate-400 flex-shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">Job Description</h3>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="btn-primary flex-1 justify-center py-3" 
                    onClick={() => applyMutation.mutate(job.id)}
                    disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Apply via Career OS'}
                    {!applyMutation.isPending && <ChevronRight size={14} />}
                  </button>
                  <button className="btn-secondary p-3"><Star size={18} /></button>
                  <button className="btn-secondary p-3"><ExternalLink size={18} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
