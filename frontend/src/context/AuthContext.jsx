import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await api.get('/auth/me'); // Assuming endpoint exists
          const payload = data.data || data;
          setUser(payload.user);
        } catch (error) {
          console.error("Auth check failed", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Backend returns: { success: true, message: "...", data: { user: {...}, accessToken: "..." } }
      // OR older style: { user: {...}, accessToken: "..." } depending on implementation.
      // Based on utils/response.js: { success: true, message, data }
      
      const payload = data.data || data; // Handle wrapped or unwrapped response
      const token = payload.accessToken || payload.token;
      const user = payload.user;

      if (token) localStorage.setItem('token', token);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }
      
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      
      const payload = data.data || data;
      const token = payload.accessToken || payload.token;
      const user = payload.user;

      if (token) localStorage.setItem('token', token);
      if (user) setUser(user);
      
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
