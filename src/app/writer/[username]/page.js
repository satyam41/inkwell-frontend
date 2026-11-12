import React from 'react';
import WriterClient from '../../../components/WriterClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function fetchWriterForSEO(username) {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(username)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const data = await fetchWriterForSEO(params.username);
  if (!data?.profile) {
    return {
      title: 'Writer Not Found',
      description: 'This publication could not be found on Inkwell.',
    };
  }

  const { profile } = data;
  return {
    title: `${profile.publicationName} by ${profile.name}`,
    description: profile.bio || `Read essays from ${profile.name} on Inkwell.`,
    alternates: {
      canonical: `/writer/${profile.username}`,
    },
    openGraph: {
      type: 'profile',
      title: `${profile.publicationName} — ${profile.name}`,
      description: profile.bio || `Read essays from ${profile.name} on Inkwell.`,
      url: `${SITE_URL}/writer/${profile.username}`,
    },
  };
}

export default async function WriterProfilePage({ params }) {
  const data = await fetchWriterForSEO(params.username);

  const jsonLd = data?.profile
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: data.profile.name,
          alternateName: data.profile.username,
          description: data.profile.bio,
          url: `${SITE_URL}/writer/${data.profile.username}`,
        },
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
      <WriterClient username={params.username} initialData={data} />
    </>
  );
}
