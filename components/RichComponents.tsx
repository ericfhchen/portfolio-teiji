import Link from 'next/link';
import { PortableText, PortableTextComponents } from 'next-sanity';
import { getImageProps, isVerticalMedia } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import ImageWithGrid from '@/components/ImageWithGrid';
import { VideoLayout, VideoBleed } from '@/components/VideoPlayer';
import ImageWithBlur from '@/components/ImageWithBlur';

// --- Types ---

interface SanityImageAsset {
  _type?: string;
  asset?: {
    _ref?: string;
    _type?: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number; aspectRatio: number };
    };
  };
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  alt?: string;
  lqip?: string;
}

interface ImageItem {
  _key?: string;
  source?: 'upload' | 'reference';
  uploadedImage?: SanityImageAsset;
  indexItemRef?: {
    _id: string;
    title?: string;
    description?: string;
    featuredMedia?: {
      mediaType: string;
      image?: SanityImageAsset;
    };
  };
  colSpan?: number;
  alt?: string;
}

// --- Layout helpers ---

function getWidthStyle(width?: string, customWidth?: number, fallback = '100%'): string {
  if (width === 'custom' && customWidth) {
    const clamped = Math.max(20, Math.min(100, customWidth));
    return `${clamped}%`;
  }
  if (width && width !== 'custom') return width;
  return fallback;
}

// Returns { desktop, mobile } width strings. Mobile falls back to desktop if not set.
function getResponsiveWidths(
  width?: string, customWidth?: number,
  mobileWidth?: string, mobileCustomWidth?: number,
  fallback = '100%'
): { desktop: string; mobile: string } {
  const desktop = getWidthStyle(width, customWidth, fallback);
  const mobile = mobileWidth
    ? getWidthStyle(mobileWidth, mobileCustomWidth, desktop)
    : desktop;
  return { desktop, mobile };
}

// Wrapper that renders two containers when mobile differs from desktop
function ResponsiveWidthWrapper({
  desktop, mobile, className, style, children,
}: {
  desktop: string; mobile: string;
  className?: string; style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (desktop === mobile) {
    return <div className={className} style={{ ...style, maxWidth: desktop, width: '100%' }}>{children}</div>;
  }
  return (
    <>
      <div className={`${className ?? ''} md:hidden`} style={{ ...style, maxWidth: mobile, width: '100%' }}>{children}</div>
      <div className={`${className ?? ''} hidden md:block`} style={{ ...style, maxWidth: desktop, width: '100%' }}>{children}</div>
    </>
  );
}

// Backwards compat: map old layout values to width percentages
function legacyLayoutToWidth(layout?: string): string {
  if (layout === 'full') return '100%';
  if (layout === 'medium') return '60%';
  if (layout === 'small') return '40%';
  return '100%';
}

const alignmentClass: Record<string, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

const captionAlignClass: Record<string, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const gapClass: Record<string, string> = {
  small: 'gap-4',
  medium: 'gap-8',
  large: 'gap-16',
};

// For multi-image layouts: align images toward the center gap
function getCellAlignment(index: number, totalCols: number): string {
  if (index === 0) return 'justify-end';
  if (index === totalCols - 1) return 'justify-start';
  return 'justify-center';
}

// #13: Helper to extract alt text from an image item
function getAltText(imageItem: ImageItem): string {
  // Prefer explicit alt on the item
  if (imageItem.alt) return imageItem.alt;
  // Fall back to referenced index item title
  if (imageItem.indexItemRef?.title) return imageItem.indexItemRef.title;
  return '';
}

// Helper to get image source from an image item (shared by dual/triple/grid)
function getImageSource(imageItem: ImageItem) {
  if (imageItem.source === 'reference' && imageItem.indexItemRef?.featuredMedia?.image) {
    return { image: imageItem.indexItemRef.featuredMedia.image };
  } else if (imageItem.source === 'upload' && imageItem.uploadedImage) {
    return { image: imageItem.uploadedImage };
  }
  return null;
}

const RichComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageProps = getImageProps(value, 1200);
      if (!imageProps) return null;
      const dims = value?.asset?.metadata?.dimensions;
      const iw = Math.round(dims?.width || 1200);
      const ih = Math.round(dims?.height || 800);

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
              <div className="w-full max-w-4xl">
                <ImageWithBlur
                  src={imageProps.src}
                  alt={imageProps.alt}
                  lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="w-full h-auto"
                  fill={false}
                  width={iw}
                  height={ih}
                />
              </div>
            </figure>
          </div>
        </div>
      );
    },


    imageDual: ({ value }) => {
      const { images, caption, width, customWidth, mobileWidth, mobileCustomWidth, captionPosition } = value;
      if (!images?.length || images.length !== 2) return null;

      const widths = getResponsiveWidths(width, customWidth, mobileWidth, mobileCustomWidth, '60%');
      const resolvedWidth = widths.desktop;
      // #18: Use ?? for null/undefined handling
      const capClass = captionAlignClass[captionPosition] ?? 'text-center';

      // #17: Resolve images and warn on silent drop
      const resolved = (images as ImageItem[]).map((imageItem, index) => {
        const imageSource = getImageSource(imageItem);
        if (!imageSource) return null;
        const imageProps = getImageProps(imageSource.image, 1200);
        if (!imageProps) return null;
        const dims = imageSource.image?.asset?.metadata?.dimensions;
        const iw = Math.round(dims?.width || 1200);
        const ih = Math.round(dims?.height || 800);
        const cellAlign = getCellAlignment(index, 2);
        // #20: Responsive sizes accounting for layout width
        const widthPct = parseInt(resolvedWidth) || 60;
        const mobileSizes = `${Math.round(widthPct * 0.5)}vw`;
        const desktopSizes = `${Math.round(widthPct * 0.3)}vw`;

        const imgContent = (
          <ImageWithBlur
            src={imageProps.src}
            alt={getAltText(imageItem)}
            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
            sizes={`(max-width: 768px) ${mobileSizes}, ${desktopSizes}`}
            className="w-full h-auto"
            fill={false}
            width={iw}
            height={ih}
          />
        );

        return (
          <div key={imageItem._key || `dual-image-${index}`} className={`flex ${cellAlign}`}>
            {widths.desktop === widths.mobile ? (
              <div className="relative overflow-hidden" style={{ width: widths.desktop }}>{imgContent}</div>
            ) : (
              <>
                <div className="relative overflow-hidden md:hidden" style={{ width: widths.mobile }}>{imgContent}</div>
                <div className="relative overflow-hidden hidden md:block" style={{ width: widths.desktop }}>{imgContent}</div>
              </>
            )}
          </div>
        );
      });

      const validCount = resolved.filter(Boolean).length;
      if (validCount !== 2 && typeof window !== 'undefined') {
        console.warn(`[imageDual] Expected 2 images, got ${validCount} valid`);
      }

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            <figure className="relative z-10 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 gap-4 sm:gap-16">
                {resolved.filter(Boolean)}
              </div>
            </figure>
          </div>
          {caption && (
            <figcaption className={`mt-2 text-sm text-muted ${capClass}`}>
              {caption}
            </figcaption>
          )}
        </div>
      );
    },

    imageTriple: ({ value }) => {
      const { images, caption, width, customWidth, mobileWidth, mobileCustomWidth, captionPosition } = value;
      if (!images?.length || images.length !== 3) return null;

      const widths = getResponsiveWidths(width, customWidth, mobileWidth, mobileCustomWidth, '80%');
      const resolvedWidth = widths.desktop;
      const capClass = captionAlignClass[captionPosition] ?? 'text-center';

      const resolved = (images as ImageItem[]).map((imageItem, index) => {
        const imageSource = getImageSource(imageItem);
        if (!imageSource) return null;
        const imageProps = getImageProps(imageSource.image, 800);
        if (!imageProps) return null;
        const dims = imageSource.image?.asset?.metadata?.dimensions;
        const iw = Math.round(dims?.width || 800);
        const ih = Math.round(dims?.height || 600);
        const cellAlign = getCellAlignment(index, 3);
        const widthPct = parseInt(resolvedWidth) || 80;
        const mobileSizes = `${Math.round(widthPct * 0.33)}vw`;
        const desktopSizes = `${Math.round(widthPct * 0.25)}vw`;

        const imgContent = (
          <ImageWithBlur
            src={imageProps.src}
            alt={getAltText(imageItem)}
            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
            sizes={`(max-width: 768px) ${mobileSizes}, ${desktopSizes}`}
            className="w-full h-auto"
            fill={false}
            width={iw}
            height={ih}
          />
        );

        return (
          <div key={imageItem._key || `triple-image-${index}`} className={`flex ${cellAlign}`}>
            {widths.desktop === widths.mobile ? (
              <div className="relative overflow-hidden" style={{ width: widths.desktop }}>{imgContent}</div>
            ) : (
              <>
                <div className="relative overflow-hidden md:hidden" style={{ width: widths.mobile }}>{imgContent}</div>
                <div className="relative overflow-hidden hidden md:block" style={{ width: widths.desktop }}>{imgContent}</div>
              </>
            )}
          </div>
        );
      });

      const validCount = resolved.filter(Boolean).length;
      if (validCount !== 3 && typeof window !== 'undefined') {
        console.warn(`[imageTriple] Expected 3 images, got ${validCount} valid`);
      }

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            <figure className="relative z-10 max-w-7xl mx-auto">
              <div className="grid grid-cols-3 gap-4 sm:gap-16">
                {resolved.filter(Boolean)}
              </div>
            </figure>
          </div>
          {caption && (
            <figcaption className={`mt-2 text-sm text-muted ${capClass}`}>
              {caption}
            </figcaption>
          )}
        </div>
      );
    },

    imageGrid: ({ value }) => {
      const { images, columns, gap, caption, width, customWidth, mobileWidth, mobileCustomWidth, alignment, captionPosition } = value;
      if (!images?.length || images.length < 2) return null;

      const cols = Math.max(1, Math.min(4, columns || 2));
      const widths = getResponsiveWidths(width, customWidth, mobileWidth, mobileCustomWidth, '100%');
      // #18: Use ?? for null/undefined handling
      const justifyClass = alignmentClass[alignment] ?? 'justify-center';
      const capClass = captionAlignClass[captionPosition] ?? 'text-center';
      const gapCls = gapClass[gap] ?? 'gap-8';

      const gridColsClass: Record<number, string> = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
      };

      const widthPct = parseInt(widths.desktop) || 100;

      const gridContent = (
        <div className={`grid ${gridColsClass[cols] || 'grid-cols-2'} ${gapCls}`}>
          {(images as ImageItem[])
            .map((imageItem, index) => {
              const imageSource = getImageSource(imageItem);
              if (!imageSource) return null;

              const imageProps = getImageProps(imageSource.image, 1200);
              if (!imageProps) return null;
              const dims = imageSource.image?.asset?.metadata?.dimensions;
              const iw = Math.round(dims?.width || 1200);
              const ih = Math.round(dims?.height || 800);

              // #16: Clamp colSpan to 1–cols
              const span = imageItem.colSpan ? Math.max(1, Math.min(cols, imageItem.colSpan)) : undefined;

              const effectiveCols = span || 1;
              const mobileSizes = `${Math.round((widthPct * effectiveCols) / cols)}vw`;
              const desktopSizes = `${Math.round((widthPct * effectiveCols * 0.8) / cols)}vw`;

              return (
                <div
                  key={imageItem._key || `grid-image-${index}`}
                  className="relative overflow-hidden"
                  style={span ? { gridColumn: `span ${span}` } : undefined}
                >
                  <ImageWithBlur
                    src={imageProps.src}
                    alt={getAltText(imageItem)}
                    lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                    sizes={`(max-width: 768px) ${mobileSizes}, ${desktopSizes}`}
                    className="w-full h-auto"
                    fill={false}
                    width={iw}
                    height={ih}
                  />
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      );

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            <figure className={`relative z-10 mx-4 sm:mx-6 lg:mx-8 flex ${justifyClass}`}>
              <ResponsiveWidthWrapper desktop={widths.desktop} mobile={widths.mobile}>
                {gridContent}
              </ResponsiveWidthWrapper>
            </figure>
          </div>
          {caption && (
            <figcaption className={`mt-2 text-sm text-muted ${capClass}`}>
              {caption}
            </figcaption>
          )}
        </div>
      );
    },

    videoMux: ({ value }) => {
      const playbackIdToUse = getPlaybackId(value);
      if (!playbackIdToUse) {
        console.error('No valid playback ID found in video data:', value);
        return null;
      }

      try {
        return <VideoLayout video={value} layout="full" alt="" isPortableText={true} />;
      } catch (error) {
        console.error('Error rendering video:', error);
        return null;
      }
    },


    imageBleed: ({ value }) => {
      const { media } = value;

      if (!media) return null;

      if (media.mediaType === 'video' && media.video) {
        return <VideoBleed video={media.video} alt="" />;
      }

      if (media.mediaType === 'image' && media.image) {
        const dims = media.image?.asset?.metadata?.dimensions;
        const iw = Math.round(dims?.width || 1600);
        const ih = Math.round(dims?.height || 900);
        const imageProps = getImageProps(media.image, iw);
        if (!imageProps) return null;

      return (
        <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
          <ImageWithBlur
            src={imageProps.src}
            alt={imageProps.alt}
            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
            sizes="100vw"
            className="w-full h-auto"
            fill={false}
            width={iw}
            height={ih}
          />
        </div>
      );
      }

      return null;
    },


    projectImage: ({ value }) => {
      const { source, uploadedImage, indexItemRef, layout, width, customWidth, mobileWidth, mobileCustomWidth, alignment, caption, captionPosition } = value;

      let imageToRender = null;
      let displayCaption = caption;
      let altText = '';

      if (source === 'upload' && uploadedImage) {
        imageToRender = uploadedImage;
        altText = uploadedImage.alt ?? '';
      } else if (source === 'reference' && indexItemRef?.featuredMedia?.image) {
        imageToRender = indexItemRef.featuredMedia.image;
        altText = indexItemRef.title ?? '';
        if (!displayCaption && indexItemRef.description) {
          displayCaption = indexItemRef.description;
        }
      }

      if (!imageToRender) return null;

      // Resolve width: prefer new width field, fall back to legacy layout field
      const legacyFallback = layout ? legacyLayoutToWidth(layout) : '100%';
      const widths = width
        ? getResponsiveWidths(width, customWidth, mobileWidth, mobileCustomWidth, '100%')
        : { desktop: legacyFallback, mobile: mobileWidth ? getWidthStyle(mobileWidth, mobileCustomWidth, legacyFallback) : legacyFallback };

      const justifyClass = alignmentClass[alignment] ?? 'justify-center';
      const capClass = captionAlignClass[captionPosition] ?? 'text-center';

      const imageProps = getImageProps(imageToRender, 2400);
      if (!imageProps) return null;
      const dims = imageToRender?.asset?.metadata?.dimensions;
      const iw = Math.round(dims?.width || 1200);
      const ih = Math.round(dims?.height || 800);

      // #20: Responsive sizes based on resolved width
      const widthPct = parseInt(widths.desktop) || 100;

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            <figure className={`relative z-10 mx-4 sm:mx-6 lg:mx-8 flex ${justifyClass}`}>
              <ResponsiveWidthWrapper desktop={widths.desktop} mobile={widths.mobile}>
                <ImageWithBlur
                  src={imageProps.src}
                  alt={altText || imageProps.alt}
                  lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                  sizes={`(max-width: 768px) ${widthPct}vw, (max-width: 1200px) ${Math.round(widthPct * 0.8)}vw, ${Math.round(widthPct * 12)}px`}
                  className="w-full h-auto"
                  fill={false}
                  width={iw}
                  height={ih}
                />
              </ResponsiveWidthWrapper>
            </figure>
          </div>
          {displayCaption && (
            <figcaption className={`mt-2 text-sm text-muted ${capClass}`}>
              {displayCaption}
            </figcaption>
          )}
        </div>
      );
    },

    iframeEmbed: ({ value }) => {
      const { url, title, aspectRatio, width, customWidth, mobileWidth, mobileCustomWidth, background, caption } = value;
      if (!url) return null;

      const isViewport = aspectRatio === 'viewport';
      const bg = background === 'white' ? '#fff' : background === 'black' ? '#000' : 'transparent';
      const widths = getResponsiveWidths(width, customWidth, mobileWidth, mobileCustomWidth, '100%');

      const iframeContent = (
        <>
          <div
            className="relative w-full"
            style={isViewport
              ? { height: '100vh' }
              : { aspectRatio: aspectRatio || '16/9' }
            }
          >
            <iframe
              src={url}
              title={title || 'Embedded content'}
              className="absolute inset-0 w-full h-full border-0"
              style={{ backgroundColor: bg }}
              allow="clipboard-write; encrypted-media; gyroscope; web-share"
              allowFullScreen
              // @ts-expect-error -- allowtransparency is non-standard but needed for some embeds
              allowTransparency="true"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {caption}
            </figcaption>
          )}
        </>
      );

      return (
        <div className="my-8">
          <div className="flex justify-center">
            <ResponsiveWidthWrapper desktop={widths.desktop} mobile={widths.mobile}>
              {iframeContent}
            </ResponsiveWidthWrapper>
          </div>
        </div>
      );
    },

    spacer: ({ value }) => {
      const heightRem = typeof value.height === 'number' ? value.height : 8;

      return (
        <div
          style={{ height: `${heightRem}rem` }}
          aria-hidden="true"
        />
      );
    },
  },

  block: {
    normal: ({ children }) => (
      <div className="w-full sm:w-3/5 max-w-4xl mx-auto">
        <p className="my-4 text-var">{children}</p>
      </div>
    ),
    blockquote: ({ children }) => (
      <div className="w-full sm:w-3/5 mx-auto">
        <blockquote className="my-6 border-l-4 border-var pl-6 text-muted italic">
          {children}
        </blockquote>
      </div>
    ),
    caption: ({ children }) => (
      <div className="w-full sm:w-3/5 mx-auto">
        <p className="my-2 text-sm text-muted text-center">{children}</p>
      </div>
    ),
    small: ({ children }) => (
      <div className="w-full sm:w-3/5 mx-auto">
        <p className="my-2 text-xs text-muted">{children}</p>
      </div>
    ),
  },

  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

export default RichComponents;
