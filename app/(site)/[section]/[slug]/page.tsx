import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity.client';
import { workBySlugQuery, workSlugParamsQuery } from '@/lib/queries';
import { getImageProps, isVerticalMedia, getMediaAspectRatio } from '@/lib/image';
import RichComponents from '@/components/RichComponents';
import Prose from '@/components/Prose';
import GridLines from '@/components/GridLines';
import ExpandableDescription from '@/components/ExpandableDescription';
import { VideoPlayer } from '@/components/VideoPlayer';

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

  // Handle both image and video cover media for metadata
  let metaImage = null;
  if (work.coverImage?.mediaType === 'image' && work.coverImage.image) {
    metaImage = getImageProps(work.coverImage.image, 1200, 630);
  } else if (work.coverImage?.mediaType === 'video' && work.coverImage.video?.poster) {
    metaImage = getImageProps(work.coverImage.video.poster, 1200, 630);
  }
  
  return {
    title: `${work.title} - Tei-ji`,
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

  // Prepare cover media (image or video) for the hero section
  let coverImage = null;
  let coverVideo = null;
  let isVertical = false;
  let aspectRatio = 16 / 9; // default
  
  if (work.coverImage?.mediaType === 'image' && work.coverImage.image) {
    coverImage = getImageProps(work.coverImage.image, 1600, 900);
    isVertical = isVerticalMedia(work.coverImage.image);
    aspectRatio = getMediaAspectRatio(work.coverImage.image);
  } else if (work.coverImage?.mediaType === 'video' && work.coverImage.video) {
    coverVideo = work.coverImage.video;
    isVertical = isVerticalMedia(work.coverImage.video);
    aspectRatio = getMediaAspectRatio(work.coverImage.video);
  }

  return (
    <>
      <GridLines type="project" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - handles both image and video */}
        {(coverImage || coverVideo) && (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full">
              {/* Horizontal hairline across the full width at vertical center */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
              />
              
              {/* Hero media container */}
              <div className="relative overflow-hidden mx-auto w-full p-8 mt-8">
                {isVertical ? (
                  // Vertical media: constrain by height, center horizontally
                  <div className="flex justify-center items-center" style={{ height: 'calc(90vh - 4rem)' }}>
                    {coverImage ? (
                      <div 
                        className="relative"
                        style={{ 
                          height: 'calc(90vh - 4rem)',
                          width: `calc((90vh - 4rem) * ${aspectRatio})`,
                          minWidth: '200px'
                        }}
                      >
                        <Image
                          src={coverImage.src}
                          alt={coverImage.alt}
                          fill
                          className="object-contain object-center"
                          {...(coverImage.hasBlur && {
                            placeholder: "blur" as const,
                            blurDataURL: coverImage.blurDataURL,
                          })}
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 40vw, 30vw"
                          priority
                        />
                      </div>
                    ) : coverVideo ? (
                      <div className="h-full flex items-center justify-center">
                        <VideoPlayer video={coverVideo} objectFit="contain" isVertical={true} />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  // Horizontal media: height-constrained with proper aspect ratio
                  <div className="flex justify-center items-center" style={{ height: 'calc(90vh - 4rem)' }}>
                    {coverImage ? (
                      <div 
                        className="relative"
                        style={{ 
                          height: 'calc(90vh - 4rem)',
                          width: `calc((90vh - 4rem) * ${aspectRatio})`,
                          maxWidth: '100%'
                        }}
                      >
                        <Image
                          src={coverImage.src}
                          alt={coverImage.alt}
                          fill
                          className="object-contain object-center"
                          {...(coverImage.hasBlur && {
                            placeholder: "blur" as const,
                            blurDataURL: coverImage.blurDataURL,
                          })}
                          sizes="(max-width: 1024px) 100vw, 1024px"
                          priority
                        />
                      </div>
                    ) : coverVideo ? (
                      <div 
                        className="relative"
                        style={{ 
                          height: 'calc(90vh - 4rem)',
                          width: `calc((90vh - 4rem) * ${aspectRatio})`,
                          maxWidth: '100%'
                        }}
                      >
                        <VideoPlayer video={coverVideo} objectFit="contain" isVertical={false} />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bottom text layout - matching lightbox component */}
        <div className="relative z-20">
          <div className="grid grid-cols-2 gap-16 px-8 py-6">
            {/* Left side: Year and Title only */}
            <div className="grid grid-cols-[auto_1fr] gap-8">
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

            {/* Right side: Description and Tags */}
            <div className="space-y-4">
              {/* Description first - expandable */}
              {work.description && (
                <ExpandableDescription description={work.description} />
              )}
              
              {/* Tags beneath description */}
              {work.tags && work.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {work.tags.map((tag: string, index: number) => (
                    <span key={`${tag}-${index}`} className="text-muted font-light">
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
        <article className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Prose>
            <PortableText value={work.content} components={RichComponents} />
          </Prose>


        </article>
      )}
    </>
  );
}