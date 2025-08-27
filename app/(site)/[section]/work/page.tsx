import { client } from '@/lib/sanity.client';
import { workPageQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import { FeedItem } from '@/sanity/schema';
import Grid from '@/components/Grid';
import GridLines from '@/components/GridLines';

async function getWorkData(section: string) {
  const featured = await client.fetch(workPageQuery, { section });

  // Transform featured works into FeedItem[] compatible with Grid
  const feedItems: FeedItem[] = featured.map((work: any, idx: number) => ({
    _id: work._id,
    src: getImageUrl(work.coverImage, 800),
    alt: work.coverImage?.alt || '',
    lqip: work.coverImage?.lqip || '',
    parentSlug: work.slug,
    parentTitle: work.title,
    parentTags: work.tags || [],
    index: idx,
    year: work.year,
    medium: work.medium,
    description: work.description,
  }));

  return { feedItems };
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const { section } = await params;
  return {
    title: `${section.charAt(0).toUpperCase() + section.slice(1)} — Work — Tei-ji`,
    themeColor: section === 'design' ? '#000000' : '#ffffff',
  };
}

export default async function WorkPage({ 
  params
}: { 
  params: Promise<{ section: string }>
}) {
  const { section } = await params;
  
  const { feedItems } = await getWorkData(section);

  return (
    <>
      <GridLines type="work" />
      <div className="relative z-10 min-h-screen">
        <div className="py-8 min-h-screen h-full flex items-center justify-center">
          
          {feedItems.length > 0 ? (
            <Grid 
              items={feedItems} 
              allTags={[]} 
              section={section} 
              variant="work" 
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted">No featured works found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}