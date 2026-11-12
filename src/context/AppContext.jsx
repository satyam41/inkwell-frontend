'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState('');
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingContext, setReadingContext] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [theme, setTheme] = useState('light');
  const [themeNotice, setThemeNotice] = useState(null);

  const toastTimer = useRef(null);
  const themeTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(''), 2800);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTheme = localStorage.getItem('inkwell_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const token = localStorage.getItem('inkwell_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('inkwell_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('inkwell_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');

      setThemeNotice({
        mode: next,
        label: next === 'dark' ? 'Dark Mode Activated' : 'Light Mode Activated',
      });
      if (themeTimer.current) clearTimeout(themeTimer.current);
      themeTimer.current = setTimeout(() => setThemeNotice(null), 2600);

      return next;
    });
  }, []);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    localStorage.setItem('inkwell_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    setAuthPromptReason('');
    return res.user;
  };

  const register = async (payload) => {
    const res = await api.register(payload);
    localStorage.setItem('inkwell_token', res.token);
    setUser(res.user);
    setAuthModalOpen(false);
    setAuthPromptReason('');
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('inkwell_token');
    setUser(null);
    setActiveTab('discover');
    showToast('Signed out');
  };

  const requireAuth = useCallback(
    (reason = 'Sign in to like, comment, follow writers, or publish articles.') => {
      if (user) return true;
      setAuthPromptReason(reason);
      setAuthModalOpen(true);
      return false;
    },
    [user]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        requireAuth,
        authModalOpen,
        setAuthModalOpen,
        authPromptReason,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        readingContext,
        setReadingContext,
        toastMessage,
        showToast,
        theme,
        toggleTheme,
        themeNotice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
