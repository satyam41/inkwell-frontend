'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Check } from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import { useApp } from '../context/AppContext';
import ArticleCard from './ArticleCard';

export default function WriterClient({ username, initialData = null }) {
  const { user, requireAuth, showToast } = useApp();

  const [profile, setProfile] = useState(initialData?.profile || null);
  const [articles, setArticles] = useState(initialData?.articles || []);
  const [loading, setLoading] = useState(!initialData);

  const loadProfile = useCallback(async () => {
    try {
      const res = await api.getUserProfile(username);
      setProfile(res.profile);
      setArticles(res.articles || []);
    } catch (err) {
      if (!initialData) showToast(err.message || 'Writer not found');
    } finally {
      setLoading(false);
    }
  }, [username, initialData, showToast]);

  useEffect(() => {
    if (username) loadProfile();
  }, [username, loadProfile]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    if (!requireAuth('Sign in to follow this writer.')) return;
    try {
      const res = await api.toggleFollow(profile.id);
      setProfile((prev) => ({
        ...prev,
        isFollowing: res.following,
        followersCount: res.followersCount,
      }));
      showToast(res.following ? `Following ${profile.name}` : 'Unfollowed writer');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleToggleLike = async (articleId) => {
    if (!requireAuth('Sign in to like articles.')) return;
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

  if (loading) {
    return <div className="text-center pt-10 text-sm">Loading publication...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center pt-10">
        <p className="mb-4">Publication not found.</p>
        <Link href="/" className="glass-btn">
          <ArrowLeft size={15} /> Back Home
        </Link>
      </div>
    );
  }

  const isSelf = user && user.id === profile.id;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/" className="glass-btn glass-btn-sm mb-5">
        <ArrowLeft size={14} /> Back to Feed
      </Link>

      <div className="bg-white/85 dark:bg-[#161922]/85 backdrop-blur-md border border-white dark:border-white/10 rounded-[22px] p-6 shadow-sm mb-7">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white font-bold text-2xl grid place-items-center overflow-hidden">
              {profile.avatarUrl ? (
                <img
                  src={resolveMediaUrl(profile.avatarUrl)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.name[0].toUpperCase()
              )}
            </div>
            <div>
              <h1 className="font-serif text-3xl font-semibold leading-tight">
                {profile.publicationName}
              </h1>
              <div className="text-sm text-[#555866] dark:text-slate-300">
                by <strong>{profile.name}</strong> (@{profile.username})
              </div>
              <div className="text-xs text-[#848899] dark:text-slate-400 mt-1">
                {profile.followersCount} Followers · {profile.followingCount} Following ·{' '}
                {articles.length} Published
              </div>
            </div>
          </div>

          {!isSelf && (
            <button
              className={`glass-btn ${
                profile.isFollowing ? 'glass-btn-dark' : 'glass-btn-accent'
              }`}
              onClick={handleToggleFollow}
            >
              {profile.isFollowing ? (
                <>
                  <Check size={15} /> Following
                </>
              ) : (
                <>
                  <UserPlus size={15} /> Follow
                </>
              )}
            </button>
          )}
        </div>

        {profile.bio && (
          <p className="mt-4 text-sm text-[#555866] dark:text-slate-300">{profile.bio}</p>
        )}
      </div>

      <h2 className="font-serif text-2xl font-semibold mb-4">Published Essays</h2>
      <div className="flex flex-col gap-5">
        {articles.length === 0 ? (
          <div className="bg-white/80 dark:bg-[#161922]/80 rounded-2xl p-8 text-center text-sm text-[#848899] dark:text-slate-400">
            No essays published yet.
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
    </div>
  );
}
