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

export async function generateStaticParams() {
  const slugs = await client.fetch(workSlugParamsQuery);
  return slugs.map((item: any) => ({
    section: item.section,
    slug: item.slug,
  }));
}

export async function generateMetadata({ params }: any) {
  const work = await client.fetch(workBySlugQuery, params);
  
  if (!work) {
    return {};
  }

  const coverImage = getImageProps(work.coverImage, 1200, 630);
  
  return {
    title: `${work.title} - Tei-ji`,
    description: work.summary || `${work.title} - ${work.discipline} work`,
    openGraph: {
      title: work.title,
      description: work.summary || `${work.title} - ${work.discipline} work`,
      images: coverImage ? [{ url: coverImage.src, width: 1200, height: 630 }] : [],
    },
  };
}

export default async function WorkPage({ params }: any) {
  const work = await client.fetch(workBySlugQuery, params);
  
  if (!work) {
    notFound();
  }

  const coverImage = getImageProps(work.coverImage, 1600, 900);

  return (
    <>
      <GridLines type="project" />
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Image */}
      {coverImage && (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg mb-8">
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            fill
            className="object-cover"
            placeholder="blur"
            blurDataURL={coverImage.blurDataURL}
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-var mb-4">{work.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted mb-4">
          {work.year && <span>{work.year}</span>}
          {work.kind && work.kind !== 'project' && (
            <span className="capitalize">{work.kind}</span>
          )}
        </div>

        {work.tags && work.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {work.tags.map((tag: string) => (
              <Link
                key={tag}
                href={`/${params.section}/index?tags=${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-sm rounded-full border border-var text-muted hover:text-var transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {work.summary && (
          <Prose className="text-lg">
            <p>{work.summary}</p>
          </Prose>
        )}
      </header>

      {/* Content */}
      {work.content && work.content.length > 0 && (
        <Prose>
          <PortableText value={work.content} components={RichComponents} />
        </Prose>
      )}

      {/* Back Link */}
      <div className="mt-12 pt-8 border-t border-var">
        <Link
          href={`/${params.section}/index`}
          className="inline-flex items-center text-sm text-muted hover:text-var transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to {params.section}
        </Link>
      </div>
      </article>
    </>
  );
}