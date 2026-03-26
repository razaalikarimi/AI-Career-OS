import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen relative overflow-hidden" style={{ background: 'var(--surface-0)' }}>
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0 opacity-40" />
      
      <div className="relative z-10 flex">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 relative z-10 h-screen overflow-hidden">
        {children}
      </div>
    </div>
  );
}
