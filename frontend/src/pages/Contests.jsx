import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Loader2, Calendar, Users, Trophy, Clock, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { clsx } from 'clsx';

function StatusBadge({ status }) {
  const cfg = {
    ongoing:  { label: 'Live', cls: 'bg-green-500/15 text-green-400 border-green-500/30' },
    upcoming: { label: 'Upcoming', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    ended:    { label: 'Ended', cls: 'bg-white/5 text-textMuted border-white/10' },
  };
  const { label, cls } = cfg[status] || cfg.ended;
  return (
    <span className={clsx('text-xs font-bold px-2.5 py-1 rounded-full border', cls)}>
      {status === 'ongoing' && <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse" />}
      {label}
    </span>
  );
}

export function Contests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const { data } = await api.get('/contests', { params: { limit: 50 } });
        const list = data.data || data.contests || data;
        setContests(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Failed to load contests', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContests();
  }, []);

  const filtered = filter === 'all' ? contests : contests.filter(c => (c.liveStatus || 'ended') === filter);

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Trophy className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black">Contests</h1>
          <p className="text-textMuted text-sm mt-0.5">{contests.length} contests · Compete with the best</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['all', 'ongoing', 'upcoming', 'ended'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border capitalize transition-all',
              filter === f
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-transparent border-white/10 text-textMuted hover:border-white/30 hover:text-white'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary h-7 w-7" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-textMuted">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="font-medium text-lg">No contests found</p>
          <p className="text-sm mt-1">Check back soon for upcoming competitions!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(contest => {
            const status = contest.liveStatus || 'ended';
            return (
              <div key={contest._id} className={clsx(
                'group relative rounded-xl border p-6 transition-all hover:border-primary/40 hover:bg-white/[0.02]',
                status === 'ongoing' ? 'border-green-500/20 bg-green-500/[0.03]' : 'border-white/5 bg-surface'
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusBadge status={status} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
                      {contest.title}
                    </h2>
                    {contest.description && (
                      <p className="text-sm text-textMuted mb-4 line-clamp-2">{contest.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-5 text-sm text-textMuted">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Starts: {new Date(contest.startTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ends: {new Date(contest.endTime).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {contest.participantCount ?? contest.participants?.length ?? 0} participants
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {status === 'ongoing' && (
                      <Button className="gap-2">
                        Enter <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                    {status === 'upcoming' && (
                      <Button variant="outline" className="gap-2">Register</Button>
                    )}
                    {status === 'ended' && (
                      <Button variant="ghost" className="gap-2 text-textMuted">
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
