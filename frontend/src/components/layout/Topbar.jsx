'use client';

import { Bell, Search, Command } from 'lucide-react';

export default function Topbar({ title, subtitle }) {
  return (
    <header
      className="h-16 flex items-center gap-4 px-6 sticky top-0 z-30"
      style={{
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--surface-border)',
      }}
    >
            <div className="flex-1">
        <h1 className="text-base font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
        )}
      </div>

            <div
        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--surface-border)',
          minWidth: '220px',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>
          Quick search...
        </span>
        <div
          className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
          style={{ background: 'var(--surface-3)', color: 'var(--text-muted)' }}
        >
          <Command size={10} />K
        </div>
      </div>

            <button className="relative btn-ghost p-2">
        <Bell size={18} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: 'var(--color-brand-500)' }}
        />
      </button>

            <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary))', color: 'white' }}
      >
        JD
      </div>
    </header>
  );
}
