import { Outlet } from 'react-router-dom';
import FloatingNav from './FloatingNav';

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen bg-[#F8FAFC] overflow-hidden font-sans text-gray-900 relative">
      {/* Full bleed main content. Bottom padding ensures nothing hides behind the floating nav */}
      <main className="flex-1 relative overflow-y-auto w-full max-w-[1600px] mx-auto focus:outline-none pb-28">
        <Outlet />
      </main>
      <FloatingNav />
    </div>
  );
}
