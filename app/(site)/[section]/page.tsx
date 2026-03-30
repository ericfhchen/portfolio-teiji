import { client } from '@/lib/sanity.client';
import { featuredWorksQuery, siteSettingsQuery } from '@/lib/queries'; // Use the existing query
import { getImageUrl } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import Slideshow from '@/components/Slideshow';
import { FeedItem } from '@/sanity/schema';
import GridLines from '@/components/GridLines';

export async function generateStaticParams() {
  return [{ section: 'art' }, { section: 'design' }];
}

async function getFeaturedData(section: string) {
  const galleryId = section === 'art' ? 'homeGalleryArt' : 'homeGalleryDesign';
  return client.fetch(featuredWorksQuery, { galleryId }, { next: { revalidate: 60 } });
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ section: string }> 
}) {
  const { section } = await params;
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  const siteTitle = (settings?.title || 'Teiji').replace(/\s*Studio\s*/i, ' ').trim();
  
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
  const gallery = await getFeaturedData(section);
  const galleryItems = gallery?.items || [];

  // Add null checking for the featured data
  if (!galleryItems.length) {
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

   // Transform gallery items into FeedItem[] compatible with Slideshow
   const feedItems: FeedItem[] = galleryItems.flatMap((item: any, idx: number) => {
    const work = item.work;
    if (!work) return [];

    // Use override media if provided, otherwise fall back to work's featuredImage
    const media = item.overrideMedia?.mediaType ? item.overrideMedia : work.featuredImage;
    const hoverTop = item.overrideHoverTextTop || work.hoverTextTop;
    const hoverBottom = item.overrideHoverTextBottom || work.hoverTextBottom;
    const isVideo = media?.mediaType === 'video';

    if (isVideo && media?.video) {
      const video = media.video;
      const playbackId = getPlaybackId(video);

      let posterSrc = '';
      if (video.poster) {
        posterSrc = getImageUrl(video.poster, 2400);
      } else if (playbackId) {
        posterSrc = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=2400&fit_mode=preserve`;
      }

      const feedItem: FeedItem = {
        _id: `${work._id}-${idx}`,
        mediaType: 'video' as const,
        src: posterSrc,
        alt: video.poster?.alt || '',
        lqip: video.poster?.lqip || '',
        parentSlug: work.slug,
        parentTitle: work.title,
        parentTags: work.tags || [],
        description: work.description,
        index: idx,
        playbackId: playbackId || undefined,
        controls: video.controls,
        hoverTextTop: hoverTop,
        hoverTextBottom: hoverBottom,
      };
      return [feedItem];
    } else if (media?.image) {
      const feedItem: FeedItem = {
        _id: `${work._id}-${idx}`,
        mediaType: 'image' as const,
        src: getImageUrl(media.image, 2400),
        alt: media.image.alt || '',
        lqip: media.image.lqip || '',
        parentSlug: work.slug,
        parentTitle: work.title,
        parentTags: work.tags || [],
        description: work.description,
        index: idx,
        hoverTextTop: hoverTop,
        hoverTextBottom: hoverBottom,
      };
      return [feedItem];
    } else {
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