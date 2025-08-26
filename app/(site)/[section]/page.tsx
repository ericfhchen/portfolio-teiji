import { client } from '@/lib/sanity.client';
import { featuredWorksQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import Link from 'next/link';
import Grid from '@/components/Grid';
import { FeedItem } from '@/sanity/schema';
import GridLines from '@/components/GridLines';

interface PageProps {
  params: { section: string };
}

async function getFeaturedData(section: string) {
  const works = await client.fetch(featuredWorksQuery, { section });
  return works;
}

export async function generateMetadata({ params }: { params: { section: string } }) {
  return {
    title: `${params.section.charAt(0).toUpperCase() + params.section.slice(1)} - Tei-ji`,
  };
}

export default async function SectionPage({ params }: PageProps) {
  const featured = await getFeaturedData(params.section);

  // Transform featured works into FeedItem[] compatible with Grid
  const feedItems: FeedItem[] = featured.map((work: any, idx: number) => ({
    _id: work._id,
    src: getImageUrl(work.featuredImage, 800),
    alt: work.featuredImage?.alt || '',
    lqip: work.featuredImage?.lqip || '',
    parentSlug: work.slug,
    parentTitle: work.title,
    parentTags: work.tags || [],
    index: idx,
  }));

  return (
    <>
      <GridLines type="home" />
      <div className="relative z-10 mx-auto max-h-screen">
        <h1 className="sr-only">{params.section}</h1>

        {feedItems.length > 0 && (
          <Grid items={feedItems} allTags={[]} section={params.section} variant="home" />
        )}

        
      </div>
    </>
  );
}