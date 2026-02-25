import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, CheckCircle, XCircle, Clock, History, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

export function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await api.get('/submissions', {
            params: { limit: 50 }
        });
        const list = data.data || data;
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
      <History className="h-16 w-16 text-primary/30 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Sign in to continue</h2>
      <p className="text-textMuted mb-6">Please login to view your submissions</p>
      <Link to="/login" className="text-primary hover:underline font-medium">Go to Login</Link>
    </div>
  );

  const filtered = filter === 'all' ? submissions
    : filter === 'accepted' ? submissions.filter(s => s.verdict === 'Accepted')
    : filter === 'failed' ? submissions.filter(s => s.verdict && s.verdict !== 'Accepted' && s.verdict !== 'Pending')
    : submissions.filter(s => s.verdict === 'Pending' || !s.verdict);

  const counts = {
    all: submissions.length,
    accepted: submissions.filter(s => s.verdict === 'Accepted').length,
    failed: submissions.filter(s => s.verdict && s.verdict !== 'Accepted' && s.verdict !== 'Pending').length,
    pending: submissions.filter(s => s.verdict === 'Pending' || !s.verdict).length,
  };

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">My Submissions</h1>
          <p className="text-textMuted text-sm mt-0.5">{submissions.length} total submissions</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'accepted', 'failed', 'pending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all',
              filter === f
                ? f === 'accepted' ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : f === 'failed' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : f === 'pending' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-transparent border-white/10 text-textMuted hover:border-white/30 hover:text-white'
            )}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>
      ) : (
        <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-textMuted uppercase tracking-wider border-b border-white/5 bg-black/20">
                <div className="col-span-4">Problem</div>
                <div className="col-span-2">Language</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3 text-right">Submitted</div>
            </div>
            {filtered.length === 0 ? (
                <div className="p-16 text-center">
                  <Code2 className="h-10 w-10 mx-auto mb-3 text-textMuted/30" />
                  <p className="text-textMuted font-medium">No submissions found</p>
                  <p className="text-sm text-textMuted/70 mt-1">{filter !== 'all' ? 'Try a different filter' : 'Start solving problems!'}</p>
                </div>
            ) : (
                filtered.map(sub => (
                    <div key={sub._id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors">
                        <div className="col-span-4 font-medium text-white">
                            <Link to={`/problem/${sub.problem?.slug || sub.problem?._id}`} className="hover:text-primary transition-colors">
                                {sub.problem?.title || 'Unknown Problem'}
                            </Link>
                        </div>
                        <div className="col-span-2">
                            <span className="text-xs text-textMuted bg-white/5 px-2 py-0.5 rounded border border-white/5 capitalize font-mono">
                              {sub.language}
                            </span>
                        </div>
                        <div className="col-span-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                                sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                sub.verdict === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                                {sub.verdict === 'Accepted' && <CheckCircle className="h-3 w-3" />}
                                {sub.verdict === 'Pending' || !sub.verdict ? <Clock className="h-3 w-3" /> : null}
                                {sub.verdict && sub.verdict !== 'Accepted' && sub.verdict !== 'Pending' && <XCircle className="h-3 w-3" />}
                                {sub.verdict || 'Pending'}
                            </span>
                        </div>
                        <div className="col-span-3 text-right text-xs text-textMuted font-mono">
                            {new Date(sub.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))
            )}
        </div>
      )}
    </div>
  );
}
