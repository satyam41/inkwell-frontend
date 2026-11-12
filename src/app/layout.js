import { Inter, Newsreader } from 'next/font/google';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import DynamicIsland from '../components/DynamicIsland';
import AuthModal from '../components/AuthModal';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const newsreader = Newsreader({ subsets: ['latin'], variable: '--font-newsreader' });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Inkwell — Independent Writing, Essays & Publications',
    template: '%s | Inkwell',
  },
  description:
    'Discover and read independent essays, newsletters, and multimedia stories on Inkwell. Follow writers, join discussions, and publish your own articles.',
  keywords: [
    'independent publishing',
    'substack alternative',
    'newsletters',
    'essays',
    'articles',
    'writers',
    'blogging platform',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Inkwell',
    title: 'Inkwell — Independent Writing, Essays & Publications',
    description:
      'Read thoughtful long-form essays freely, follow independent writers, and publish with rich images and video.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkwell — Independent Writing & Publications',
    description:
      'Discover independent essays, follow writers, and publish multimedia articles.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="font-sans">
        <AppProvider>
          <DynamicIsland />
          <main className="max-w-6xl mx-auto px-5 pt-6 pb-28 sm:pt-24 sm:pb-20">{children}</main>
          <AuthModal />
        </AppProvider>
      </body>
    </html>
  );
}
