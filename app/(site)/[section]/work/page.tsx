import { client } from '@/lib/sanity.client';
import { workPageQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import { FeedItem } from '@/sanity/schema';
import Grid from '@/components/Grid';
import GridLines from '@/components/GridLines';

async function getWorkData(section: string) {
  const featured = await client.fetch(workPageQuery, { section });

  // Transform featured works into FeedItem[] compatible with Grid
  const feedItems: FeedItem[] = featured.map((work: any, idx: number) => {
    const coverImage = work.coverImage;
    const isVideo = coverImage?.mediaType === 'video';
    
    // For images, use the image directly; for videos, use poster if available
    let src = '';
    let lqip = '';
    let alt = '';
    
    if (isVideo) {
      const videoData = coverImage.video;
      // Use poster image if available, otherwise use MUX thumbnail
      if (videoData?.poster) {
        src = getImageUrl(videoData.poster, 800);
        lqip = videoData.poster.lqip || '';
        alt = videoData.poster.alt || '';
      } else if (videoData?.asset?.playbackId) {
        // Fallback to MUX thumbnail - only if playbackId exists
        src = `https://image.mux.com/${videoData.asset.playbackId}/thumbnail.jpg`;
        alt = coverImage.alt || '';
      } else {
        // No poster and no playbackId - use empty src
        src = '';
        alt = coverImage.alt || '';
      }
    } else if (coverImage?.mediaType === 'image' && coverImage.image) {
      src = getImageUrl(coverImage.image, 800);
      lqip = coverImage.image.lqip || '';
      alt = coverImage.image.alt || '';
    }
    
    return {
      _id: work._id,
      mediaType: isVideo ? ('video' as const) : ('image' as const),
      src,
      alt: alt || coverImage?.alt || '',
      lqip,
      parentSlug: work.slug,
      parentTitle: work.title,
      parentTags: work.tags || [],
      index: idx,
      year: work.year,
      medium: work.medium,
      description: work.description,
      // Video-specific fields
      ...(isVideo && {
        playbackId: coverImage.video?.asset?.playbackId,
        poster: coverImage.video?.poster ? getImageUrl(coverImage.video.poster, 800) : undefined,
        displayMode: coverImage.video?.displayMode || 'thumbnail',
        controls: coverImage.video?.controls ?? false,
      }),
    };
  });

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
              section={section} 
              variant="work" 
            />
          ) : (
            <div className="text-centerpy-12">
              <p className="text-muted">No featured works found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}