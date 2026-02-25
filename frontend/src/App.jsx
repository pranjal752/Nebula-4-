import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './layouts/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Problems } from './pages/Problems';
import { ProblemDetail } from './pages/ProblemDetail';
import { Leaderboard } from './pages/Leaderboard';
import { Contests } from './pages/Contests';
import { Submissions } from './pages/Submissions';

// Inline ProtectedRoute since it depends on AuthContext being available in tree
// We need to make sure AuthProvider wraps Routes, so ProtectedRoute can use useAuth
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
      return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
      )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
    return (
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route path="/problems" element={<Problems />} />
            <Route path="/problem/:slug" element={<ProblemDetail />} />
            
            <Route 
              path="/submissions" 
              element={
                <ProtectedRoute>
                  <Submissions />
                </ProtectedRoute>
              } 
            />

            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/contests" element={<Contests />} />
          </Route>
        </Routes>
    )
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
