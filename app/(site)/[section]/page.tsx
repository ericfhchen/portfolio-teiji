import { client } from '@/lib/sanity.client';
import { featuredWorksQuery, siteSettingsQuery } from '@/lib/queries'; // Use the existing query
import { getImageUrl } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import Slideshow from '@/components/Slideshow';
import { FeedItem } from '@/sanity/schema';
import GridLines from '@/components/GridLines';

async function getFeaturedData(section: string) {
  return client.fetch(featuredWorksQuery, { section });
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const { section } = await params;
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  const siteTitle = settings?.title || 'Teiji';
  
  return {
    title: {
      absolute: `${section.charAt(0).toUpperCase() + section.slice(1)} — ${siteTitle}`,
    },
  };
}

export default async function SectionPage({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const { section } = await params;
  const featured = await getFeaturedData(section);

  // Add null checking for the featured data
  if (!featured || !Array.isArray(featured)) {
    console.error('No featured works found or invalid data:', featured);
    return (
      <div className="-mb-16">
        <GridLines type="home" />
        <div className="relative z-10">
          <h1 className="sr-only">{section}</h1>
          <div className="text-center py-12">
            <p className="text-muted">No featured works available.</p>
          </div>
        </div>
      </div>
    );
  }

   // Transform featured works into FeedItem[] compatible with Grid
   const feedItems: FeedItem[] = featured.flatMap((work: any, idx: number) => {
    const featuredImage = work.featuredImage;
    const isVideo = featuredImage?.mediaType === 'video';
    
    if (isVideo && featuredImage?.video) {
      // Handle video media type
      const video = featuredImage.video;
      const playbackId = getPlaybackId(video);
      
      // For videos, use MUX thumbnail as fallback if no poster
      let posterSrc = '';
      if (video.poster) {
        posterSrc = getImageUrl(video.poster, 800);
      } else if (playbackId) {
        // Use MUX thumbnail as fallback poster
        posterSrc = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=800&fit_mode=preserve`;
      }
      
      const feedItem: FeedItem = {
        _id: work._id,
        mediaType: 'video' as const,
        src: posterSrc, // Will be empty only if no poster and no playbackId
        alt: video.poster?.alt || featuredImage.alt || '',
        lqip: video.poster?.lqip || '',
        parentSlug: work.slug,
        parentTitle: work.title,
        parentTags: work.tags || [],
        description: work.description,
        index: idx,
        playbackId: playbackId || undefined,
        controls: video.controls,
        hoverTextTop: work.hoverTextTop,
        hoverTextBottom: work.hoverTextBottom,
      };
      return [feedItem];
    } else if (featuredImage?.image) {
      // Handle image media type
      const feedItem: FeedItem = {
        _id: work._id,
        mediaType: 'image' as const,
        src: getImageUrl(featuredImage.image, 800),
        alt: featuredImage.image.alt || featuredImage.alt || '',
        lqip: featuredImage.image.lqip || '',
        parentSlug: work.slug,
        parentTitle: work.title,
        parentTags: work.tags || [],
        description: work.description,
        index: idx,
        hoverTextTop: work.hoverTextTop,
        hoverTextBottom: work.hoverTextBottom,
      };
      return [feedItem];
    } else {
      // Fallback for missing media - return empty array to skip this item
      return [];
    }
  });

  return (
    <div className="-mb-16 max-md:fixed max-md:inset-0 max-md:overflow-hidden">
      <GridLines type="home" />
      <div className="relative z-10">
        <h1 className="sr-only">{section}</h1>

        {feedItems.length > 0 && (
          <Slideshow items={feedItems} section={section} />
        )}

        
      </div>
    </div>
  );
}