import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './main.css'
import App from './App.jsx'
import { Toaster } from 'react-hot-toast';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <App />
    <Toaster position="top-center" toastOptions={{
      style: {
        background: '#333',
        color: '#fff',
      },
    }}/>
  </StrictMode>,
);
