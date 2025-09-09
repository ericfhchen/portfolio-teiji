import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PortableText } from '@portabletext/react';
import { client } from '@/lib/sanity.client';
import { workBySlugQuery, workSlugParamsQuery } from '@/lib/queries';
import { getImageProps } from '@/lib/image';
import RichComponents from '@/components/RichComponents';
import Prose from '@/components/Prose';
import GridLines from '@/components/GridLines';
import ExpandableDescription from '@/components/ExpandableDescription';

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

  const coverImage = getImageProps(work.coverImage, 1200, 630);
  
  return {
    title: `${work.title} - Tei-ji`,
    description: work.description || `${work.title} - ${work.discipline} work`,
    openGraph: {
      title: work.title,
      description: work.description || `${work.title} - ${work.discipline} work`,
      images: coverImage ? [{ url: coverImage.src, width: 1200, height: 630 }] : [],
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

  const coverImage = getImageProps(work.coverImage, 1600, 900);

  return (
    <>
      <GridLines type="project" />
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section - similar to lightbox layout */}
        {coverImage && (
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-full">
              {/* Horizontal hairline across the full width at vertical center */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
              />
              
              {/* Hero image container */}
              <div className="relative overflow-hidden mx-auto w-full p-8 pt-20">
                <div className="relative aspect-[16/9]">
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