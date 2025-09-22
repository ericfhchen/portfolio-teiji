import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity.client';
import { workBySlugQuery, workSlugParamsQuery, siteSettingsQuery } from '@/lib/queries';
import { getImageProps, isVerticalMedia, getMediaAspectRatio } from '@/lib/image';
import RichComponents from '@/components/RichComponents';
import Prose from '@/components/Prose';
import GridLines from '@/components/GridLines';
import ExpandableDescription from '@/components/ExpandableDescription';
import { VideoPlayer } from '@/components/VideoPlayer';
import HeroGallery from '@/components/HeroGallery';

export async function generateStaticParams() {
  const slugs = await client.fetch(workSlugParamsQuery);
  return slugs.map((item: any) => ({
    section: item.section,
    slug: item.slug,
  }));
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ section: string; slug: string }> 
}) {
  const { section, slug } = await params;
  const work = await client.fetch(workBySlugQuery, { section, slug });
  
  if (!work) {
    return {};
  }

  // Get site settings for title
  const settings = await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  const siteTitle = settings?.title || 'Portfolio';

  // Handle both image and video media for metadata
  // Use first heroAsset if available, otherwise fall back to coverImage
  const metaMedia = Array.isArray(work.heroAsset) && work.heroAsset.length > 0
    ? work.heroAsset[0]
    : work.coverImage;
  let metaImage = null;
  if (metaMedia?.mediaType === 'image' && metaMedia.image) {
    metaImage = getImageProps(metaMedia.image, 1200, 630);
  } else if (metaMedia?.mediaType === 'video' && metaMedia.video?.poster) {
    metaImage = getImageProps(metaMedia.video.poster, 1200, 630);
  }
  
  return {
    title: `${work.title} - ${siteTitle}`,
    description: work.description || `${work.title} - ${work.discipline} work`,
    openGraph: {
      title: work.title,
      description: work.description || `${work.title} - ${work.discipline} work`,
      images: metaImage ? [{ url: metaImage.src, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function WorkPage({ 
  params 
}: { 
  params: Promise<{ section: string; slug: string }> 
}) {
  const { section, slug } = await params;
  const work = await client.fetch(workBySlugQuery, { section, slug });
  
  if (!work) {
    notFound();
  }

  // Prepare hero gallery items for the hero section
  // Use heroAsset[] if available, otherwise fall back to coverImage as single item
  const heroArray = Array.isArray(work.heroAsset) && work.heroAsset.length > 0
    ? work.heroAsset
    : work.coverImage
      ? [work.coverImage]
      : [];

  return (
    <>
      <GridLines type="project" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - gallery supports images and videos */}
        {heroArray.length > 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[calc(100svh-200px)] max-h-[100svh]">
            <HeroGallery items={heroArray} title={work.title} />
          </div>
        )}

        {/* Bottom text layout - matching lightbox component */}
        <div className="relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 px-8 py-6">
            {/* Mobile: Year and Title horizontally, then Description and Tags below */}
            {/* Desktop: Left side: Year and Title only */}
            <div className="grid grid-cols-[auto_1fr] gap-6 md:gap-8">
              {/* Year column - minimal width */}
              <div className="text-var">
                {work.year || ''}
              </div>
              
              {/* Title column - takes remaining space */}
              <div>
                <div className="text-var font-normal">
                  {work.title}
                </div>
              </div>
            </div>

            {/* Mobile: Description and Tags below year/title */}
            {/* Desktop: Right side: Description and Tags */}
            <div className="space-y-4 md:col-start-2">
              {/* Client name positioned to the right of center line */}
              {work.client && (
                <div className="text-right text-var font-normal">
                  {work.client}
                </div>
              )}
              
              {/* Description first - expandable */}
              {work.description && (
                <ExpandableDescription description={work.description} />
              )}
              
              {/* Tags beneath description */}
              {work.tags && work.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {work.tags.map((tag: string, index: number) => (
                    <span key={`${tag}-${index}`} className="text-muted font-light text-sm md:text-base">
                      <Link
                        href={`/${section}/index?tags=${encodeURIComponent(tag)}`}
                        className="hover:text-var transition-colors focus:outline-none focus:text-var tracking-wider"
                      >
                        {tag}
                      </Link>
                      {index < work.tags.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Content Section */}
      {work.content && work.content.length > 0 && (
        <article className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-16 md:py-16">
          <Prose>
            <PortableText value={work.content} components={RichComponents} />
          </Prose>


        </article>
      )}
    </>
  );
}