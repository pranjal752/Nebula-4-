import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home, ArrowLeft, Code2 } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-4">
      <div className="relative mb-6">
        <p className="text-[10rem] font-black text-primary/[0.07] leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Code2 className="h-10 w-10 text-primary/60" />
          </div>
        </div>
      </div>
      <h1 className="text-3xl font-black text-white mb-3">Page Not Found</h1>
      <p className="text-textMuted max-w-md mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved to a different URL.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => history.back()} className="rounded-full px-6">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Go Back
        </Button>
        <Link to="/">
          <Button className="rounded-full px-6 text-black font-bold">
            <Home className="h-4 w-4 mr-1.5" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
