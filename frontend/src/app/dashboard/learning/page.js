'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { learningAPI, resumeAPI } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  BookOpen, CheckCircle2, Circle, Clock, Sparkles, ChevronDown,
  ChevronRight, Play, ExternalLink, Trophy, Plus, Loader2, AlertCircle
} from 'lucide-react';

const statusConfig = {
  completed: { color: 'var(--color-tertiary)', bg: 'rgba(var(--color-tertiary-rgb), 0.15)', label: 'Completed', icon: CheckCircle2 },
  in_progress: { color: 'var(--color-primary)', bg: 'rgba(var(--color-primary-rgb), 0.15)', label: 'In Progress', icon: Play },
  not_started: { color: '#475569', bg: 'rgba(71,85,105,0.1)', label: 'Not Started', icon: Circle },
};

export default function LearningPage() {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(0);
  
  // 1. Fetch Plans
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['learning-plans'],
    queryFn: () => learningAPI.getPlans().then(res => res.data),
  });

  const plans = plansData?.data?.plans || [];
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    if (!selectedPlanId && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans, selectedPlanId]);

  // 2. Fetch Detailed Plan
  const { data: planDetailData, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['learning-plan', selectedPlanId],
    queryFn: () => learningAPI.getPlan(selectedPlanId).then(res => res.data),
    enabled: !!selectedPlanId,
  });

  const plan = planDetailData?.data;
  const roadmap = plan?.roadmap_data;

  // 3. Generate Plan Mutation
  const generateMutation = useMutation({
    mutationFn: (data) => learningAPI.generatePlan(data),
    onSuccess: (res) => {
      toast.success('AI Learning Roadmap Generated!');
      queryClient.invalidateQueries(['learning-plans']);
      setSelectedPlanId(res.data.data.planId);
    },
    onError: () => toast.error('Failed to generate roadmap')
  });

  const updateProgressMutation = useMutation({
    mutationFn: ({ phase, status }) => learningAPI.updateProgress(selectedPlanId, phase, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['learning-plan', selectedPlanId]);
      toast.success('Progress updated');
    }
  });

  if (isLoadingPlans && !plans.length) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Study Planner" subtitle="AI-generated personalized learning roadmap" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {!selectedPlanId ? (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 rounded-3xl bg-indigo-50 flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-indigo-600" />
             </div>
             <h2 className="text-xl font-bold text-slate-800">No Learning Plan Active</h2>
             <p className="text-sm text-slate-500 mt-2 mb-8 max-w-sm">
                Generate a personalized learning roadmap based on your latest resume analysis and target career goals.
             </p>
             <button className="btn-primary" 
               disabled={generateMutation.isPending}
               onClick={() => generateMutation.mutate({ 
                 title: 'Full Stack Mastery', 
                 targetRole: 'Senior Full Stack Developer',
                 skillGaps: ['System Design', 'Redis', 'Docker'], // Mock gaps for now
                 durationWeeks: 12 
               })}>
               {generateMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
               Generate AI Roadmap
             </button>
          </div>
        ) : (
          <>
            <div className="glass-card p-6 flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-indigo-50 border border-indigo-100">
                <BookOpen size={22} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-slate-800">{plan?.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Target: {plan?.target_role} · {plan?.duration_weeks} weeks
                </p>
              </div>
              <button className="btn-secondary text-xs" onClick={() => setSelectedPlanId(null)}>
                 Plan List <ChevronRight size={14} />
              </button>
            </div>

            {isLoadingDetail ? (
               <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {roadmap?.phases?.map((phase, idx) => {
                  const isExpanded = expanded === idx;
                  const phaseProgress = plan?.progress?.find(p => p.phase === phase.phase);
                  const config = statusConfig[phaseProgress?.status || 'not_started'];

                  return (
                    <div key={idx} className={`glass-card overflow-hidden transition-all ${isExpanded ? 'ring-1 ring-indigo-200' : ''}`}>
                      <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : idx)}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 text-slate-800 font-black text-sm border border-slate-100">
                          {phase.phase}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{phase.title}</h3>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ background: config.bg, color: config.color }}>
                                 {config.label}
                              </span>
                           </div>
                           <p className="text-xs text-slate-400 mt-1">Weeks {phase.weeks} · {phase.objective}</p>
                        </div>
                        {isExpanded ? <ChevronDown size={16} className="text-slate-300" /> : <ChevronRight size={16} className="text-slate-300" />}
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-50 space-y-4 animate-fade-in">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {phase.topics?.map((topic, tidx) => (
                                <div key={tidx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                                   <Circle size={14} className="text-slate-300" />
                                   <div className="flex-1">
                                      <p className="text-xs font-semibold text-slate-700">{topic.topic}</p>
                                      {topic.resources?.length > 0 && (
                                        <p className="text-[10px] text-indigo-500 mt-0.5">{topic.resources.length} learning resources</p>
                                      )}
                                   </div>
                                </div>
                              ))}
                           </div>

                           <div className="flex gap-2">
                              {phaseProgress?.status !== 'completed' ? (
                                <button className="btn-primary text-xs h-9" 
                                  onClick={() => updateProgressMutation.mutate({ phase: phase.phase, status: 'completed' })}>
                                   Mark Phase Complete
                                </button>
                              ) : (
                                <button className="btn-secondary text-xs h-9"
                                  onClick={() => updateProgressMutation.mutate({ phase: phase.phase, status: 'in_progress' })}>
                                   <RotateCcw size={12} /> Re-open Phase
                                </button>
                              )}
                           </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
