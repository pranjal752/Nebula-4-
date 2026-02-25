import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './layouts/Layout';

// Lazy-loaded pages for code splitting
const Home         = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Login        = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register     = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const Dashboard    = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Problems     = lazy(() => import('./pages/Problems').then(m => ({ default: m.Problems })));
const ProblemDetail = lazy(() => import('./pages/ProblemDetail').then(m => ({ default: m.ProblemDetail })));
const Leaderboard  = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const Contests     = lazy(() => import('./pages/Contests').then(m => ({ default: m.Contests })));
const Submissions  = lazy(() => import('./pages/Submissions').then(m => ({ default: m.Submissions })));
const NotFound     = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })));

const PageLoader = () => (
  <div className="flex h-[calc(100vh-64px)] items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
    return (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />

              <Route path="/problems" element={<Problems />} />
              <Route path="/problem/:slug" element={<ProblemDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/contests" element={<Contests />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
    );
}

function App() {
  return (
    <Router>
      <AuthProvider>
          <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
