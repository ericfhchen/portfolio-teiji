import { client } from '@/lib/sanity.client';
import { indexFeedQuery, indexFeedByTagsQuery, allTagsQuery } from '@/lib/queries';
import { getImageUrl } from '@/lib/image';
import { FeedItem } from '@/sanity/schema';
import Grid from '@/components/Grid';
import Lightbox from '@/components/Lightbox';
import GridLines from '@/components/GridLines';
import Filters from '@/components/Filters';

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
  const feedItems: FeedItem[] = indexItems.flatMap((item: any) => {
    const results: FeedItem[] = [];
    
    // Helper function to create a feed item from media data
    const createFeedItem = (mediaData: any, index: number, isGalleryItem = false) => {
      const isVideo = mediaData?.mediaType === 'video';
      
      // For images, use the image directly; for videos, use poster if available
      let src = '';
      let lqip = '';
      let alt = '';
      
      if (isVideo) {
        const videoData = mediaData.video;
        // Use poster image if available, otherwise use MUX thumbnail
        if (videoData?.poster) {
          src = getImageUrl(videoData.poster, 800);
          lqip = videoData.poster.lqip || '';
          alt = videoData.poster.alt || '';
        } else if (videoData?.asset?.asset?.playbackId) {
          // Fallback to MUX thumbnail - only if playbackId exists
          src = `https://image.mux.com/${videoData.asset.asset.playbackId}/thumbnail.jpg`;
          alt = mediaData.alt || '';
        } else {
          // No poster and no playbackId - use empty src
          src = '';
          alt = mediaData.alt || '';
        }
      } else if (mediaData?.mediaType === 'image' && mediaData.image) {
        src = getImageUrl(mediaData.image, 800);
        lqip = mediaData.image.lqip || '';
        alt = mediaData.image.alt || '';
      }
      
      const feedItem: FeedItem = {
        _id: `${item._id}${isGalleryItem ? `-gallery-${index}` : ''}`,
        mediaType: isVideo ? ('video' as const) : ('image' as const),
        src,
        alt: alt || mediaData?.alt || '',
        lqip,
        parentSlug: item.slug,
        parentTitle: item.title,
        parentTags: item.tags || [],
        index,
        year: item.year,
        medium: item.medium,
        description: item.description,
        // Video-specific fields
        ...(isVideo && {
          playbackId: mediaData.video?.asset?.asset?.playbackId,
          poster: mediaData.video?.poster ? getImageUrl(mediaData.video.poster, 800) : undefined,
          displayMode: mediaData.video?.displayMode || 'thumbnail',
          controls: mediaData.video?.controls ?? false,
          videoData: mediaData.video, // Store raw video data for VideoPlayer
        }),
      };

      // Add gallery support
      if (!isGalleryItem && item.gallery && item.gallery.length > 0) {
        const galleryItems = item.gallery.map((galleryMedia: any, galleryIndex: number) => {
          const galleryIsVideo = galleryMedia?.mediaType === 'video';
          
          let gallerySrc = '';
          let galleryLqip = '';
          let galleryAlt = '';
          
          if (galleryIsVideo) {
            const galleryVideoData = galleryMedia.video;
            if (galleryVideoData?.poster) {
              gallerySrc = getImageUrl(galleryVideoData.poster, 800);
              galleryLqip = galleryVideoData.poster.lqip || '';
              galleryAlt = galleryVideoData.poster.alt || '';
            } else if (galleryVideoData?.asset?.asset?.playbackId) {
              gallerySrc = `https://image.mux.com/${galleryVideoData.asset.asset.playbackId}/thumbnail.jpg`;
              galleryAlt = galleryMedia.alt || '';
            }
          } else if (galleryMedia?.mediaType === 'image' && galleryMedia.image) {
            gallerySrc = getImageUrl(galleryMedia.image, 800);
            galleryLqip = galleryMedia.image.lqip || '';
            galleryAlt = galleryMedia.image.alt || '';
          }
          
          return {
            mediaType: galleryIsVideo ? ('video' as const) : ('image' as const),
            src: gallerySrc,
            alt: galleryAlt || galleryMedia?.alt || '',
            lqip: galleryLqip,
            // Video-specific fields
            ...(galleryIsVideo && {
              playbackId: galleryMedia.video?.asset?.asset?.playbackId,
              poster: galleryMedia.video?.poster ? getImageUrl(galleryMedia.video.poster, 800) : undefined,
              displayMode: galleryMedia.video?.displayMode || 'thumbnail',
              controls: galleryMedia.video?.controls ?? false,
              videoData: galleryMedia.video,
            }),
          };
        });
        
        feedItem.gallery = galleryItems;
      }

      return feedItem;
    };

    // Create main feed item from featuredMedia
    if (item.featuredMedia) {
      results.push(createFeedItem(item.featuredMedia, results.length));
    }
    
    return results;
  });

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
      <Filters tags={allTags as string[]} section={params.section} />
      <div className="relative z-10 pt-20 sm:pt-10">
        <Grid items={feedItems} section={params.section} variant="index" />
        {searchParams.item && (
          <Lightbox items={feedItems} section={params.section} />
        )}
      </div>
    </>
  );
}