import { BottomNav } from '@/components/BottomNav';
import { DemoFab } from '@/components/DemoFab';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable page content — leaves room for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20 page-scroll">
        {children}
      </main>
      <BottomNav />
      <DemoFab />
    </div>
  );
}
