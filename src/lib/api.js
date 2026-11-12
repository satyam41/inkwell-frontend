const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:5000';

export function resolveMediaUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  return `${MEDIA_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function request(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('inkwell_token') : null;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.message || 'Request failed');
    err.status = response.status;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),

  listArticles: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return request(`/articles${qs ? `?${qs}` : ''}`);
  },
  getArticle: (idOrSlug) => request(`/articles/${encodeURIComponent(idOrSlug)}`),
  createArticle: (payload) => request('/articles', { method: 'POST', body: JSON.stringify(payload) }),
  deleteArticle: (idOrSlug) => request(`/articles/${encodeURIComponent(idOrSlug)}`, { method: 'DELETE' }),
  toggleLike: (id) => request(`/articles/${encodeURIComponent(id)}/like`, { method: 'POST' }),

  listComments: (articleId) => request(`/comments/article/${articleId}`),
  createComment: (articleId, content) =>
    request(`/comments/article/${articleId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),

  getSuggestedWriters: () => request('/users/suggested'),
  getUserProfile: (usernameOrId) => request(`/users/${encodeURIComponent(usernameOrId)}`),
  toggleFollow: (userId) => request(`/users/${encodeURIComponent(userId)}/follow`, { method: 'POST' }),

  uploadMedia: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/uploads', { method: 'POST', body: formData });
  },
};
