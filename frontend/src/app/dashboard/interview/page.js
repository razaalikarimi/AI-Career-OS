'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import {
  Mic2, Play, Square, Send, ChevronRight, Star,
  CheckCircle2, AlertCircle, MessageSquare, RotateCcw, Trophy
} from 'lucide-react';

const interviewTypes = [
  { id: 'technical', label: 'Technical', desc: 'DSA, system design, coding', color: 'var(--color-primary)', icon: '💻' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, leadership', color: 'var(--color-secondary)', icon: '🧠' },
  { id: 'system-design', label: 'System Design', desc: 'Architecture, scalability', color: 'var(--color-primary)', icon: '🏗️' },
  { id: 'mixed', label: 'Mixed', desc: 'Full interview experience', color: 'var(--color-tertiary)', icon: '🎯' },
];

const mockQuestions = [
  {
    id: '1',
    question: 'Can you describe a time when you had to make a critical technical decision under time pressure? What was the outcome?',
    type: 'behavioral',
    difficulty: 'medium',
    hints: ['Use the STAR method', 'Focus on your decision-making process', 'Quantify the impact'],
  },
  {
    id: '2',
    question: 'Design a URL shortening service like bit.ly. Discuss the system architecture, database design, and how you would handle scale.',
    type: 'system-design',
    difficulty: 'hard',
    hints: ['Start with requirements clarification', 'Consider read/write ratios', 'Think about CDN and caching'],
  },
  {
    id: '3',
    question: 'Explain the difference between SQL and NoSQL databases. When would you choose one over the other?',
    type: 'technical',
    difficulty: 'medium',
    hints: ['Consider ACID vs BASE', 'Think about query patterns', 'Mention specific use cases'],
  },
];

const difficultyColor = {
  easy: 'var(--color-tertiary)',
  medium: 'var(--color-tertiary)',
  hard: 'var(--color-tertiary)',
};

export default function InterviewPage() {
  const [phase, setPhase] = useState('setup'); // setup | session | results
  const [selectedType, setSelectedType] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('mid');
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const question = mockQuestions[currentQ];

  const mockFeedback = {
    score: 7.5,
    rating: 'good',
    strengths: ['Clear structure in your response', 'Used specific example', 'Good communication'],
    improvements: ['Quantify the impact more specifically', 'Could elaborate on technical challenges faced'],
    overallFeedback:
      'Good response overall. You demonstrated awareness of trade-offs but missed quantifying business impact. Try to include metrics like "reduced load time by 30%".',
  };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Interview Simulator" subtitle="AI-powered realistic interview practice" />

      <main className="flex-1 p-6 overflow-auto">
        {phase === 'setup' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15), rgba(var(--color-primary-rgb), 0.15))', border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}
              >
                <Mic2 size={28} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Start an Interview Session</h2>
              <p style={{ color: 'var(--text-muted)' }} className="text-sm">
                Practice with AI-generated questions tailored to your target role and level
              </p>
            </div>

                        <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Select Interview Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {interviewTypes.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className="p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: `1px solid ${selectedType === type.id ? type.color : 'rgba(0, 0, 0,0.06)'}`,
                      background: selectedType === type.id ? `${type.color}10` : 'rgba(0, 0, 0,0.02)',
                    }}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-semibold text-slate-800">{type.label}</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{type.desc}</div>
                  </div>
                ))}
              </div>
            </div>

                        <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-slate-800 mb-4">Experience Level</h3>
              <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
                {['entry', 'mid', 'senior', 'lead'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={selectedLevel === level ? 'btn-primary' : 'btn-secondary'}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary w-full justify-center py-3"
              disabled={!selectedType}
              onClick={() => setPhase('session')}
            >
              <Play size={16} /> Start Interview Session
            </button>
          </div>
        )}

        {phase === 'session' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
              {mockQuestions.map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-full"
                  style={{
                    background: i < currentQ
                      ? 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))'
                      : i === currentQ
                      ? 'rgba(var(--color-primary-rgb), 0.15)'
                      : 'rgba(0, 0, 0,0.08)',
                  }}
                />
              ))}
              <span className="text-xs text-slate-800 font-semibold whitespace-nowrap">
                {currentQ + 1}/{mockQuestions.length}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                            <div className="xl:col-span-3 space-y-4">
                <div className="glass-card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="badge badge-violet capitalize">{question.type}</span>
                    <span
                      className="text-xs font-medium capitalize px-2 py-0.5 rounded"
                      style={{
                        background: `${difficultyColor[question.difficulty]}18`,
                        color: difficultyColor[question.difficulty],
                      }}
                    >
                      {question.difficulty}
                    </span>
                    <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>
                      Question {currentQ + 1}
                    </span>
                  </div>
                  <p className="text-base font-medium text-slate-800 leading-relaxed">
                    {question.question}
                  </p>

                                    <button
                    className="mt-4 text-xs flex items-center gap-1 transition-colors"
                    style={{ color: showHints ? 'var(--color-primary)' : 'var(--text-muted)' }}
                    onClick={() => setShowHints(!showHints)}
                  >
                    💡 {showHints ? 'Hide hints' : 'Show hints'}
                  </button>
                  {showHints && (
                    <div className="mt-3 p-3 rounded-lg space-y-1"
                      style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)' }}>
                      {question.hints.map((h, i) => (
                        <p key={i} className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          • {h}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                                {!submitted && (
                  <div className="glass-card p-4">
                    <label className="input-label flex items-center gap-2">
                      <MessageSquare size={13} /> Your Answer
                    </label>
                    <textarea
                      className="input-field resize-none mt-2"
                      rows={8}
                      placeholder="Type your answer here. Try to be specific and use examples where possible..."
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {answer.length} characters
                      </span>
                      <button
                        className="btn-primary"
                        disabled={answer.length < 10}
                        onClick={() => setSubmitted(true)}
                      >
                        <Send size={14} /> Submit Answer
                      </button>
                    </div>
                  </div>
                )}

                                {submitted && (
                  <div className="glass-card p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <Star size={14} fill="var(--color-tertiary)" style={{ color: 'var(--color-tertiary)' }} />
                        AI Feedback
                      </h3>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-black"
                          style={{ color: mockFeedback.score >= 7 ? 'var(--color-tertiary)' : 'var(--color-tertiary)' }}
                        >
                          {mockFeedback.score}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/10</span>
                      </div>
                    </div>

                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {mockFeedback.overallFeedback}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1"
                          style={{ color: 'var(--color-tertiary)' }}>
                          <CheckCircle2 size={12} /> Strengths
                        </p>
                        <ul className="space-y-1">
                          {mockFeedback.strengths.map((s, i) => (
                            <li key={i} className="text-xs flex items-start gap-1"
                              style={{ color: 'var(--text-secondary)' }}>
                              <span>•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-1"
                          style={{ color: 'var(--color-tertiary)' }}>
                          <AlertCircle size={12} /> Improve
                        </p>
                        <ul className="space-y-1">
                          {mockFeedback.improvements.map((s, i) => (
                            <li key={i} className="text-xs flex items-start gap-1"
                              style={{ color: 'var(--text-secondary)' }}>
                              <span>•</span>{s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                      {currentQ < mockQuestions.length - 1 ? (
                        <button
                          className="btn-primary flex-1 justify-center"
                          onClick={() => {
                            setCurrentQ((q) => q + 1);
                            setAnswer('');
                            setSubmitted(false);
                            setShowHints(false);
                          }}
                        >
                          Next Question <ChevronRight size={14} />
                        </button>
                      ) : (
                        <button
                          className="btn-primary flex-1 justify-center"
                          onClick={() => setPhase('results')}
                        >
                          <Trophy size={14} /> View Report
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

                            <div className="xl:col-span-2 space-y-4">
                <div className="glass-card p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--text-muted)' }}>Session Info</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Type</span>
                      <span className="text-slate-800 capitalize">{selectedType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Level</span>
                      <span className="text-slate-800 capitalize">{selectedLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Time Elapsed</span>
                      <span className="text-slate-800">12:34</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>Answered</span>
                      <span className="text-slate-800">{currentQ} / {mockQuestions.length}</span>
                    </div>
                  </div>
                </div>
                <button
                  className="btn-secondary w-full justify-center text-xs"
                  onClick={() => { setPhase('setup'); setCurrentQ(0); setAnswer(''); setSubmitted(false); }}
                >
                  <RotateCcw size={13} /> Restart
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === 'results' && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="glass-card p-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15), rgba(var(--color-tertiary-rgb), 0.15))', border: '1px solid rgba(var(--color-tertiary-rgb), 0.15)' }}>
                <Trophy size={36} style={{ color: 'var(--color-tertiary)' }} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Interview Complete!</h2>
              <p className="text-4xl font-black text-gradient my-4">7.5 / 10</p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Great performance! You're well-prepared. Focus on quantifying your impacts more.
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Technical', score: '8.2' },
                  { label: 'Communication', score: '7.8' },
                  { label: 'Problem Solving', score: '6.5' },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl"
                    style={{ background: 'rgba(0, 0, 0,0.04)' }}>
                    <div className="text-xl font-bold text-slate-800">{item.score}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 justify-center"
                  onClick={() => { setPhase('setup'); setCurrentQ(0); setAnswer(''); setSubmitted(false); }}>
                  <RotateCcw size={14} /> Practice Again
                </button>
                <button className="btn-primary flex-1 justify-center">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
