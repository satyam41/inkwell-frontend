'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Feather,
  Search,
  X,
  Compass,
  Users,
  PenSquare,
  Heart,
  MessageCircle,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function DynamicIsland() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    logout,
    requireAuth,
    setAuthModalOpen,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    readingContext,
    toastMessage,
    theme,
    toggleTheme,
    themeNotice,
  } = useApp();

  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const isReading = pathname.startsWith('/article/') && readingContext;

  const handleWriteClick = () => {
    if (requireAuth('Sign in to write and publish your own articles on Inkwell.')) {
      router.push('/write');
    }
  };

  return (
    <>
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
        <header
          className={`dynamic-island pointer-events-auto ${
            searchOpen ? 'w-[min(680px,94vw)] px-3.5 py-2 rounded-[28px]' : ''
          } ${isReading && !searchOpen ? 'w-[min(760px,94vw)] justify-between px-3.5 py-2' : ''}`}
        >
          {searchOpen ? (
            <>
              <Search size={18} className="opacity-70 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (pathname !== '/') router.push('/');
                }}
                placeholder="Search essays, topics, or writers..."
                className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2 py-1 placeholder:text-white/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1 rounded-full text-xs text-white/80 hover:bg-white/10"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition"
              >
                <X size={16} />
              </button>
            </>
          ) : isReading ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => router.push('/')}
                  title="Back to Home"
                  className="w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center shrink-0 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate max-w-[240px]">
                    {readingContext.title}
                  </div>
                  <div className="text-[11px] text-white/60">
                    {readingContext.readTimeMinutes} min read · {Math.round(readingContext.progress)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={readingContext.onToggleLike}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition hover:bg-white/10 ${
                    readingContext.isLiked ? 'text-[#ff7c3a]' : 'text-white/80'
                  }`}
                >
                  <Heart size={15} fill={readingContext.isLiked ? '#ff7c3a' : 'none'} />
                  <span>{readingContext.likesCount}</span>
                </button>

                <button
                  onClick={readingContext.onJumpComments}
                  className="px-3 py-1.5 rounded-full text-xs font-medium text-white/80 flex items-center gap-1.5 hover:bg-white/10 transition"
                >
                  <MessageCircle size={15} />
                  <span>{readingContext.commentsCount}</span>
                </button>

                <button
                  onClick={toggleTheme}
                  aria-label="Toggle dark or light mode"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  className="w-8 h-8 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition"
                >
                  {theme === 'dark' ? <Sun size={14} className="text-amber-300" /> : <Moon size={14} />}
                </button>

                {readingContext.canFollow && (
                  <button
                    onClick={readingContext.onToggleFollow}
                    className="glass-btn glass-btn-sm glass-btn-accent"
                  >
                    {readingContext.isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>

              <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#ff6719] to-[#ffb36b] transition-all duration-100"
                  style={{ width: `${readingContext.progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/"
                onClick={() => setActiveTab('discover')}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full font-serif text-lg font-bold tracking-tight text-white"
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#ff6719] to-[#ff964f] grid place-items-center shadow-md shadow-orange-500/40">
                  <Feather size={14} />
                </span>
                <span>Inkwell</span>
              </Link>

              <div className="w-px h-5 bg-white/15" />

              <nav className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveTab('discover');
                    if (pathname !== '/') router.push('/');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                    pathname === '/' && activeTab === 'discover'
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Compass size={15} />
                  <span className="hidden sm:inline">Discover</span>
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      requireAuth('Sign in to view articles from writers you follow.');
                      return;
                    }
                    setActiveTab('following');
                    if (pathname !== '/') router.push('/');
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                    pathname === '/' && activeTab === 'following'
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Users size={15} />
                  <span className="hidden sm:inline">Following</span>
                </button>

                <button
                  onClick={handleWriteClick}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1.5 transition ${
                    pathname === '/write'
                      ? 'bg-white/15 text-white shadow-inner'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <PenSquare size={15} />
                  <span className="hidden sm:inline">Write</span>
                </button>
              </nav>

              <div className="w-px h-5 bg-white/15" />

              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search articles"
                className="w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition"
              >
                <Search size={15} />
              </button>

              <button
                onClick={toggleTheme}
                aria-label="Toggle dark or light mode"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition"
              >
                {theme === 'dark' ? <Sun size={15} className="text-amber-300" /> : <Moon size={15} />}
              </button>

              {user ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/writer/${user.username}`}
                    className="px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-white/85 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition"
                  >
                    <UserIcon size={15} />
                    <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/10 hover:bg-white/20 grid place-items-center transition"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="glass-btn glass-btn-sm glass-btn-accent"
                >
                  Sign in
                </button>
              )}
            </>
          )}
        </header>
      </div>

      {/* Glass-effect Mode Change Indication */}
      {themeNotice && (
        <div className="glass-mode-indicator" role="status" aria-live="polite">
          <span
            className={`w-6 h-6 rounded-full grid place-items-center ${
              themeNotice.mode === 'dark'
                ? 'bg-indigo-500/25 text-indigo-300'
                : 'bg-amber-500/20 text-amber-600'
            }`}
          >
            {themeNotice.mode === 'dark' ? <Moon size={13} /> : <Sun size={13} />}
          </span>
          <span>{themeNotice.label}</span>
        </div>
      )}

      {toastMessage && !themeNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#101218]/90 backdrop-blur-xl text-white text-xs font-medium flex items-center gap-2 shadow-xl border border-white/15">
          <span className="w-2 h-2 rounded-full bg-[#ff6719]" />
          {toastMessage}
        </div>
      )}
    </>
  );
}
