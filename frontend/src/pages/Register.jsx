import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Code2, Mail, Lock, User, Loader2 } from 'lucide-react';

export function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await register({ username, email, password });
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[65vh]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <Code2 className="h-7 w-7 text-primary" />
          </div>
        </div>

        <div className="p-8 bg-surface rounded-2xl border border-white/5 shadow-2xl shadow-black/30">
          <h2 className="text-2xl font-black mb-1 text-center text-white">Create Account</h2>
          <p className="text-sm text-textMuted text-center mb-6">Join Hash4 Arena and start coding</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textMuted mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <Input
                  type="text"
                  placeholder="johndoe"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textMuted mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textMuted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textMuted" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full mt-2 font-bold bg-primary text-black hover:bg-primaryHover h-11">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-textMuted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
