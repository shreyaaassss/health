import { BottomNav } from '@/components/BottomNav';
import { DemoFab } from '@/components/DemoFab';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--page)' }}>
      {/* Scrollable page content — pb-24 gives room for the 64px nav + safe area */}
      <main className="flex-1 overflow-y-auto pb-24 page-scroll" style={{ minHeight: 0 }}>
        {children}
      </main>
      <BottomNav />
      <DemoFab />
    </div>
  );
}
