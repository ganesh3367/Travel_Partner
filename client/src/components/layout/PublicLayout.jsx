import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <PublicNavbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
