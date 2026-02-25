import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Trophy, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await api.get('/leaderboard', { params: { limit: 50 } });
        const payload = data.data || data;
        const list = Array.isArray(payload) ? payload : payload.items || payload.users || [];
        setUsers(list);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Leaderboard</h1>
      </div>

      <div className="bg-surface rounded-lg border border-white/5 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-textMuted uppercase tracking-wider border-b border-white/5 bg-black/20">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">User</div>
            <div className="col-span-3 text-right">Problems Solved</div>
            <div className="col-span-2 text-right">Points</div>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>
        ) : error ? (
          <div className="p-10 flex items-center justify-center gap-2 text-red-400">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-textMuted">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No users on the leaderboard yet</p>
          </div>
        ) : (
          users.map((u, idx) => (
            <div key={u._id} className={clsx(
              "grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/5 transition-colors",
              idx === 0 && "bg-yellow-500/5",
              idx === 1 && "bg-gray-400/5",
              idx === 2 && "bg-amber-700/5",
            )}>
              <div className="col-span-2 text-center font-bold">
                {idx === 0 ? <span className="text-xl">🥇</span> :
                 idx === 1 ? <span className="text-xl">🥈</span> :
                 idx === 2 ? <span className="text-xl">🥉</span> :
                 <span className="text-textMuted text-sm">{u.rank || idx + 1}</span>}
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm uppercase text-primary">
                  {u.username.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{u.username}</p>
                  {u.country && <p className="text-xs text-textMuted">{u.country}</p>}
                </div>
              </div>
              <div className="col-span-3 text-right font-mono font-bold text-green-400">
                {u.stats?.totalSolved ?? 0}
              </div>
              <div className="col-span-2 text-right font-mono text-sm text-primary">
                {u.stats?.totalPoints ?? 0}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
