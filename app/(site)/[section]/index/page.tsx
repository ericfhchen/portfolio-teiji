import { client } from '@/lib/sanity.client';
import { indexFeedQuery, indexFeedByTagsQuery, allTagsQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import { FeedItem } from '@/sanity/schema';
import Grid from '@/components/Grid';
import Lightbox from '@/components/Lightbox';
import GridLines from '@/components/GridLines';

async function getFeedData(section: string, tags?: string[]) {
  const query = tags && tags.length > 0 ? indexFeedByTagsQuery : indexFeedQuery;
  const params = { section, ...(tags && { tags }) };

  const [indexItems, allTagsRaw] = await Promise.all([
    client.fetch(query, params),
    client.fetch(allTagsQuery, { section }),
  ]);

  // Deduplicate tags - now the query should return unique tag names directly
  // but we'll still filter and dedupe to be safe
  const allTags = Array.from(new Set((allTagsRaw || []).filter(Boolean))).sort();

  // Convert index items to feed items
  const feedItems: FeedItem[] = indexItems.map((item: any, index: number) => ({
    _id: item._id,
    src: getImageUrl(item.image, 800),
    alt: item.image?.alt || '',
    lqip: item.image?.lqip || '',
    parentSlug: item.slug,
    parentTitle: item.title,
    parentTags: item.tags || [],
    year: item.year,
    medium: item.medium,
    description: item.description,
    index,
  }));

  return { feedItems, allTags };
}

export async function generateMetadata({ params }: any) {
  return {
    title: `${params.section.charAt(0).toUpperCase() + params.section.slice(1)} — Index — Tei-ji`,
  };
}

export default async function SectionIndexPage({ params, searchParams }: any) {
  const tags = searchParams.tags?.split(',').filter(Boolean) || [];
  const { feedItems, allTags } = await getFeedData(params.section, tags.length > 0 ? tags : undefined);

  return (
    <>
      <GridLines type="index" />
      <div className="relative z-10">
        <Grid items={feedItems} section={params.section} variant="index" />
        {searchParams.item && (
          <Lightbox items={feedItems} section={params.section} />
        )}
      </div>
    </>
  );
}