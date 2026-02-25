import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: { background: '#1a1a1a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </ErrorBoundary>
  </StrictMode>,
);
