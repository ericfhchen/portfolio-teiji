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

  const [works, allTags] = await Promise.all([
    client.fetch(query, params),
    client.fetch(allTagsQuery, { section }),
  ]);

  // Flatten gallery items into feed items
  const feedItems: FeedItem[] = [];

  works.forEach((work: any) => {
    if (work.gallery && work.gallery.length > 0) {
      work.gallery.forEach((image: any, index: number) => {
        feedItems.push({
          _id: `${work._id}-${index}`,
          src: getImageUrl(image, 800),
          alt: image.alt || '',
          lqip: image.lqip || '',
          parentSlug: work.slug,
          parentTitle: work.title,
          parentTags: work.tags || [],
          index,
        });
      });
    }
  });

  return { feedItems, allTags: allTags || [] };
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
        <Grid items={feedItems} allTags={allTags} section={params.section} variant="index" />
        {searchParams.item && (
          <Lightbox items={feedItems} section={params.section} />
        )}
      </div>
    </>
  );
}