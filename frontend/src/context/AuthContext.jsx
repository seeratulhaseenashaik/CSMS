import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, getMeApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('csms_token');
      if (token) {
        try {
          const res = await getMeApi();
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (err) {
          console.error('Session expired or invalid token:', err);
          localStorage.removeItem('csms_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginApi({ email, password });
      if (res.data.success) {
        localStorage.setItem('csms_token', res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('csms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
