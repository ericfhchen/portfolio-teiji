import { notFound } from 'next/navigation';
import Header from '@/components/Header';

const validSections = ['art', 'design'] as const;
type Section = typeof validSections[number];

function isValidSection(section: string): section is Section {
  return validSections.includes(section as Section);
}

export async function generateMetadata({
  params,
}: {
  params: { section: string };
}) {
  if (!isValidSection(params.section)) {
    return {};
  }

  const themeColor = params.section === 'art' ? '#ffffff' : '#000000';
  
  return {
    title: `${params.section.charAt(0).toUpperCase() + params.section.slice(1)} - Tei-ji`,
    themeColor,
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
    <html data-theme={params.section}>
      <body className="bg-var text-var min-h-screen font-gerstner">
        <Header currentSection={params.section} />
        <main>{children}</main>
      </body>
    </html>
  );
}