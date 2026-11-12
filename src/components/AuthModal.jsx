'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authPromptReason, login, register, showToast } =
    useApp();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    publicationName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const loggedUser = await login(form.email, form.password);
        showToast(`Welcome back, ${loggedUser.name}`);
      } else {
        const createdUser = await register({
          name: form.name,
          username: form.username,
          email: form.email,
          publicationName: form.publicationName,
          password: form.password,
        });
        showToast(`Welcome to Inkwell, ${createdUser.name}!`);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm grid place-items-center p-5"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white/95 dark:bg-[#171a24]/95 backdrop-blur-2xl border border-white dark:border-white/15 p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold">
            <Sparkles size={13} /> Inkwell Membership
          </span>
          <button
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close modal"
            className="glass-btn glass-btn-sm p-1.5"
          >
            <X size={16} />
          </button>
        </div>

        <h2 className="font-serif text-3xl font-semibold mb-1.5">
          {mode === 'login' ? 'Sign in to Inkwell' : 'Create your publication'}
        </h2>
        <p className="text-sm text-[#555866] dark:text-slate-300 mb-5">
          {authPromptReason ||
            'Reading is always free. Sign in to like, comment, follow writers, or publish.'}
        </p>

        <div className="flex gap-2 mb-5">
          <button
            type="button"
            className={`glass-btn glass-btn-sm flex-1 ${mode === 'login' ? 'glass-btn-dark' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`glass-btn glass-btn-sm flex-1 ${mode === 'register' ? 'glass-btn-dark' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
                  type="text"
                  required
                  placeholder="Elena Vance"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1">
                  Username
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
                  type="text"
                  required
                  placeholder="elenavance"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1">
                  Publication Name (optional)
                </label>
                <input
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
                  type="text"
                  placeholder="Slow Craft Weekly"
                  value={form.publicationName}
                  onChange={(e) => setForm({ ...form, publicationName: e.target.value })}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1">
              {mode === 'login' ? 'Email or Username' : 'Email'}
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
              type={mode === 'login' ? 'text' : 'email'}
              required
              placeholder={mode === 'login' ? 'you@example.com or username' : 'you@example.com'}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/80 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="glass-btn glass-btn-accent w-full mt-2"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account & Start'}
          </button>
        </form>
      </div>
    </div>
  );
}
