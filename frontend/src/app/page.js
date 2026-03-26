'use client';

import Link from 'next/link';
import {
  Zap, ArrowRight, FileText, Target, Mic2, Briefcase,
  BookOpen, Shield, TrendingUp, CheckCircle2, Star, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Resume Intelligence',
    desc: 'ATS scoring, keyword analysis, and AI-powered improvement suggestions to make your resume stand out.',
    color: 'var(--color-primary)',
    badge: 'AI',
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    desc: 'Identify exactly what skills you need for your dream role with prioritized learning recommendations.',
    color: 'var(--color-secondary)',
    badge: 'Smart',
  },
  {
    icon: Mic2,
    title: 'Interview Simulator',
    desc: 'Practice with AI-generated questions and receive instant feedback on every answer.',
    color: 'var(--color-primary)',
    badge: 'Live',
  },
  {
    icon: BookOpen,
    title: 'Personalized Roadmaps',
    desc: 'Custom week-by-week learning plans built around your goals, skills, and timeline.',
    color: 'var(--color-tertiary)',
    badge: 'Custom',
  },
  {
    icon: Briefcase,
    title: 'Smart Job Matching',
    desc: 'AI-curated job recommendations that match your skills, experience, and career trajectory.',
    color: 'var(--color-tertiary)',
    badge: 'Match',
  },
  {
    icon: TrendingUp,
    title: 'Career Analytics',
    desc: 'Real-time dashboards tracking your progress across skills, applications, and interview performance.',
    color: 'var(--color-tertiary)',
    badge: 'Live',
  },
];

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '95%', label: 'Placement Rate' },
  { value: '3.2x', label: 'Less time hunting' },
  { value: '200+', label: 'Partner Companies' },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh' }}>
            <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--surface-border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', boxShadow: '0 0 20px rgba(var(--color-primary-rgb), 0.15)' }}
          >
            <Zap size={18} color="white" fill="white" />
          </div>
          <span className="text-base font-bold text-slate-800">AI Career OS</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <a href="#features" className="hover:text-slate-800 transition-colors">Features</a>
          <a href="#how" className="hover:text-slate-800 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-slate-800 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">Sign in</Link>
          <Link href="/auth/register" className="btn-primary text-sm">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-40 right-1/4 w-96 h-96 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)' }}
        />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
            style={{ background: 'rgba(var(--color-primary-rgb), 0.15)', border: '1px solid rgba(var(--color-primary-rgb), 0.15)', color: 'var(--color-primary)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
            Powered by GPT-4o & Claude 3.5
          </div>

          <h1
            className="font-black leading-none mb-6"
            style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em' }}
          >
            Your{' '}
            <span className="text-gradient">AI-Powered</span>
            <br />Career Operating System
          </h1>

          <p
            className="text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            Resume grading, mock interviews, and job tracking combined into one simple dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Link href="/auth/register" className="btn-primary py-3 px-6 text-base">
              Start Free Today <ArrowRight size={16} />
            </Link>
            <Link href="/dashboard" className="btn-secondary py-3 px-6 text-base">
              View Demo
            </Link>
          </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-gradient mb-1">{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

            <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4">
              Everything you need to <span className="text-gradient">get hired</span></h2>
            <p className="max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Tools designed to help you prep for interviews and track job applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, badge }) => (
              <div
                key={title}
                className="glass-card p-6 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded"
                    style={{ background: `${color}18`, color }}
                  >
                    {badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
                <div
                  className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color }}
                >
                  Learn more <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="glass-card p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.15) 0%, rgba(var(--color-secondary-rgb), 0.15) 100%)',
              borderColor: 'rgba(var(--color-primary-rgb), 0.15)',
            }}
          >
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="var(--color-tertiary)" style={{ color: 'var(--color-tertiary)' }} />
              ))}
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-4">
              Ready to start?
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Sign up today to track your applications and improve your resume.
            </p>
            <Link href="/auth/register" className="btn-primary py-3 px-8 text-base">
              Get Started for Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

            <footer
        className="py-8 px-6 text-center text-xs border-t"
        style={{ color: 'var(--text-muted)', borderColor: 'var(--surface-border)' }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
          >
            <Zap size={14} color="white" fill="white" />
          </div>
          <span className="font-bold text-slate-800">AI Career OS</span>
        </div>
        <p>© 2026 AI Career OS. Built with ❤️ for career builders everywhere.</p>
      </footer>
    </div>
  );
}
