import { Navbar } from '../components/Navbar';
import { Outlet, Link } from 'react-router-dom';
import { Code2 } from 'lucide-react';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-white/5 bg-surface/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white mb-3">
                <div className="h-7 w-7 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                  <Code2 className="h-4 w-4 text-primary" />
                </div>
                Hash4 Arena
              </Link>
              <p className="text-sm text-textMuted leading-relaxed">
                The ultimate competitive programming platform. Practice, compete, and level up your coding skills.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Platform</h4>
              <ul className="space-y-2">
                {[
                  { name: 'Problems', path: '/problems' },
                  { name: 'Contests', path: '/contests' },
                  { name: 'Leaderboard', path: '/leaderboard' },
                  { name: 'Dashboard', path: '/dashboard' },
                ].map(link => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-sm text-textMuted hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                {['Getting Started', 'FAQ', 'Blog', 'API Docs'].map(item => (
                  <li key={item}>
                    <span className="text-sm text-textMuted hover:text-primary transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Company</h4>
              <ul className="space-y-2">
                {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(item => (
                  <li key={item}>
                    <span className="text-sm text-textMuted hover:text-primary transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-textMuted">
              &copy; {new Date().getFullYear()} Hash4 Arena. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-textMuted">Built with passion for competitive programming</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
