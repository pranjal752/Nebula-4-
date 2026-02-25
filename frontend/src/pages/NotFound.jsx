import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-8xl font-black text-primary/20 mb-2 select-none">404</p>
      <h1 className="text-3xl font-bold text-white mb-3">Page Not Found</h1>
      <p className="text-textMuted max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => history.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Go Back
        </Button>
        <Link to="/">
          <Button>
            <Home className="h-4 w-4 mr-1" /> Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
