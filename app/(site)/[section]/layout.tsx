import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import { client } from '@/lib/sanity.client';
import { siteSettingsQuery } from '@/lib/queries';
import { SiteSettings } from '@/lib/types';

const validSections = ['art', 'design'] as const;
type Section = typeof validSections[number];

function isValidSection(section: string): section is Section {
  return validSections.includes(section as Section);
}

async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to fetch site settings:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  
  if (!isValidSection(section)) {
    return {};
  }

  const settings = await getSiteSettings();
  const siteTitle = settings?.title || 'Teiji Portfolio';
  const defaultThemeColor = section === 'art' ? '#ffffff' : '#000000';
  const themeColor = settings?.themeColors?.[section] || defaultThemeColor;
  
  return {
    title: `${section.charAt(0).toUpperCase() + section.slice(1)} - ${siteTitle}`,
    other: {
      'theme-color': themeColor,
    },
  };
}

export default async function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const validatedSection = isValidSection(section) ? section : 'art';

  if (!isValidSection(validatedSection)) {
    notFound();
  }

  return (
    <div data-theme={validatedSection} className="bg-var text-var min-h-screen pb-16">
      <Suspense fallback={<div className="h-16" />}>
        <Header currentSection={validatedSection} />
      </Suspense>
      <main>{children}</main>
    </div>
  );
}