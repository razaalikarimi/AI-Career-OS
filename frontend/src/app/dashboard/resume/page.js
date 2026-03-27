'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { resumeAPI } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  Upload, FileText, CheckCircle2, AlertCircle, XCircle,
  Sparkles, TrendingUp, Target, ChevronRight, RotateCcw,
  Download, Trash2, Eye, Zap, Award, BookOpen, Loader2
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const priorityColor = {
  high: 'var(--color-rose)',
  medium: 'var(--color-amber)',
  low: 'var(--color-emerald)',
};

const scoreColor = (score) => {
  if (score >= 80) return 'var(--color-tertiary)';
  if (score >= 60) return 'var(--color-amber)';
  return 'var(--color-rose)';
};

export default function ResumePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Fetch all resumes
  const { data: resumesData, isLoading: isLoadingResumes } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const res = await resumeAPI.getAll();
      return res.data;
    },
  });

  const resumes = resumesData?.data?.resumes || [];
  
  useEffect(() => {
    if (!selectedResumeId && resumes.length > 0) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // 2. Fetch details + Poll
  const { data: resumeDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['resume', selectedResumeId],
    queryFn: async () => {
      const res = await resumeAPI.getById(selectedResumeId);
      return res.data;
    },
    enabled: !!selectedResumeId,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      return (status === 'pending' || status === 'processing') ? 3000 : false;
    }
  });

  const resume = resumeDetailData?.data;
  const analysis = resume?.extracted_data || null;

  const uploadMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      return resumeAPI.upload(formData);
    },
    onSuccess: (res) => {
      toast.success('Resume uploaded! Analysis started.');
      queryClient.invalidateQueries(['resumes']);
      setSelectedResumeId(res.data.data.id);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadMutation.mutate(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadMutation.mutate(file);
  };

  if (isLoadingResumes && !resumes.length) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin" size={40} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar
        title="Resume Intelligence"
        subtitle="AI-powered ATS analysis and optimization"
      />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {resumes.length === 0 && !uploadMutation.isPending ? (
          <div
            className="glass-card p-12 flex flex-col items-center justify-center text-center cursor-pointer"
            style={{
              border: isDragging
                ? '2px dashed var(--color-primary)'
                : '2px dashed var(--surface-border)',
              minHeight: 400,
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
            />
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8"
              style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '2px solid rgba(var(--color-primary-rgb), 0.1)' }}
            >
              <Upload size={40} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Upload Your Resume</h2>
            <p style={{ color: 'var(--text-muted)' }} className="mb-8 max-w-lg text-base">
              Drop your PDF or Word document here. AI Career OS will analyze your ATS compatibility,
              extract skills, and provide professional improvement suggestions.
            </p>
            <button className="btn-primary py-3 px-8 text-base">
              <Upload size={18} /> Choose File
            </button>
            <p className="text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
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
                <select 
                  className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-sm"
                  value={selectedResumeId || ''}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.file_name}</option>
                  ))}
                </select>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {resume?.status === 'analyzed' ? `Analyzed ${new Date(resume.updated_at).toLocaleDateString()}` : 'Processing...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  onChange={handleFileChange}
                />
                <button 
                  className="btn-secondary text-xs gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  Upload New
                </button>
              </div>
            </div>

            {resume?.status !== 'analyzed' ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                   <div className="absolute inset-0 rounded-full blur-xl scale-150 opacity-20" style={{ background: 'var(--color-primary)' }} />
                   <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin relative" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">AI is Analyzing Your Profile</h3>
                <p className="max-w-xs mx-auto text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  This usually takes 15-30 seconds. We're extracting skills, calculating ATS scores, and finding improvements.
                </p>
              </div>
            ) : !analysis ? (
              <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
                <AlertCircle size={40} color="var(--color-rose)" className="mb-4" />
                <h3 className="text-lg font-bold text-slate-800">Analysis Data Unavailable</h3>
                <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                  Something went wrong during extraction. Please try re-analyzing or upload a fresh copy.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="glass-card p-6 flex flex-col items-center text-center">
                    <div className="mb-4">
                      <div className="text-xs font-semibold uppercase tracking-widest mb-3"
                        style={{ color: 'var(--text-muted)' }}>ATS Score</div>
                      <div className="relative w-36 h-36 mx-auto">
                        <svg viewBox="0 0 120 120" className="score-ring" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(var(--color-primary-rgb), 0.1)" strokeWidth="8" />
                          <circle
                            cx="60" cy="60" r="54"
                            fill="none"
                            stroke={scoreColor(analysis.atsScore)}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${(analysis.atsScore / 100) * 339.3} 339.3`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-slate-800">{analysis.atsScore}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>out of 100</span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-emerald mb-3 capitalize">{analysis.overallRating}</span>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {analysis.summary}
                    </p>
                    <div className="divider w-full my-4" />
                    <div className="w-full space-y-3 text-left">
                       <div>
                          <div className="flex justify-between text-xs mb-1">
                             <span style={{ color: 'var(--text-muted)' }}>Keywords Found</span>
                             <span className="text-slate-800 font-bold">{analysis.keywords?.found?.length || 0}</span>
                          </div>
                          <div className="progress-bar h-1.5">
                             <div className="progress-fill" style={{ width: `${Math.min(((analysis.keywords?.found?.length || 0) / 20) * 100, 100)}%` }} />
                          </div>
                       </div>
                       <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                           <span className="text-xs font-medium text-slate-600">Experience Level</span>
                           <span className="text-xs font-bold text-indigo-600 uppercase">{analysis.experience?.level || 'N/A'}</span>
                       </div>
                    </div>
                  </div>

                  <div className="glass-card p-5">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4">Skill Dimensions</h3>
                    <ResponsiveContainer width="100%" height={240}>
                      <RadarChart data={[
                        { area: 'Keywords', score: analysis.atsScore * 0.8, fullMark: 100 },
                        { area: 'Experience', score: (analysis.experience?.totalYears || 0) * 10, fullMark: 100 },
                        { area: 'Formatting', score: 85, fullMark: 100 },
                        { area: 'Tech Depth', score: (analysis.extractedSkills?.technical?.length || 0) * 8, fullMark: 100 },
                        { area: 'Soft Skills', score: (analysis.extractedSkills?.soft?.length || 0) * 15, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="rgba(0, 0, 0, 0.06)" />
                        <PolarAngleAxis dataKey="area" tick={{ fill: '#475569', fontSize: 10 }} />
                        <Radar
                          name="Profile"
                          dataKey="score"
                          stroke="var(--color-primary)"
                          fill="var(--color-primary)"
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-5 flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <CheckCircle2 size={15} style={{ color: 'var(--color-tertiary)' }} />
                        Key Strengths
                      </h3>
                      <ul className="space-y-2">
                        {analysis.strengths?.slice(0, 3).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'var(--color-tertiary)' }} />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="divider" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2 text-rose-600">
                        <AlertCircle size={15} />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {analysis.keywords?.missing?.slice(0, 8).map((k, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100 font-medium">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <Sparkles size={15} style={{ color: 'var(--color-primary)' }} />
                      Actionable Recommendations
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.improvements?.map((imp, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                            style={{ background: `${priorityColor[imp.priority]}18`, color: priorityColor[imp.priority] }}>
                            {imp.priority}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{imp.category}</span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-700">{imp.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap size={15} style={{ color: 'var(--color-primary)' }} />
                    Extracted Profile Data
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(analysis.extractedSkills || {}).map(([category, skills]) => (
                      <div key={category}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 text-slate-400">{category}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(skills) && skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
