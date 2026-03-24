import { createContext, useContext, useState, useEffect, useMemo } from 'react'; 
import toast from 'react-hot-toast'; 
import api from '../services/api'; 

const AuthContext = createContext(null); 

export function AuthProvider({ children }) { 
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => { 
    async function loadUser() {
      const token = localStorage.getItem('travelbuddy_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        console.error('Failed to load user', err);
        localStorage.removeItem('travelbuddy_token');
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []); 

  const value = useMemo(() => ({ 
    user, 
    loading, 
    async login(payload) { 
      try {
        const { data } = await api.post('/auth/login', payload); 
        localStorage.setItem('travelbuddy_token', data.token); 
        setUser(data.user); 
        toast.success('Logged in successfully'); 
      } catch (err) {
        console.error('Login error:', err);
        toast.error(err.response?.data?.message || 'Failed to login');
        throw err;
      }
    }, 
    async signup(payload) { 
      try {
        const { data } = await api.post('/auth/signup', payload); 
        localStorage.setItem('travelbuddy_token', data.token); 
        setUser(data.user); 
        toast.success('Welcome to TravelBuddy!'); 
      } catch (err) {
        console.error('Signup error:', err);
        toast.error(err.response?.data?.message || 'Failed to sign up');
        throw err;
      }
    }, 
    logout() { 
      localStorage.removeItem('travelbuddy_token'); 
      setUser(null); 
      toast.success('Logged out'); 
    }, 
    setUser 
  }), [user, loading]); 

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; 
} 

export const useAuth = () => useContext(AuthContext);
