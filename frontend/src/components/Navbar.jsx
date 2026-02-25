import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { Code2, Trophy, List, LayoutDashboard, LogOut, ChevronDown, History, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Problems', path: '/problems', icon: List },
    { name: 'Contests', path: '/contests', icon: Trophy },
    { name: 'Leaderboard', path: '/leaderboard', icon: Code2 },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    logout();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white hover:text-primary transition-colors">
            <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span>Hash4 Arena</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    "flex items-center gap-2 text-sm font-medium transition-all px-3 py-2 rounded-lg",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-textMuted hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
              >
                <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <span className="hidden sm:block">{user.username}</span>
                <ChevronDown className={clsx("h-4 w-4 text-textMuted transition-transform", dropdownOpen && "rotate-180")} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-textMuted">Signed in as</p>
                    <p className="text-sm font-bold text-white truncate">{user.username}</p>
                    <p className="text-xs text-textMuted truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link
                      to="/submissions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-white/5 hover:text-primary transition-colors"
                    >
                      <History className="h-4 w-4" /> My Submissions
                    </Link>
                  </div>
                  <div className="border-t border-white/5 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm" className="text-black font-bold">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-textMuted hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-surface/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    "flex items-center gap-3 text-sm font-medium transition-all px-4 py-3 rounded-lg",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-textMuted hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
            {!user && (
              <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-3">
                <Link to="/login" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">Login</Button>
                </Link>
                <Link to="/register" className="flex-1">
                  <Button variant="primary" size="sm" className="w-full text-black font-bold">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
