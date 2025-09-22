import { notFound } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { aboutQuery, siteSettingsQuery } from '@/lib/queries';
import { About } from '@/lib/types';
import { PortableText } from '@portabletext/react';
import GridLines from '@/components/GridLines';
import MediaItem from '@/components/MediaItem';

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
    link: ({ children, value }: any) => (
      <a 
        href={value?.href} 
        className="text-var hover:text-[var(--muted)] transition-colors"
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
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
  const siteTitle = settings?.title || 'Teiji';

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
        <div className="pt-24 pb-20 relative lg:fixed lg:inset-0 lg:overflow-hidden">
          <div className="mx-auto px-6 md:px-8 lg:h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 lg:h-full">
              {/* Left side - Bio and Services */}
              <div className="space-y-12 lg:space-y-12 lg:overflow-y-auto">
                {/* Bio */}
                {about.bio && about.bio.length > 0 && (
                  <div className="space-y-6">
                    <div className="prose prose-sm max-w-none text-var">
                      <PortableText value={about.bio} components={portableTextComponents} />
                    </div>
                  </div>
                )}

                {/* Services */}
                {about.services && about.services.length > 0 && (
                  <div className="space-y-2">
                    <div>
                      {about.services.map((service) => (
                        <div key={service}>
                          <Link 
                            href={`/design?tags=${encodeURIComponent(service)}`}
                            className="text-var font-light hover:text-[var(--muted)] transition-colors block"
                          >
                            {service}
                          </Link>
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
                {/* Second column left intentionally empty on desktop since Contact is bottom-fixed */}
              </div>
            </div>

            {/* Mobile-only Contact - appears after all content */}
            <div className="lg:hidden space-y-6 mt-12">
              <div className="flex gap-4 sm:gap-6">
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
              </div>
            </div>
          </div>

          {/* Contact - absolutely positioned at bottom for design section (desktop only, match Art) */}
          <div className="hidden lg:block absolute bottom-6 left-0 w-full">
            <div className="max-w-7xl px-8">
              <div className="flex gap-6">
                <span className="text-var">Contact</span>
                <div className="flex gap-6">
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Art section layout (existing layout)
  return (
    <div className="fixed inset-0 overflow-hidden">
      <GridLines type="about" />
      <div className="h-full relative">
        <div className="mx-auto px-6 md:px-8 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
            {/* Left side - Bio, CV, and Contact (mobile) */}
            <div className="space-y-12 mt-24 overflow-y-auto">
              {/* Bio */}
              {about.bio && about.bio.length > 0 && (
                <div className="space-y-6">
                  <div className="prose prose-sm max-w-none text-var">
                    <PortableText value={about.bio} components={portableTextComponents} />
                  </div>
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

              {/* Contact - visible on mobile, hidden on desktop */}
              <div className="lg:hidden space-y-6">
                <div className="flex gap-4 sm:gap-6">
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
                </div>
              </div>
            </div>

            {/* Right side - Media item for art section */}
            {/* 
              VIDEO IMPLEMENTATION (temporarily hidden):
              The MediaItem component supports both images and videos through the mediaType property.
              Video implementation includes:
              - VideoPlayer component with HLS.js support for Chrome and native HLS for Safari
              - MUX video hosting with playbackId
              - Autoplay, loop, mute controls
              - Captions support
              - Responsive sizing and object-fit options
              
              To restore video functionality, simply uncomment the MediaItem below.
              The video data structure includes:
              - mediaType: 'video'
              - video.asset.asset.playbackId: MUX playback ID
              - video.poster: optional poster image
              - video.captions: optional VTT captions file
              - video.controls: boolean for control visibility
            */}
            <div className="hidden lg:block h-full">
              {about.mediaItem && about.mediaItem.mediaType === 'image' && (
                <div className="h-full w-full">
                  <MediaItem mediaItem={about.mediaItem} className="h-full w-full" />
                </div>
              )}
              {/* Video temporarily hidden - uncomment to restore:
              {about.mediaItem && about.mediaItem.mediaType === 'video' && (
                <div className="h-full w-full">
                  <MediaItem mediaItem={about.mediaItem} className="h-full w-full" />
                </div>
              )}
              */}
            </div>
          </div>
        </div>

        {/* Contact - absolutely positioned at bottom for art section (desktop only) */}
        <div className="hidden lg:block absolute bottom-6 left-0 w-full">
          <div className="max-w-7xl px-8">
            <div className="flex gap-6">
              <span className="text-var">Contact</span>
              <div className="flex gap-6">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}