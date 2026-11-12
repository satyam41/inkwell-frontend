'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, MessageCircle, Trash2, UserPlus, Check, ArrowLeft } from 'lucide-react';
import { api, resolveMediaUrl } from '../lib/api';
import { useApp } from '../context/AppContext';

export default function ArticleClient({ slug, initialArticle = null }) {
  const router = useRouter();
  const { user, requireAuth, setReadingContext, showToast } = useApp();

  const [article, setArticle] = useState(initialArticle);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(!initialArticle);
  const [postingComment, setPostingComment] = useState(false);

  const loadArticle = useCallback(async () => {
    try {
      const res = await api.getArticle(slug);
      setArticle(res.article);
      const commentsRes = await api.listComments(res.article.id);
      setComments(commentsRes.comments || []);
    } catch (err) {
      if (!initialArticle) showToast(err.message || 'Article not found');
    } finally {
      setLoading(false);
    }
  }, [slug, initialArticle, showToast]);

  useEffect(() => {
    if (slug) loadArticle();
  }, [slug, loadArticle]);

  const handleToggleLike = useCallback(async () => {
    if (!article) return;
    if (!requireAuth('Sign in to like this article.')) return;
    try {
      const res = await api.toggleLike(article.id);
      setArticle((prev) => ({ ...prev, isLiked: res.liked, likesCount: res.likesCount }));
    } catch (err) {
      showToast(err.message);
    }
  }, [article, requireAuth, showToast]);

  const handleToggleFollow = useCallback(async () => {
    if (!article?.author) return;
    if (!requireAuth('Sign in to follow this writer.')) return;
    try {
      const res = await api.toggleFollow(article.author.id);
      setArticle((prev) => ({
        ...prev,
        author: { ...prev.author, isFollowing: res.following, followersCount: res.followersCount },
      }));
      showToast(res.following ? `Following ${article.author.name}` : 'Unfollowed writer');
    } catch (err) {
      showToast(err.message);
    }
  }, [article, requireAuth, showToast]);

  useEffect(() => {
    if (!article) {
      setReadingContext(null);
      return;
    }

    const updateProgress = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        docHeight > 0 ? Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100)) : 100;
      const isSelf = user && article.author && user.id === article.author.id;

      setReadingContext({
        title: article.title,
        readTimeMinutes: article.readTimeMinutes,
        progress,
        likesCount: article.likesCount,
        isLiked: article.isLiked,
        commentsCount: article.commentsCount,
        isFollowing: article.author?.isFollowing,
        canFollow: Boolean(article.author && !isSelf),
        onToggleLike: handleToggleLike,
        onToggleFollow: handleToggleFollow,
        onJumpComments: () =>
          document.getElementById('comments-anchor')?.scrollIntoView({ behavior: 'smooth' }),
      });
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateProgress);
      setReadingContext(null);
    };
  }, [article, user, handleToggleLike, handleToggleFollow, setReadingContext]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!requireAuth('Sign in to post a comment on this article.')) return;
    if (!commentText.trim()) return;

    setPostingComment(true);
    try {
      const res = await api.createComment(article.id, commentText.trim());
      setComments((prev) => [res.comment, ...prev]);
      setArticle((prev) => ({ ...prev, commentsCount: res.commentsCount }));
      setCommentText('');
      showToast('Comment posted');
    } catch (err) {
      showToast(err.message);
    } finally {
      setPostingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setArticle((prev) => ({ ...prev, commentsCount: res.commentsCount }));
      showToast('Comment deleted');
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDeleteArticle = async () => {
    if (!window.confirm('Delete this article permanently?')) return;
    try {
      await api.deleteArticle(article.id);
      showToast('Article deleted');
      router.push('/');
    } catch (err) {
      showToast(err.message);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto pt-10 text-center text-sm">Loading essay...</div>;
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto pt-10 text-center">
        <p className="mb-4">Article not found.</p>
        <Link href="/" className="glass-btn">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && article.author && user.id === article.author.id;
  const dateLabel = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-5">
        <Link href="/" className="glass-btn glass-btn-sm">
          <ArrowLeft size={14} /> All Essays
        </Link>
        {isAuthor && (
          <button className="glass-btn glass-btn-sm" onClick={handleDeleteArticle}>
            <Trash2 size={14} /> Delete Article
          </button>
        )}
      </div>

      <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-[1.12] tracking-tight mb-3.5">
        {article.title}
      </h1>
      {article.subtitle && (
        <p className="text-lg sm:text-xl text-[#555866] dark:text-slate-300 mb-6">
          {article.subtitle}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 py-3.5 border-y border-black/10 dark:border-white/10 mb-6">
        <Link href={`/writer/${article.author?.username || ''}`} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 text-white font-bold grid place-items-center overflow-hidden">
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
            <div className="font-semibold text-sm">{article.author?.name}</div>
            <div className="text-xs text-[#848899] dark:text-slate-400">
              {article.author?.publicationName} · {dateLabel} · {article.readTimeMinutes} min read
            </div>
          </div>
        </Link>

        {!isAuthor && article.author && (
          <button
            className={`glass-btn glass-btn-sm ${
              article.author.isFollowing ? 'glass-btn-dark' : 'glass-btn-accent'
            }`}
            onClick={handleToggleFollow}
          >
            {article.author.isFollowing ? (
              <>
                <Check size={14} /> Following
              </>
            ) : (
              <>
                <UserPlus size={14} /> Follow
              </>
            )}
          </button>
        )}
      </div>

      {article.coverImage && (
        <img
          src={resolveMediaUrl(article.coverImage)}
          alt={article.title}
          className="w-full max-h-[440px] object-cover rounded-2xl mb-6"
        />
      )}

      <div className="font-serif text-lg sm:text-[1.2rem] leading-[1.78] text-[#1f2128] dark:text-slate-200 space-y-5">
        {article.content.split(/\n\n+/).map((para, idx) => (
          <p key={idx} className="whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>

      {article.media && article.media.length > 0 && (
        <div className="grid gap-5 my-7">
          {article.media.map((item, idx) => (
            <figure
              key={item._id || idx}
              className="bg-white dark:bg-[#161922] border border-black/10 dark:border-white/10 rounded-2xl overflow-hidden p-2.5"
            >
              {item.type === 'video' ? (
                <video
                  controls
                  preload="metadata"
                  src={resolveMediaUrl(item.url)}
                  className="w-full max-h-[460px] rounded-xl bg-black"
                />
              ) : (
                <img
                  src={resolveMediaUrl(item.url)}
                  alt={item.caption || 'Article media'}
                  className="w-full max-h-[460px] object-contain rounded-xl bg-black/5 dark:bg-black/40"
                />
              )}
              {item.caption && (
                <figcaption className="text-xs text-[#848899] dark:text-slate-400 px-1.5 pt-2">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-8 pt-5 border-t border-black/10 dark:border-white/10">
        <button
          className={`glass-btn ${article.isLiked ? 'glass-btn-accent' : ''}`}
          onClick={handleToggleLike}
        >
          <Heart size={16} fill={article.isLiked ? '#ffffff' : 'none'} />
          <span>{article.likesCount} Likes</span>
        </button>

        <button
          className="glass-btn"
          onClick={() =>
            document.getElementById('comments-anchor')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          <MessageCircle size={16} />
          <span>{article.commentsCount} Comments</span>
        </button>
      </div>

      <section id="comments-anchor" className="mt-11 pt-7 border-t border-black/10 dark:border-white/10">
        <h3 className="font-serif text-2xl font-semibold mb-4">
          Discussion ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              rows={3}
              placeholder="Write a thoughtful comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full p-3.5 rounded-xl border border-black/15 dark:border-white/15 bg-white/85 dark:bg-white/5 text-sm outline-none focus:border-[#ff6719] mb-2.5"
            />
            <button
              type="submit"
              disabled={postingComment || !commentText.trim()}
              className="glass-btn glass-btn-accent"
            >
              {postingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="bg-white/85 dark:bg-[#161922]/85 border border-white dark:border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap mb-6 shadow-sm">
            <div>
              <div className="font-semibold text-sm">Join the conversation</div>
              <div className="text-xs text-[#555866] dark:text-slate-300">
                You can read all articles freely. Sign in to like or comment.
              </div>
            </div>
            <button
              className="glass-btn glass-btn-accent"
              onClick={() => requireAuth('Sign in to comment on this article.')}
            >
              Sign in to Comment
            </button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-sm text-[#848899] dark:text-slate-400">
            No comments yet. Start the discussion above.
          </p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const canDelete =
                user && (comment.author?.id === user.id || article.author?.id === user.id);
              return (
                <div
                  key={comment.id}
                  className="bg-white/80 dark:bg-[#161922]/80 border border-black/10 dark:border-white/10 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-semibold text-sm">
                      {comment.author?.name || 'Reader'}{' '}
                      <span className="font-normal text-xs text-[#848899] dark:text-slate-400">
                        · {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {canDelete && (
                      <button
                        className="glass-btn glass-btn-sm py-1 px-2.5"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-[#14151a] dark:text-slate-200">{comment.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </article>
  );
}
