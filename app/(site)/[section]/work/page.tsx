import { client } from '@/lib/sanity.client';
import { workPageQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import { getSiteSettings } from '@/lib/utils';
import { FeedItem } from '@/sanity/schema';
import Grid from '@/components/Grid';
import GridLines from '@/components/GridLines';

async function getWorkData(section: string) {
  const featured = await client.fetch(workPageQuery, { section });

  // Helper function to process media item
  const processMediaItem = (mediaItem: any) => {
    if (!mediaItem) return null;
    
    const isVideo = mediaItem.mediaType === 'video';
    let src = '';
    let lqip = '';
    let alt = '';
    let videoData = null;
    
    if (isVideo) {
      videoData = mediaItem.video;
      // Use poster image if available, otherwise use MUX thumbnail
      if (videoData?.poster) {
        src = getImageUrl(videoData.poster, 800);
        lqip = videoData.poster.lqip || '';
        alt = videoData.poster.alt || '';
      } else if (videoData?.asset?.asset?.playbackId) {
        // Fallback to MUX thumbnail - only if playbackId exists
        src = `https://image.mux.com/${videoData.asset.asset.playbackId}/thumbnail.jpg`;
        alt = mediaItem.alt || '';
      } else if (videoData?.asset?.playbackId) {
        // Alternative structure
        src = `https://image.mux.com/${videoData.asset.playbackId}/thumbnail.jpg`;
        alt = mediaItem.alt || '';
      } else {
        // No poster and no playbackId - use empty src
        src = '';
        alt = mediaItem.alt || '';
      }
    } else if (mediaItem.mediaType === 'image' && mediaItem.image) {
      src = getImageUrl(mediaItem.image, 800);
      lqip = mediaItem.image.lqip || '';
      alt = mediaItem.image.alt || '';
    }
    
    return {
      src,
      alt: alt || mediaItem.alt || '',
      lqip,
      mediaType: isVideo ? ('video' as const) : ('image' as const),
      videoData,
    };
  };

  // Transform featured works into FeedItem[] compatible with Grid
  const feedItems: FeedItem[] = featured.map((work: any, idx: number) => {
    const coverImage = work.coverImage;
    const staticMedia = processMediaItem(coverImage);
    const hoverMedia = processMediaItem(work.hoverMedia);
    
    return {
      _id: work._id,
      mediaType: staticMedia?.mediaType || 'image',
      src: staticMedia?.src || '',
      alt: staticMedia?.alt || '',
      lqip: staticMedia?.lqip || '',
      parentSlug: work.slug,
      parentTitle: work.title,
      parentTags: work.tags || [],
      index: idx,
      year: work.year,
      medium: work.medium,
      description: work.description,
      hoverTextTop: work.hoverTextTop,
      hoverTextBottom: work.hoverTextBottom,
      // Video-specific fields
      ...(staticMedia?.videoData && {
        playbackId: staticMedia.videoData?.asset?.asset?.playbackId || staticMedia.videoData?.asset?.playbackId,
        poster: staticMedia.videoData?.poster ? getImageUrl(staticMedia.videoData.poster, 800) : undefined,
        controls: staticMedia.videoData?.controls ?? false,
        videoData: staticMedia.videoData,
      }),
      // Hover media
      hoverMedia: hoverMedia ? {
        src: hoverMedia.src,
        alt: hoverMedia.alt,
        lqip: hoverMedia.lqip,
        mediaType: hoverMedia.mediaType,
        videoData: hoverMedia.videoData,
      } : undefined,
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
  const siteSettings = await getSiteSettings();
  const siteTitle = siteSettings?.title || 'Tei-ji';
  
  return {
    title: `${section.charAt(0).toUpperCase() + section.slice(1)} — Work — ${siteTitle}`,
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
        <div className="pt-20 pb-8 min-h-screen h-full flex items-center justify-center">
          
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