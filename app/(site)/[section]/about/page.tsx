import { notFound } from 'next/navigation';
import { client } from '@/lib/sanity.client';
import { aboutQuery, siteSettingsQuery } from '@/lib/queries';
import { About } from '@/lib/types';
import { PortableText } from '@portabletext/react';
import GridLines from '@/components/GridLines';
import { getImageProps } from '@/lib/image';
import FinalResearchCredit from '@/components/FinalResearchCredit';
import AboutGallery from '@/components/AboutGallery';

export async function generateStaticParams() {
  return [{ section: 'art' }, { section: 'design' }];
}

const validSections = ['art', 'design'] as const;
type Section = typeof validSections[number];

function isValidSection(section: string): section is Section {
  return validSections.includes(section as Section);
}

async function getAbout(section: Section): Promise<About | null> {
  try {
    return await client.fetch(aboutQuery, { section }, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Failed to fetch about content:', error);
    return null;
  }
}

// Custom components for portable text with muted support
const portableTextComponents = {
  marks: {
    strong: ({ children }: any) => <strong className="font-normal">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    muted: ({ children }: any) => <span className="text-muted">{children}</span>,
    link: ({ children, value }: any) => {
      const href = value?.href || '';
      const isExternal = href.startsWith('http') || href.startsWith('mailto');
      return (
        <a
          href={href}
          className="text-var hover:text-[var(--muted)] transition-colors"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  
  if (!isValidSection(section)) {
    return {};
  }

  const settings = await client.fetch(siteSettingsQuery, {}, { next: { revalidate: 60 } });
  const siteTitle = (settings?.title || 'Teiji').replace(/\s*Studio\s*/i, ' ').trim();

  return {
    title: `About — ${section.charAt(0).toUpperCase() + section.slice(1)} — ${siteTitle}`,
    template: null, // Disable the template for this page
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!isValidSection(section)) {
    notFound();
  }

  const about = await getAbout(section);

  if (!about) {
    notFound();
  }

  if (section === 'design') {
    return (
      <>
        <GridLines type="about" />
        <div className="pt-24 pb-20 lg:pb-0 relative">
          <div className="relative flex flex-col lg:min-h-[calc(100vh-96px)]">
            <div className="mx-auto px-6 md:px-8 flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12">
                {/* Left side - Bio and Services */}
                <div className="space-y-12">
                  {/* Bio */}
                  {about.bio && about.bio.length > 0 && (
                    <div className="prose prose-sm max-w-none text-var [&>*:first-child]:mt-0">
                      <PortableText value={about.bio} components={portableTextComponents} />
                    </div>
                  )}

                  {/* Services */}
                  {about.services && about.services.length > 0 && (
                    <div className="space-y-2">
                      <div>
                        {about.services.map((service) => (
                          <div key={service} className="text-var font-light text-sm">
                            {service}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side - 2-column layout with Clients */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* First column - Clients */}
                  {about.clients && about.clients.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-var font-normal">Selected Clients</div>
                      <div>
                        {about.clients.map((client) => (
                          <div key={client._key}>
                            {client.url ? (
                              <a
                                href={client.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-var font-light hover:text-[var(--muted)] transition-colors block"
                              >
                                {client.name}
                              </a>
                            ) : (
                              <div className="text-var font-light">
                                {client.name}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact - in page flow */}
            <div className="px-6 md:px-8 mt-12 lg:mt-auto lg:pt-12 lg:pb-6">
              <div className="relative flex gap-4 sm:gap-6 flex-wrap lg:flex-nowrap items-baseline">
                <span className="text-var">Contact</span>
                <div className="flex gap-4 sm:gap-6">
                  <a
                    href={`mailto:${about.email}`}
                    className="text-var font-light hover:text-[var(--muted)] transition-colors"
                  >
                    {about.email}
                  </a>
                  {about.instagramHandle && (
                    <a
                      href={`https://instagram.com/${about.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-var font-light hover:text-[var(--muted)] transition-colors"
                    >
                      @{about.instagramHandle}
                    </a>
                  )}
                </div>
                <div className="hidden lg:block absolute right-[50%] pr-6">
                  <FinalResearchCredit />
                </div>
              </div>
              <div className="lg:hidden mt-4">
                <FinalResearchCredit />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Art section layout (existing layout)
  return (
    <div className="pt-24 pb-20 lg:pb-0 relative">
      <GridLines type="about" />
      <div className="relative flex flex-col lg:min-h-[calc(100vh-96px)]">
        <div className="mx-auto px-6 md:px-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Left side - Bio, CV */}
            <div className="space-y-12">
              {/* Mobile gallery - above bio, hidden on desktop */}
              {about.gallery && about.gallery.length > 0 && (
                <div className="lg:hidden">
                  <AboutGallery
                    images={about.gallery.map((image: any) => {
                      const imageProps = getImageProps(image, 1200);
                      const dims = image.dimensions;
                      return {
                        src: imageProps?.src || '',
                        alt: image.alt ?? '',
                        lqip: imageProps?.hasBlur ? imageProps.blurDataURL : undefined,
                        width: Math.round(dims?.width || 1200),
                        height: Math.round(dims?.height || 800),
                      };
                    }).filter((img: { src: string }) => img.src)}
                  />
                </div>
              )}

              {/* Bio */}
              {about.bio && about.bio.length > 0 && (
                <div className="prose prose-sm max-w-none text-var [&>*:first-child]:mt-0 lg:!mt-0">
                  <PortableText value={about.bio} components={portableTextComponents} />
                </div>
              )}

              {/* CV */}
              {about.cv && about.cv.length > 0 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    {about.cv.map((item) => (
                      <div key={item._key} className="flex sm:gap-6">
                        <div className="w-16 shrink-0 text-var font-light">
                          {item.year}
                        </div>
                        <div className="text-var font-light">
                          <PortableText value={item.text} components={portableTextComponents} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Image gallery for art section */}
            <div className="hidden lg:flex lg:items-start">
              {about.gallery && about.gallery.length > 0 && (
                <AboutGallery
                  images={about.gallery.map((image: any) => {
                    const imageProps = getImageProps(image, 1200);
                    const dims = image.dimensions;
                    return {
                      src: imageProps?.src || '',
                      alt: image.alt ?? '',
                      lqip: imageProps?.hasBlur ? imageProps.blurDataURL : undefined,
                      width: Math.round(dims?.width || 1200),
                      height: Math.round(dims?.height || 800),
                    };
                  }).filter((img: { src: string }) => img.src)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Contact - in page flow */}
        <div className="px-6 md:px-8 mt-12 lg:mt-auto lg:pt-12 lg:pb-6">
          <div className="relative flex gap-4 sm:gap-6 flex-wrap lg:flex-nowrap items-baseline">
            <span className="text-var">Contact</span>
            <div className="flex gap-4 sm:gap-6">
              <a
                href={`mailto:${about.email}`}
                className="text-var font-light hover:text-[var(--muted)] transition-colors"
              >
                {about.email}
              </a>
              {about.instagramHandle && (
                <a
                  href={`https://instagram.com/${about.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-var font-light hover:text-[var(--muted)] transition-colors"
                >
                  @{about.instagramHandle}
                </a>
              )}
            </div>
            <div className="hidden lg:block absolute right-[50%] pr-6">
              <FinalResearchCredit />
            </div>
          </div>
          <div className="lg:hidden mt-4">
            <FinalResearchCredit />
          </div>
        </div>
      </div>
    </div>
  );
}