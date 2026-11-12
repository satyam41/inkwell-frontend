const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const staticRoutes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];

  try {
    const res = await fetch(`${API_BASE}/articles?limit=100`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return staticRoutes;

    const data = await res.json();
    const articles = data.articles || [];

    const articleRoutes = articles.map((article) => ({
      url: `${siteUrl}/article/${article.slug || article.id}`,
      lastModified: new Date(article.updatedAt || article.createdAt),
      changeFrequency: 'weekly',
      priority: 0.85,
    }));

    const seenWriters = new Set();
    const writerRoutes = [];
    for (const article of articles) {
      const username = article.author?.username;
      if (username && !seenWriters.has(username)) {
        seenWriters.add(username);
        writerRoutes.push({
          url: `${siteUrl}/writer/${username}`,
          lastModified: new Date(article.updatedAt || article.createdAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    return [...staticRoutes, ...articleRoutes, ...writerRoutes];
  } catch {
    return staticRoutes;
  }
}
