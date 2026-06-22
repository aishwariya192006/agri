import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../api';
import { setToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('agrimate_token');
    if (!token) {
      // No token — try restoring from localStorage snapshot
      const saved = localStorage.getItem('agrimate_user');
      if (saved) {
        try { setUser(JSON.parse(saved)); } catch {}
      }
      setLoading(false);
      return;
    }
    authApi.me()
      .then(({ user: u }) => {
        // Merge any locally-saved profile extras (state, district, village)
        const saved = localStorage.getItem('agrimate_user');
        const extras = saved ? JSON.parse(saved) : {};
        setUser({ ...extras, ...u, ...extras });
      })
      .catch(() => {
        setToken(null);
        const saved = localStorage.getItem('agrimate_user');
        if (saved) {
          try { setUser(JSON.parse(saved)); } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user: u } = await authApi.signin({ email, password });
    setToken(token);
    setUser(u);
    return u;
  };

  const signup = async (data) => {
    const { token, user: u } = await authApi.signup({
      ...data,
      state:    data.state    || '',
      district: data.district || '',
      village:  data.village  || '',
      lang:     localStorage.getItem('agrimate_lang') || 'en',
    });
    setToken(token);
    setUser(u);
    localStorage.setItem('agrimate_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('agrimate_user');
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('agrimate_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
