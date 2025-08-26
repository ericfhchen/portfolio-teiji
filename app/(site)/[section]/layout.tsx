import { notFound } from 'next/navigation';
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
  params: { section: string };
}) {
  if (!isValidSection(params.section)) {
    return {};
  }

  const settings = await getSiteSettings();
  const siteTitle = settings?.title || 'Tei-ji';
  const defaultThemeColor = params.section === 'art' ? '#ffffff' : '#000000';
  const themeColor = settings?.themeColors?.[params.section] || defaultThemeColor;
  
  return {
    title: `${params.section.charAt(0).toUpperCase() + params.section.slice(1)} - ${siteTitle}`,
    other: {
      'theme-color': themeColor,
    },
  };
}

export default function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { section: string };
}) {
  if (!isValidSection(params.section)) {
    notFound();
  }

  return (
    <div data-theme={params.section} className="bg-var text-var min-h-screen">
      <Header currentSection={params.section} />
      <main>{children}</main>
    </div>
  );
}