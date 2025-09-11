import '@/styles/globals.css';
import { client } from '@/lib/sanity.client';
import { siteSettingsQuery } from '@/lib/queries';
import { SiteSettings } from '@/lib/types';
import { Metadata } from 'next';

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  const title = settings?.title || 'Teiji Portfolio';
  const description = settings?.description || 'Art and Design Portfolio';
  const keywords = settings?.keywords || [];
  const author = settings?.seo?.author;
  const twitterHandle = settings?.seo?.twitterHandle;
  const siteUrl = settings?.seo?.siteUrl;
  
  const metadata: Metadata = {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    creator: author,
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: title,
      images: settings?.ogImage?.url ? [
        {
          url: settings.ogImage.url,
          alt: settings.ogImage.alt || title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: twitterHandle ? `@${twitterHandle}` : undefined,
      images: settings?.ogImage?.url ? [settings.ogImage.url] : undefined,
    },
    icons: settings?.favicon?.url ? {
      icon: settings.favicon.url,
      shortcut: settings.favicon.url,
      apple: settings.favicon.url,
    } : undefined,
    viewport: {
      width: 'device-width',
      initialScale: 1,
      userScalable: false,
    },
    other: {
      'theme-color': settings?.themeColors?.art || '#ffffff',
      'screen-orientation': 'portrait',
    },
  };
  
  return metadata;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}