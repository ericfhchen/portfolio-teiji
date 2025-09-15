import { client } from '@/lib/sanity.client';
import { featuredWorksQuery } from '@/lib/queries'; // Use the existing query
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
  return {
    title: `${section.charAt(0).toUpperCase() + section.slice(1)} - Tei-ji`,
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
    
    console.log(`🔍 Processing work: ${work.title}`, { featuredImage, isVideo });
    
    if (isVideo && featuredImage?.video) {
      // Handle video media type
      const video = featuredImage.video;
      const playbackId = getPlaybackId(video); // Use enhanced function
      
      console.log(`🎥 Video data for "${work.title}":`, { playbackId, video });
      
      // For videos, use MUX thumbnail as fallback if no poster
      let posterSrc = '';
      if (video.poster) {
        posterSrc = getImageUrl(video.poster, 800);
        console.log(`📸 Using custom poster: ${posterSrc}`);
      } else if (playbackId) {
        // Use MUX thumbnail as fallback poster
        posterSrc = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=800&fit_mode=preserve`;
        console.log(`📸 Using MUX thumbnail: ${posterSrc}`);
      } else {
        console.error(`❌ No playback ID found for video in work: ${work.title}`);
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
        displayMode: video.displayMode || 'thumbnail',
        controls: video.controls,
      };
      return [feedItem];
    } else if (featuredImage?.image) {
      // Handle image media type
      console.log(`🖼️ Image processing for "${work.title}"`);
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
      };
      return [feedItem];
    } else {
      // Fallback for missing media - return empty array to skip this item
      console.warn(`⚠️ No valid media found for work: ${work.title}`);
      return [];
    }
  });

  console.log(`📋 Final feed items count: ${feedItems.length}`);

  return (
    <div className="-mb-16">
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