import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'react-hot-toast';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md p-8 bg-surface rounded-xl border border-white/5 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Email</label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textMuted mb-1">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2 font-bold bg-primary text-black hover:bg-primaryHover">
            Sign In
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-textMuted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
