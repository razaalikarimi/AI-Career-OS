'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Target, BookOpen,
  Mic2, Briefcase, Bell, Settings, LogOut,
  ChevronRight, Zap, Circle
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
  { href: '/dashboard/resume', icon: FileText, label: 'Resume Intelligence', badge: 'AI' },
  { href: '/dashboard/skills', icon: Target, label: 'Skill Gap Analysis', badge: null },
  { href: '/dashboard/learning', icon: BookOpen, label: 'Study Planner', badge: null },
  { href: '/dashboard/interview', icon: Mic2, label: 'Interview Simulator', badge: 'Live' },
  { href: '/dashboard/jobs', icon: Briefcase, label: 'Job Matching', badge: null },
];

const secondaryNavItems = [
  { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="sidebar">
            <div className="p-5 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              boxShadow: '0 0 20px rgba(var(--color-primary-rgb), 0.15)'
            }}
          >
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight">AI Career OS</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>v1.0.0</div>
          </div>
        </Link>
      </div>

            <div className="p-4">
        <div className="glass-card-solid p-3 flex items-center gap-3">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary))', color: 'white' }}
            >
              JD
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: 'var(--color-emerald)',
                borderColor: 'var(--surface-2)'
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white truncate">John Doe</div>
            <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              Senior Developer
            </div>
          </div>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

            <div className="px-4 mb-4">
        <div
          className="glass-card p-3 flex items-center justify-between"
          style={{ borderColor: 'rgba(var(--color-primary-rgb), 0.15)' }}
        >
          <div>
            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
              ATS Score
            </div>
            <div className="text-xl font-bold text-gradient">82/100</div>
          </div>
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="score-ring">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(var(--color-primary-rgb), 0.2)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#scoreGrad)"
                strokeWidth="3"
                strokeDasharray="82, 100"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor="var(--color-secondary)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="mb-2 px-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Main
          </span>
        </div>
        {navItems.map(({ href, icon: Icon, label, badge }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={18} className="nav-icon flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && (
              <span className="badge badge-brand text-xs">{badge}</span>
            )}
          </Link>
        ))}

        <div className="divider my-3" />

        <div className="mb-2 px-2">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Account
          </span>
        </div>
        {secondaryNavItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={18} className="nav-icon flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

            <div className="p-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
        <button className="nav-item w-full text-left" style={{ color: 'var(--color-rose)' }}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
