import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/Card';
import api from '../api/axios';
import { Loader2, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  if (!user) return <div className="text-center py-20">Please login to view dashboard</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Hello, {user.username}</h1>
        <p className="text-textMuted">Welcome back to your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
            title="Total Solved" 
            value={user.solvedProblems ? user.solvedProblems.length : 0} 
            icon={CheckCircle}
            className="border-green-500/20 bg-green-500/5 text-green-400"
        />
        <StatsCard 
            title="Total Submissions" 
            value={submissions.length} 
            icon={TrendingUp}
            className="border-primary/20 bg-primary/5 text-primary"
        />
        <StatsCard 
            title="Rank" 
            value={user.rank || 'Unranked'} 
            icon={TrendingUp} // Or Trophy
        />
      </div>

      <div className="bg-surface rounded-lg border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-bold">Recent Submissions</h2>
            <Link to="/submissions" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-textMuted">No submissions yet.</div>
        ) : (
            <div className="divide-y divide-white/5">
                {submissions.slice(0, 5).map(sub => (
                    <div key={sub._id} className="p-4 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 font-medium">
                            {sub.problem?.title || 'Problem Title'}
                        </div>
                        <div className="col-span-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                sub.verdict === 'Accepted' ? 'bg-green-500/10 text-green-400' : 
                                sub.verdict === 'Pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                'bg-red-500/10 text-red-400'
                            }`}>
                                {sub.verdict || 'Pending'}
                            </span>
                        </div>
                        <div className="col-span-3 text-right text-xs text-textMuted">
                            {new Date(sub.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, className }) {
    return (
        <Card className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-surface ${className}`}>
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-textMuted">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </Card>
    )
}
