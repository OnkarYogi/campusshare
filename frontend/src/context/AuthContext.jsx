import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('campusshare_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        if (res.success) {
          setUser(res.user);
        } else {
          logout();
        }
      } catch (err) {
        console.error('Session restoration error:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('campusshare_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('campusshare_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('campusshare_token');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (roleKey) => {
    const roleMap = {
      steward: { email: 'elena.rostova@campus.edu', password: 'Password123!' },
      borrower: { email: 'marcus.vance@campus.edu', password: 'Password123!' },
      faculty: { email: 'dr.chen@campus.edu', password: 'Password123!' },
      club: { email: 'robotics.club@campus.edu', password: 'Password123!' },
      admin: { email: 'admin@campus.edu', password: 'AdminPass123!' },
    };

    const creds = roleMap[roleKey];
    if (creds) {
      return await login(creds.email, creds.password);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickLogin,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
