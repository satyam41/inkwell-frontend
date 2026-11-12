import React from 'react';
import ArticleClient from '../../../components/ArticleClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchArticleForSEO(slug) {
  try {
    const res = await fetch(`${API_BASE}/articles/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.article || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const article = await fetchArticleForSEO(params.slug);
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'This essay could not be found on Inkwell.',
    };
  }

  const imageUrl = article.coverImage
    ? article.coverImage.startsWith('http')
      ? article.coverImage
      : `${MEDIA_BASE}${article.coverImage}`
    : undefined;

  return {
    title: article.title,
    description: article.subtitle || article.excerpt,
    keywords: article.tags || [],
    authors: article.author ? [{ name: article.author.name }] : [],
    alternates: {
      canonical: `/article/${article.slug || article.id}`,
    },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.subtitle || article.excerpt,
      url: `${SITE_URL}/article/${article.slug || article.id}`,
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author.name] : [],
      tags: article.tags || [],
      ...(imageUrl ? { images: [{ url: imageUrl, alt: article.title }] } : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: article.title,
      description: article.subtitle || article.excerpt,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function ArticlePage({ params }) {
  const article = await fetchArticleForSEO(params.slug);

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.subtitle || article.excerpt,
        datePublished: article.createdAt,
        dateModified: article.updatedAt || article.createdAt,
        author: article.author
          ? {
              '@type': 'Person',
              name: article.author.name,
              url: `${SITE_URL}/writer/${article.author.username}`,
            }
          : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'Inkwell',
        },
        mainEntityOfPage: `${SITE_URL}/article/${article.slug || article.id}`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticleClient slug={params.slug} initialArticle={article} />
    </>
  );
}
