'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Video, Image as ImageIcon, UserPlus, Check } from 'lucide-react';
import { resolveMediaUrl } from '../lib/api';
import { useApp } from '../context/AppContext';

export default function ArticleCard({ article, onToggleLike, onToggleFollow }) {
  const router = useRouter();
  const { user } = useApp();

  const isSelf = user && article.author && user.id === article.author.id;
  const hasVideo = (article.media || []).some((m) => m.type === 'video');
  const hasImages = (article.media || []).some((m) => m.type === 'image');

  const dateLabel = new Date(article.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const targetHref = `/article/${article.slug || article.id}`;

  return (
    <article
      onClick={() => router.push(targetHref)}
      className="bg-white/85 dark:bg-[#161922]/85 backdrop-blur-md border border-white dark:border-white/10 rounded-[22px] p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (article.author?.username) router.push(`/writer/${article.author.username}`);
          }}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white font-bold text-sm grid place-items-center overflow-hidden shrink-0">
            {article.author?.avatarUrl ? (
              <img
                src={resolveMediaUrl(article.author.avatarUrl)}
                alt={article.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              (article.author?.name || 'W')[0].toUpperCase()
            )}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">
              {article.author?.name || 'Independent Writer'}
            </div>
            <div className="text-xs text-[#848899] dark:text-slate-400">
              {article.author?.publicationName} · {dateLabel}
            </div>
          </div>
        </div>

        {!isSelf && article.author && (
          <button
            className={`glass-btn glass-btn-sm ${
              article.author.isFollowing ? 'glass-btn-dark' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFollow(article.author.id);
            }}
          >
            {article.author.isFollowing ? (
              <>
                <Check size={13} /> Following
              </>
            ) : (
              <>
                <UserPlus size={13} /> Follow
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-start">
        <div>
          <h3 className="font-serif text-2xl font-semibold leading-snug tracking-tight mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-[#555866] dark:text-slate-300 line-clamp-2 mb-3">
            {article.excerpt}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {(article.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#555866] dark:text-slate-300"
              >
                #{tag}
              </span>
            ))}
            {hasVideo && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#e5560d] dark:text-orange-400">
                <Video size={13} /> Video
              </span>
            )}
            {!hasVideo && hasImages && (
              <span className="inline-flex items-center gap-1 text-xs text-[#848899] dark:text-slate-400">
                <ImageIcon size={13} /> Media
              </span>
            )}
          </div>
        </div>

        {article.coverImage && (
          <img
            src={resolveMediaUrl(article.coverImage)}
            alt={article.title}
            className="w-full sm:w-44 h-44 sm:h-28 rounded-2xl object-cover bg-[#ece8e1] dark:bg-slate-800"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 mt-4 border-t border-black/5 dark:border-white/10">
        <div className="flex items-center gap-2">
          <button
            className={`glass-btn glass-btn-sm ${article.isLiked ? 'glass-btn-accent' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLike(article.id);
            }}
          >
            <Heart size={14} fill={article.isLiked ? '#ffffff' : 'none'} />
            <span>{article.likesCount}</span>
          </button>

          <button
            className="glass-btn glass-btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`${targetHref}#comments-anchor`);
            }}
          >
            <MessageCircle size={14} />
            <span>{article.commentsCount}</span>
          </button>
        </div>

        <span className="text-xs text-[#848899] dark:text-slate-400">
          {article.readTimeMinutes} min read
        </span>
      </div>
    </article>
  );
}
