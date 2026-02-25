import { Navbar } from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-sm text-textMuted">
        <p>&copy; {new Date().getFullYear()} Hash4 Arena. All rights reserved.</p>
      </footer>
    </div>
  );
}
