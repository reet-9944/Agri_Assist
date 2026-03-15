import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agri_token'));
  const [loading, setLoading] = useState(true);

  const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get(`${API}/api/auth/me`)
        .then(r => setUser(r.data))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const r = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token: t, user: u } = r.data;
    localStorage.setItem('agri_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t); setUser(u);
    return u;
  };

  const signup = async (data) => {
    const r = await axios.post(`${API}/api/auth/signup`, data);
    const { token: t, user: u } = r.data;
    localStorage.setItem('agri_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    setToken(t); setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('agri_token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null); setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
