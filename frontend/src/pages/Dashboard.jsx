import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import api from '../api/axios';
import { Loader2, TrendingUp, CheckCircle, XCircle, Clock, Trophy, Code2, Target, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Dashboard() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/submissions');
        const list = data.data || data.submissions || data;
        setSubmissions(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to load submissions', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSubmissions();
  }, [user]);

  if (!user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <Code2 className="h-16 w-16 text-primary/30 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Sign in to continue</h2>
      <p className="text-textMuted mb-6">Please login to view your dashboard</p>
      <Link to="/login" className="text-primary hover:underline font-medium">Go to Login</Link>
    </div>
  );

  const solvedCount = user.solvedProblems ? user.solvedProblems.length : 0;
  const acceptedCount = submissions.filter(s => s.verdict === 'Accepted').length;
  const failedCount = submissions.filter(s => s.verdict && s.verdict !== 'Accepted' && s.verdict !== 'Pending').length;

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-surface border border-white/5 rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-textMuted mb-1">Welcome back,</p>
            <h1 className="text-3xl md:text-4xl font-black text-white">{user.username}</h1>
            <p className="text-textMuted mt-2">Keep up the momentum — solve a problem today!</p>
          </div>
          <Link to="/problems">
            <button className="hidden md:flex items-center gap-2 text-sm font-medium text-primary hover:text-primaryHover transition-colors bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 hover:border-primary/40">
              Solve Problems <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Problems Solved"
          value={solvedCount}
          icon={CheckCircle}
          accentClass="text-green-400 bg-green-500/10 border-green-500/20"
        />
        <StatsCard
          title="Submissions"
          value={submissions.length}
          icon={TrendingUp}
          accentClass="text-primary bg-primary/10 border-primary/20"
        />
        <StatsCard
          title="Accepted"
          value={acceptedCount}
          icon={Target}
          accentClass="text-blue-400 bg-blue-500/10 border-blue-500/20"
        />
        <StatsCard
          title="Rank"
          value={user.rank || 'Unranked'}
          icon={Trophy}
          accentClass="text-yellow-400 bg-yellow-500/10 border-yellow-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions (wide) */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-white/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold text-white">Recent Submissions</h2>
            <Link to="/submissions" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center">
              <Code2 className="h-10 w-10 mx-auto mb-3 text-textMuted/30" />
              <p className="text-textMuted font-medium">No submissions yet</p>
              <p className="text-sm text-textMuted/70 mt-1">Start solving to see your history here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {submissions.slice(0, 6).map(sub => (
                <div key={sub._id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-white truncate">
                      {sub.problem?.title || 'Problem'}
                    </p>
                    <p className="text-xs text-textMuted mt-0.5 capitalize">{sub.language}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    sub.verdict === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {sub.verdict || 'Pending'}
                  </span>
                  <span className="text-xs text-textMuted font-mono hidden sm:block">
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Side panel with quick stats */}
        <div className="space-y-6">
          {/* Verdict breakdown */}
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-4 text-sm">Verdict Breakdown</h3>
            <div className="space-y-3">
              <VerdictBar label="Accepted" count={acceptedCount} total={submissions.length} color="bg-green-500" />
              <VerdictBar label="Failed" count={failedCount} total={submissions.length} color="bg-red-500" />
              <VerdictBar label="Pending" count={submissions.length - acceptedCount - failedCount} total={submissions.length} color="bg-yellow-500" />
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-surface rounded-xl border border-white/5 p-6">
            <h3 className="font-bold text-white mb-4 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/problems" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-textMuted hover:text-white group">
                <Code2 className="h-4 w-4 text-primary" />
                <span>Browse Problems</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/contests" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-textMuted hover:text-white group">
                <Trophy className="h-4 w-4 text-primary" />
                <span>Join a Contest</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/leaderboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-sm text-textMuted hover:text-white group">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>View Leaderboard</span>
                <ArrowRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, accentClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-xl border border-white/5 p-5 flex items-center gap-4"
    >
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center border ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-textMuted">{title}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </motion.div>
  );
}

function VerdictBar({ label, count, total, color }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-textMuted">{label}</span>
        <span className="text-white font-bold">{count}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
