import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Input } from '../components/Input';
import { clsx } from 'clsx';
import { Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await api.get('/problems', { params: { limit: 100 } });
        const list = data.data || data.problems || data;
        setProblems(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to fetch problems', err);
        setError('Failed to load problems. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDiff = difficultyFilter === 'All' || p.difficulty === difficultyFilter;
    return matchSearch && matchDiff;
  });

  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  problems.forEach(p => counts[p.difficulty] = (counts[p.difficulty] || 0) + 1);

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Problems
          </h1>
          <p className="text-textMuted text-sm mt-1">{problems.length} problems total</p>
        </div>
        <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
            <Input 
                placeholder="Search problems..." 
                className="pl-10" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Difficulty filter pills */}
      <div className="flex items-center gap-2 mb-6">
        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
          <button
            key={d}
            onClick={() => setDifficultyFilter(d)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
              difficultyFilter === d
                ? d === 'Easy' ? 'bg-green-500/20 border-green-500/40 text-green-400'
                  : d === 'Medium' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400'
                  : d === 'Hard' ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : 'bg-primary/20 border-primary/40 text-primary'
                : 'bg-transparent border-white/10 text-textMuted hover:border-white/30 hover:text-white'
            )}
          >
            {d}{d !== 'All' && ` (${counts[d] || 0})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center gap-3 py-20 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="bg-surface rounded-lg border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 text-xs font-bold text-textMuted uppercase tracking-wider border-b border-white/5 bg-black/20">
            <div className="col-span-1">#</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-3">Tags</div>
          </div>
          {filteredProblems.length === 0 ? (
            <div className="p-16 text-center text-textMuted">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No problems found</p>
              {search && <p className="text-sm mt-1">Try a different search query</p>}
            </div>
          ) : (
            filteredProblems.map((problem, idx) => (
              <Link 
                key={problem._id} 
                to={`/problem/${problem.slug}`}
                className="grid grid-cols-12 gap-4 p-4 text-sm hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 items-center group"
              >
                <div className="col-span-1 text-textMuted font-mono text-xs">{idx + 1}</div>
                <div className="col-span-6 font-medium text-text group-hover:text-primary transition-colors flex items-center gap-2">
                  {problem.isSolved && <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />}
                  {problem.title}
                </div>
                <div className="col-span-2">
                  <span className={clsx(
                    "px-2 py-1 rounded-full text-xs font-medium border",
                    problem.difficulty === 'Easy' && "border-green-500/20 text-green-400 bg-green-500/10",
                    problem.difficulty === 'Medium' && "border-yellow-500/20 text-yellow-400 bg-yellow-500/10",
                    problem.difficulty === 'Hard' && "border-red-500/20 text-red-400 bg-red-500/10",
                  )}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="col-span-3 flex flex-wrap gap-1.5">
                  {problem.tags && problem.tags.slice(0, 2).map(tag => (
                     <span key={tag} className="text-xs text-textMuted bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                       {tag}
                     </span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
