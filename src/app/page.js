'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, PenSquare, Compass, UserPlus, Check } from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/ArticleCard';

const TOPICS = ['all', 'technology', 'design', 'culture', 'media', 'writing', 'ai'];

export default function HomePage() {
  const router = useRouter();
  const { user, requireAuth, activeTab, setActiveTab, searchQuery, showToast } = useApp();

  const [selectedTag, setSelectedTag] = useState('all');
  const [articles, setArticles] = useState([]);
  const [writers, setWriters] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesRes, writersRes] = await Promise.all([
        api.listArticles({
          tab: activeTab,
          tag: selectedTag === 'all' ? '' : selectedTag,
          search: searchQuery,
        }),
        api.getSuggestedWriters(),
      ]);
      setArticles(articlesRes.articles || []);
      setWriters(writersRes.writers || []);
    } catch (err) {
      showToast(err.message || 'Could not load feed');
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedTag, searchQuery, showToast]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleToggleLike = async (articleId) => {
    if (!requireAuth('Sign in to like articles and support your favorite writers.')) return;
    try {
      const res = await api.toggleLike(articleId);
      setArticles((prev) =>
        prev.map((a) =>
          a.id === articleId ? { ...a, isLiked: res.liked, likesCount: res.likesCount } : a
        )
      );
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleToggleFollow = async (authorId) => {
    if (!requireAuth('Sign in to follow writers and build your personal reading feed.')) return;
    try {
      const res = await api.toggleFollow(authorId);
      setArticles((prev) =>
        prev.map((a) =>
          a.author?.id === authorId
            ? {
                ...a,
                author: {
                  ...a.author,
                  isFollowing: res.following,
                  followersCount: res.followersCount,
                },
              }
            : a
        )
      );
      setWriters((prev) =>
        prev.map((w) =>
          w.id === authorId
            ? { ...w, isFollowing: res.following, followersCount: res.followersCount }
            : w
        )
      );
      showToast(res.following ? 'Following writer' : 'Unfollowed writer');
    } catch (err) {
      showToast(err.message);
    }
  };

  const featured = articles[0];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative rounded-[28px] p-7 sm:p-11 mb-9 border border-white/90 dark:border-white/10 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[1.35fr_0.9fr] gap-8 items-center bg-gradient-to-br from-white/90 via-[#faf6f0]/85 to-orange-50/70 dark:from-[#161924] dark:via-[#12151e] dark:to-[#1d1718]">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-[#e5560d] dark:text-orange-400 text-xs font-semibold tracking-wide mb-4">
            <Sparkles size={13} /> Independent Publishing Platform
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.08] tracking-tight mb-3.5">
            Where independent minds publish.
          </h1>
          <p className="text-base text-[#555866] dark:text-slate-300 max-w-xl mb-6">
            Read thoughtful long-form essays freely. Sign in to publish with rich images and
            video, follow your favorite writers, and join the conversation.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              className="glass-btn glass-btn-accent"
              onClick={() => {
                if (requireAuth('Sign in to start your publication and write an article.')) {
                  router.push('/write');
                }
              }}
            >
              <PenSquare size={16} /> Start Writing
            </button>
            <button
              className="glass-btn"
              onClick={() => {
                setActiveTab('discover');
                document.getElementById('feed-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Compass size={16} /> Explore Essays
            </button>
          </div>
        </div>

        <div className="bg-white/65 dark:bg-white/5 backdrop-blur-xl border border-white/90 dark:border-white/10 rounded-2xl p-6 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#e5560d] dark:text-orange-400 mb-2">
            {featured ? 'Featured Dispatch' : 'Reader-First Design'}
          </div>
          {featured ? (
            <Link href={`/article/${featured.slug || featured.id}`} className="block group">
              <h3 className="font-serif text-2xl font-semibold leading-snug mb-2 group-hover:text-[#e5560d] transition">
                {featured.title}
              </h3>
              <p className="text-sm text-[#555866] dark:text-slate-300 line-clamp-3 mb-4">
                {featured.excerpt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{featured.author?.name}</span>
                <span className="glass-btn glass-btn-sm glass-btn-dark">Read Essay →</span>
              </div>
            </Link>
          ) : (
            <p className="text-sm text-[#555866] dark:text-slate-300">
              No articles published yet. Be the first writer to launch a publication on Inkwell.
            </p>
          )}
        </div>
      </section>

      {/* Topic Pills & Feed Tabs */}
      <div id="feed-section" className="flex flex-wrap items-center justify-between gap-3.5 mb-7">
        <div className="flex items-center gap-2 flex-wrap">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTag(topic)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition ${
                selectedTag === topic
                  ? 'bg-[#14151a] text-white border-[#14151a] dark:bg-white dark:text-[#14151a] dark:border-white'
                  : 'bg-white/75 dark:bg-white/5 backdrop-blur-md text-[#555866] dark:text-slate-300 border-black/10 dark:border-white/10 hover:border-black/25 dark:hover:border-white/25'
              }`}
            >
              {topic === 'all' ? 'All Topics' : `#${topic}`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            className={`glass-btn glass-btn-sm ${activeTab === 'discover' ? 'glass-btn-dark' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            Discover
          </button>
          <button
            className={`glass-btn glass-btn-sm ${activeTab === 'following' ? 'glass-btn-dark' : ''}`}
            onClick={() => {
              if (!user) {
                requireAuth('Sign in to see articles from writers you follow.');
                return;
              }
              setActiveTab('following');
            }}
          >
            Following
          </button>
        </div>
      </div>

      {/* Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        <div className="flex flex-col gap-5">
          {loading ? (
            <div className="bg-white/80 dark:bg-[#161922]/80 rounded-[22px] p-10 text-center text-sm text-[#555866] dark:text-slate-300">
              Loading publications...
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-white/85 dark:bg-[#161922]/85 rounded-[22px] p-12 text-center border border-white dark:border-white/10 shadow-sm">
              <h3 className="font-serif text-2xl font-semibold mb-2">
                {activeTab === 'following'
                  ? 'Your Following feed is quiet'
                  : 'No matching articles found'}
              </h3>
              <p className="text-sm text-[#555866] dark:text-slate-300 mb-5">
                {activeTab === 'following'
                  ? 'Follow a few writers from the sidebar or Discover tab to see their new essays here.'
                  : 'Try another topic or publish the first essay on this subject.'}
              </p>
              <button
                className="glass-btn glass-btn-accent"
                onClick={() => {
                  if (activeTab === 'following') {
                    setActiveTab('discover');
                  } else if (requireAuth('Sign in to publish an article.')) {
                    router.push('/write');
                  }
                }}
              >
                {activeTab === 'following' ? 'Browse Discover' : 'Write an Article'}
              </button>
            </div>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onToggleLike={handleToggleLike}
                onToggleFollow={handleToggleFollow}
              />
            ))
          )}
        </div>

        {/* Writers Sidebar */}
        <aside>
          <div className="bg-white/85 dark:bg-[#161922]/85 backdrop-blur-md border border-white dark:border-white/10 rounded-[22px] p-5 shadow-sm">
            <h3 className="font-serif text-xl font-semibold mb-3.5">Writers to Follow</h3>
            {writers.length === 0 ? (
              <p className="text-sm text-[#848899] dark:text-slate-400">
                New writers will appear here as they join Inkwell.
              </p>
            ) : (
              writers.map((writer) => (
                <div
                  key={writer.id}
                  className="flex items-center justify-between gap-2.5 py-2.5 border-b border-black/5 dark:border-white/10 last:border-b-0 last:pb-0"
                >
                  <Link
                    href={`/writer/${writer.username}`}
                    className="flex items-center gap-2.5 min-w-0"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white font-bold text-xs grid place-items-center overflow-hidden shrink-0">
                      {writer.avatarUrl ? (
                        <img
                          src={resolveMediaUrl(writer.avatarUrl)}
                          alt={writer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        writer.name[0].toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">{writer.name}</div>
                      <div className="text-xs text-[#848899] dark:text-slate-400 truncate">
                        {writer.publicationName}
                      </div>
                    </div>
                  </Link>

                  <button
                    className={`glass-btn glass-btn-sm shrink-0 ${
                      writer.isFollowing ? 'glass-btn-dark' : ''
                    }`}
                    onClick={() => handleToggleFollow(writer.id)}
                  >
                    {writer.isFollowing ? <Check size={13} /> : <UserPlus size={13} />}
                    {writer.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
