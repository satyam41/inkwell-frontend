'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image as ImageIcon, Video, Upload, X, Send, ArrowLeft } from 'lucide-react';
import { api, resolveMediaUrl } from '../../lib/api';
import { useApp } from '../../context/AppContext';

export default function WritePage() {
  const router = useRouter();
  const { user, requireAuth, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [media, setMedia] = useState([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [publishing, setPublishing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white/85 dark:bg-[#161922]/85 rounded-3xl p-10 text-center border border-white dark:border-white/10 shadow-sm">
        <h1 className="font-serif text-3xl font-semibold mb-2">Sign in to write</h1>
        <p className="text-sm text-[#555866] dark:text-slate-300 mb-6">
          Reading is open to everyone. Sign in to publish essays with images and video.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="glass-btn">
            <ArrowLeft size={15} /> Back Home
          </Link>
          <button
            className="glass-btn glass-btn-accent"
            onClick={() => requireAuth('Sign in to publish your essay.')}
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await api.uploadMedia(file);
      if (res.media.type !== 'image') {
        showToast('Cover must be an image file.');
        return;
      }
      setCoverImage(res.media.url);
      showToast('Cover image uploaded');
    } catch (err) {
      showToast(err.message || 'Cover upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleMediaUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingMedia(true);
    try {
      for (const file of files) {
        const res = await api.uploadMedia(file);
        setMedia((prev) => [
          ...prev,
          {
            type: res.media.type,
            url: res.media.url,
            originalName: res.media.originalName,
            caption: '',
          },
        ]);
      }
      showToast('Media uploaded');
    } catch (err) {
      showToast(err.message || 'Media upload failed');
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || content.trim().length < 20) {
      showToast('Please enter a title and at least 20 characters of content.');
      return;
    }
    setPublishing(true);
    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const res = await api.createArticle({
        title: title.trim(),
        subtitle: subtitle.trim(),
        content: content.trim(),
        coverImage,
        media,
        tags,
      });

      showToast('Article published!');
      router.push(`/article/${res.article.slug || res.article.id}`);
    } catch (err) {
      showToast(err.message || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/90 dark:bg-[#161922]/90 backdrop-blur-md border border-white dark:border-white/10 rounded-[26px] p-7 sm:p-9 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="glass-btn glass-btn-sm">
          <ArrowLeft size={14} /> Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={publishing}
          className="glass-btn glass-btn-accent"
        >
          <Send size={15} /> {publishing ? 'Publishing...' : 'Publish Essay'}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Article Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full bg-transparent border-none outline-none font-serif text-3xl sm:text-4xl font-bold mb-2.5"
        />

        <input
          type="text"
          placeholder="Add a compelling subtitle (optional)..."
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-lg text-[#555866] dark:text-slate-300 mb-5"
        />

        <div className="flex items-center gap-3 flex-wrap mb-5">
          <label className="glass-btn glass-btn-sm cursor-pointer">
            <Upload size={14} />
            {uploadingCover ? 'Uploading cover...' : 'Upload Cover Image'}
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </label>

          <label className="glass-btn glass-btn-sm cursor-pointer">
            <ImageIcon size={14} />
            <Video size={14} />
            {uploadingMedia ? 'Uploading media...' : 'Attach Image or Video'}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleMediaUpload}
              className="hidden"
            />
          </label>
        </div>

        {coverImage && (
          <div className="relative mb-5">
            <img
              src={resolveMediaUrl(coverImage)}
              alt="Cover preview"
              className="w-full max-h-80 object-cover rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setCoverImage('')}
              className="glass-btn glass-btn-sm glass-btn-dark absolute top-3 right-3"
            >
              <X size={14} /> Remove Cover
            </button>
          </div>
        )}

        <textarea
          placeholder="Tell your story... (Use blank lines between paragraphs)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full min-h-[320px] border border-black/10 dark:border-white/10 rounded-2xl p-4 font-serif text-lg leading-relaxed bg-[#faf8f5]/70 dark:bg-white/5 outline-none focus:border-[#ff6719] focus:bg-white dark:focus:bg-white/10"
        />

        {media.length > 0 && (
          <div className="mt-6">
            <div className="font-semibold text-sm mb-2.5">
              Attached Images & Videos ({media.length})
            </div>
            <div className="grid gap-3.5">
              {media.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl p-3"
                >
                  {item.type === 'video' ? (
                    <video
                      controls
                      src={resolveMediaUrl(item.url)}
                      className="w-full max-h-80 rounded-xl bg-black"
                    />
                  ) : (
                    <img
                      src={resolveMediaUrl(item.url)}
                      alt={item.originalName}
                      className="w-full max-h-80 object-contain rounded-xl bg-black/5 dark:bg-black/40"
                    />
                  )}
                  <div className="flex gap-2 mt-2.5">
                    <input
                      type="text"
                      placeholder="Add a caption (optional)..."
                      value={item.caption}
                      onChange={(e) =>
                        setMedia((prev) =>
                          prev.map((m, i) => (i === idx ? { ...m, caption: e.target.value } : m))
                        )
                      }
                      className="flex-1 px-3 py-2 rounded-xl border border-black/10 dark:border-white/15 bg-transparent text-sm outline-none"
                    />
                    <button
                      type="button"
                      className="glass-btn glass-btn-sm"
                      onClick={() => setMedia((prev) => prev.filter((_, i) => i !== idx))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="block text-xs font-semibold text-[#555866] dark:text-slate-300 mb-1.5">
            Topics / Tags (comma-separated)
          </label>
          <input
            type="text"
            placeholder="technology, design, writing"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-white/5 text-sm outline-none focus:border-[#ff6719]"
          />
        </div>
      </form>
    </div>
  );
}
