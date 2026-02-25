import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Trophy, AlertCircle, Medal, Crown } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

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

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-textMuted text-sm mt-0.5">{users.length} ranked programmers</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>
      ) : error ? (
        <div className="flex items-center justify-center gap-2 py-20 text-red-400">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-textMuted/20" />
          <p className="font-medium text-lg text-textMuted">No users on the leaderboard yet</p>
          <p className="text-sm text-textMuted/70 mt-1">Be the first to claim the top spot!</p>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {topThree.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {topThree.map((u, idx) => (
                <motion.div
                  key={u._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={clsx(
                    'relative rounded-2xl border p-6 text-center',
                    idx === 0 ? 'bg-yellow-500/[0.06] border-yellow-500/20 md:order-2' :
                    idx === 1 ? 'bg-gray-400/[0.04] border-gray-400/15 md:order-1' :
                    'bg-amber-700/[0.04] border-amber-700/15 md:order-3'
                  )}
                >
                  <div className="flex justify-center mb-3">
                    <span className="text-3xl">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <div className="h-14 w-14 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3 font-bold text-lg uppercase text-primary">
                    {u.username.substring(0, 2)}
                  </div>
                  <p className="font-bold text-white text-lg">{u.username}</p>
                  {u.country && <p className="text-xs text-textMuted">{u.country}</p>}
                  <div className="mt-3 flex items-center justify-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-green-400">{u.stats?.totalSolved ?? 0}</p>
                      <p className="text-[10px] text-textMuted uppercase tracking-wider">Solved</p>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                      <p className="text-lg font-black text-primary">{u.stats?.totalPoints ?? 0}</p>
                      <p className="text-[10px] text-textMuted uppercase tracking-wider">Points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="bg-surface rounded-xl border border-white/5 overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-textMuted uppercase tracking-wider border-b border-white/5 bg-black/20">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-5">User</div>
                <div className="col-span-3 text-right">Solved</div>
                <div className="col-span-2 text-right">Points</div>
              </div>
              {rest.map((u, idx) => (
                <div key={u._id} className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 last:border-0 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-2 text-center">
                    <span className="text-sm text-textMuted font-mono">{u.rank || idx + 4}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs uppercase text-primary">
                      {u.username.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{u.username}</p>
                      {u.country && <p className="text-xs text-textMuted">{u.country}</p>}
                    </div>
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-green-400 text-sm">
                    {u.stats?.totalSolved ?? 0}
                  </div>
                  <div className="col-span-2 text-right font-mono text-sm text-primary">
                    {u.stats?.totalPoints ?? 0}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
