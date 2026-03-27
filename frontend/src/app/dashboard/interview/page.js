'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { interviewAPI } from '@/lib/api';
import Topbar from '@/components/layout/Topbar';
import {
  Mic2, Play, Square, Send, ChevronRight, Star,
  CheckCircle2, AlertCircle, MessageSquare, RotateCcw, Trophy,
  Loader2
} from 'lucide-react';

const interviewTypes = [
  { id: 'technical', label: 'Technical', desc: 'DSA, system design, coding', color: 'var(--color-primary)', icon: '💻' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, leadership', color: 'var(--color-secondary)', icon: '🧠' },
  { id: 'system-design', label: 'System Design', desc: 'Architecture, scalability', color: 'var(--color-primary)', icon: '🏗️' },
  { id: 'mixed', label: 'Mixed', desc: 'Full interview experience', color: 'var(--color-tertiary)', icon: '🎯' },
];

export default function InterviewPage() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState('setup'); // setup | session | results
  const [selectedType, setSelectedType] = useState('technical');
  const [selectedLevel, setSelectedLevel] = useState('mid');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  
  // State for current session
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: (data) => interviewAPI.createSession(data),
    onSuccess: (res) => {
      setSession(res.data.data);
      setQuestions(res.data.data.questions || []);
      setPhase('session');
      toast.success('Interview session started!');
    },
    onError: () => toast.error('Failed to start interview')
  });

  const submitAnswerMutation = useMutation({
    mutationFn: (data) => interviewAPI.submitAnswer(session.sessionId, data),
    onSuccess: (res) => {
      setFeedbacks(prev => ({ ...prev, [currentQIndex]: res.data.data.feedback }));
      toast.success('AI feedback received');
    },
    onError: () => toast.error('Failed to get AI feedback')
  });

  const completeSessionMutation = useMutation({
    mutationFn: () => interviewAPI.completeSession(session.sessionId),
    onSuccess: () => {
      setPhase('results');
      queryClient.invalidateQueries(['interview-sessions']);
    }
  });

  const currentQuestion = questions[currentQIndex];

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Interview Simulator" subtitle="AI-powered realistic interview practice" />

      <main className="flex-1 p-6 overflow-auto">
        {phase === 'setup' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}>
                <Mic2 size={28} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">AI Interview Coach</h2>
              <p className="text-sm text-slate-500 mt-2">Practice with real-time AI feedback tailored to your profile.</p>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Interview Domain</h3>
              <div className="grid grid-cols-2 gap-3">
                {interviewTypes.map((type) => (
                  <div key={type.id} onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${selectedType === type.id ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-bold text-slate-800">{type.label}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{type.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
               <h3 className="text-sm font-semibold text-slate-800 mb-4">Experience Level</h3>
               <div className="flex gap-2">
                  {['junior', 'mid', 'senior', 'lead'].map(l => (
                    <button key={l} onClick={() => setSelectedLevel(l)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedLevel === l ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {l.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>

            <button className="btn-primary w-full justify-center py-4 text-sm font-bold shadow-lg shadow-indigo-100"
              disabled={createSessionMutation.isPending}
              onClick={() => createSessionMutation.mutate({ 
                jobRole: 'Software Engineer', // Default
                experienceLevel: selectedLevel, 
                interviewType: selectedType 
              })}>
              {createSessionMutation.isPending ? <Loader2 className="animate-spin" /> : <Play size={16} />} 
              Start Practice Session
            </button>
          </div>
        )}

        {phase === 'session' && currentQuestion && (
          <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-8">
               {questions.map((_, i) => (
                 <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQIndex ? 'bg-indigo-600' : i === currentQIndex ? 'bg-indigo-200' : 'bg-slate-100'}`} />
               ))}
               <span className="text-[11px] font-bold text-slate-400 ml-2">{currentQIndex + 1}/{questions.length}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="glass-card p-6 min-h-[160px] flex flex-col justify-center">
                  <span className="badge badge-indigo mb-3 w-fit">{currentQuestion.type}</span>
                  <h2 className="text-lg font-bold text-slate-800 leading-relaxed">{currentQuestion.question}</h2>
                </div>

                {!feedbacks[currentQIndex] ? (
                  <div className="glass-card p-6">
                     <textarea className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm outline-none focus:border-indigo-400 transition-all min-h-[200px]"
                       placeholder="Type your response here..." value={answer} onChange={(e) => setAnswer(e.target.value)} />
                     <div className="flex justify-between items-center mt-4">
                        <span className="text-[11px] text-slate-400 font-medium">Use the STAR method for best results.</span>
                        <button className="btn-primary px-6" disabled={submitAnswerMutation.isPending || answer.length < 5}
                          onClick={() => submitAnswerMutation.mutate({ questionId: currentQuestion.id, answer })}>
                          {submitAnswerMutation.isPending ? <Loader2 className="animate-spin" /> : <Send size={14} />}
                          Submit Answer
                        </button>
                     </div>
                  </div>
                ) : (
                  <div className="glass-card p-6 bg-emerald-50/30 border-emerald-100 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-sm font-bold text-slate-800">AI Feedback</h3>
                       <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
                          <Star size={12} fill="currentColor" /> {feedbacks[currentQIndex]?.score}/10
                       </div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{feedbacks[currentQIndex]?.overallFeedback}</p>
                    <div className="flex gap-3">
                       <button className="btn-primary flex-1 justify-center" 
                         onClick={() => {
                           if (currentQIndex < questions.length - 1) {
                             setCurrentQIndex(currentQIndex + 1);
                             setAnswer('');
                           } else {
                             completeSessionMutation.mutate();
                           }
                         }}>
                         {currentQIndex < questions.length - 1 ? 'Next Question' : 'Complete Interview'}
                         <ChevronRight size={14} />
                       </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                 <div className="glass-card p-5">
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-3">Hints</h3>
                    <div className="space-y-2">
                       {currentQuestion.hints?.map((h, i) => (
                         <div key={i} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <span className="text-indigo-400 font-bold">•</span> {h}
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
             <div className="glass-card p-10">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
                   <Trophy size={40} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Practice Complete!</h2>
                <p className="text-sm text-slate-500 mt-2 mb-8">AI analysis shows solid improvement. Keep practicing!</p>
                <button className="btn-primary px-10 py-3 mx-auto" onClick={() => window.location.reload()}>Finish Session</button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
