import { notFound } from 'next/navigation';
import Link from 'next/link';
import { client } from '@/lib/sanity.client';
import { aboutQuery } from '@/lib/queries';
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
    strong: ({ children }: any) => <strong className="font-medium">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    muted: ({ children }: any) => <span className="text-muted">{children}</span>,
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

  return {
    title: `About - ${section.charAt(0).toUpperCase() + section.slice(1)}`,
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
        <div className="min-h-screen pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
              {/* Left side - Bio and Services */}
              <div className="space-y-2">
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
                            className="text-var hover:text-muted transition-colors block"
                          >
                            {service}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - 2-column layout with Clients and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* First column - Clients */}
                {about.clients && about.clients.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-var font-medium">Selected Clients</div>
                    <div>
                      {about.clients.map((client) => (
                        <div key={client._key}>
                          {client.url ? (
                            <a 
                              href={client.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-var hover:text-muted transition-colors block"
                            >
                              {client.name}
                            </a>
                          ) : (
                            <div className="text-var">
                              {client.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Second column - Contact */}
                <div className="space-y-2">
                  <div className="text-var font-medium">Contact</div>
                  <a 
                    href={`mailto:${about.email}`} 
                    className="text-var hover:text-muted transition-colors block"
                  >
                    {about.email}
                  </a>
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
        <div className="mx-auto px-4 h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 h-full">
            {/* Left side - Bio and CV */}
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
                      <div key={item._key} className="flex gap-6">
                        <div className="w-16 shrink-0 text-sm text-var">
                          {item.year}
                        </div>
                        <div className="text-sm text-var">
                          <PortableText value={item.text} components={portableTextComponents} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Media item for art section */}
            <div className="hidden lg:block h-full">
              {about.mediaItem && (
                <div className="h-full w-full">
                  <MediaItem mediaItem={about.mediaItem} className="h-full w-full" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact - absolutely positioned at bottom for art section */}
        <div className="absolute bottom-6 left-0 w-full">
          <div className="max-w-7xl px-4">
            <div className="flex gap-6 text-sm">
              <span className="text-var">Contact</span>
              <a 
                href={`mailto:${about.email}`} 
                className="text-var hover:text-muted transition-colors"
              >
                {about.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}