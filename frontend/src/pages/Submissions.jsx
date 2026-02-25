import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (!user) return <div className="text-center py-20">Please login to view submissions</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">My Submissions</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="bg-surface rounded-lg border border-white/5 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 text-sm font-bold text-textMuted border-b border-white/5 bg-black/20">
                <div className="col-span-4">Problem</div>
                <div className="col-span-2">Language</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-3 text-right">Time</div>
            </div>
            {submissions.length === 0 ? (
                <div className="p-8 text-center text-textMuted">No submissions found.</div>
            ) : (
                submissions.map(sub => (
                    <div key={sub._id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors">
                        <div className="col-span-4 font-medium text-white">
                            <Link to={`/problem/${sub.problem?.slug || sub.problem?._id}`} className="hover:text-primary hover:underline">
                                {sub.problem?.title || 'Unknown Problem'}
                            </Link>
                        </div>
                        <div className="col-span-2 text-sm text-textMuted capitalize">
                            {sub.language}
                        </div>
                        <div className="col-span-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full inline-flex items-center gap-1 ${
                                sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                sub.verdict === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                                {sub.verdict === 'Accepted' && <CheckCircle className="h-3 w-3" />}
                                {sub.verdict !== 'Accepted' && sub.verdict !== 'Pending' && <XCircle className="h-3 w-3" />}
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
