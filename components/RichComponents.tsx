import Image from 'next/image';
import Link from 'next/link';
import { PortableText, PortableTextComponents } from 'next-sanity';
import { getImageProps, isVerticalMedia } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import ImageWithGrid from '@/components/ImageWithGrid';
import { VideoLayout, VideoBleed } from '@/components/VideoPlayer';
import ImageWithBlur from '@/components/ImageWithBlur';

// --- Layout helpers ---

function getWidthStyle(width?: string, customWidth?: number, fallback = '100%'): string {
  if (width === 'custom' && customWidth) return `${customWidth}%`;
  if (width && width !== 'custom') return width;
  return fallback;
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

// Helper to get image source from an image item (shared by dual/triple/grid)
function getImageSource(imageItem: any) {
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
          {/* Full-width container that breaks out of prose constraints */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Full-width horizontal line at vertical center, behind image */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '0.5px' }}
            />
            {/* Image centered within normal content width */}
            <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
              <div className="w-full max-w-4xl">
                <ImageWithBlur
                  src={imageProps.src}
                  alt=""
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
      const { images, caption, width, customWidth, alignment, captionPosition } = value;
      if (!images?.length || images.length !== 2) return null;

      const resolvedWidth = getWidthStyle(width, customWidth, '60%');
      const justifyClass = alignmentClass[alignment] || 'justify-center';
      const capClass = captionAlignClass[captionPosition] || 'text-center';

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '0.5px' }}
            />
            <figure className={`relative z-10 max-w-7xl mx-auto flex ${justifyClass}`}>
              <div className="w-full" style={{ maxWidth: resolvedWidth }}>
                <div className="grid grid-cols-2 gap-4 sm:gap-16">
                  {images
                    .map((imageItem: any, index: number) => {
                      const imageSource = getImageSource(imageItem);
                      if (!imageSource) return null;

                      const imageProps = getImageProps(imageSource.image, 1200);
                      if (!imageProps) return null;
                      const dims = imageSource.image?.asset?.metadata?.dimensions;
                      const iw = Math.round(dims?.width || 1200);
                      const ih = Math.round(dims?.height || 800);

                      return (
                        <div key={imageItem._key || `dual-image-${index}`} className="relative overflow-hidden">
                          <ImageWithBlur
                            src={imageProps.src}
                            alt=""
                            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                            sizes="(max-width: 768px) 40vw, 30vw"
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
      const { images, caption, width, customWidth, alignment, captionPosition } = value;
      if (!images?.length || images.length !== 3) return null;

      const resolvedWidth = getWidthStyle(width, customWidth, '80%');
      const justifyClass = alignmentClass[alignment] || 'justify-center';
      const capClass = captionAlignClass[captionPosition] || 'text-center';

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
            />
            <figure className={`relative z-10 max-w-7xl mx-auto flex ${justifyClass}`}>
              <div className="w-full" style={{ maxWidth: resolvedWidth }}>
                <div className="grid grid-cols-3 gap-4 sm:gap-16">
                  {images
                    .map((imageItem: any, index: number) => {
                      const imageSource = getImageSource(imageItem);
                      if (!imageSource) return null;

                      const imageProps = getImageProps(imageSource.image, 800);
                      if (!imageProps) return null;
                      const dims = imageSource.image?.asset?.metadata?.dimensions;
                      const iw = Math.round(dims?.width || 800);
                      const ih = Math.round(dims?.height || 600);

                      return (
                        <div key={imageItem._key || `triple-image-${index}`} className="relative overflow-hidden">
                          <ImageWithBlur
                            src={imageProps.src}
                            alt=""
                            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                            sizes="(max-width: 768px) 30vw, 25vw"
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
      const { images, columns, gap, caption, width, customWidth, alignment, captionPosition } = value;
      if (!images?.length || images.length < 2) return null;

      const cols = columns || 2;
      const resolvedWidth = getWidthStyle(width, customWidth, '100%');
      const justifyClass = alignmentClass[alignment] || 'justify-center';
      const capClass = captionAlignClass[captionPosition] || 'text-center';
      const gapCls = gapClass[gap] || 'gap-8';

      const gridColsClass: Record<number, string> = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
      };

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
            />
            <figure className={`relative z-10 max-w-7xl mx-auto flex ${justifyClass}`}>
              <div className="w-full" style={{ maxWidth: resolvedWidth }}>
                <div className={`grid ${gridColsClass[cols] || 'grid-cols-2'} ${gapCls}`}>
                  {images
                    .map((imageItem: any, index: number) => {
                      const imageSource = getImageSource(imageItem);
                      if (!imageSource) return null;

                      const imageProps = getImageProps(imageSource.image, 1200);
                      if (!imageProps) return null;
                      const dims = imageSource.image?.asset?.metadata?.dimensions;
                      const iw = Math.round(dims?.width || 1200);
                      const ih = Math.round(dims?.height || 800);

                      const span = imageItem.colSpan && imageItem.colSpan > 1 ? imageItem.colSpan : undefined;

                      return (
                        <div
                          key={imageItem._key || `grid-image-${index}`}
                          className="relative overflow-hidden"
                          style={span ? { gridColumn: `span ${span}` } : undefined}
                        >
                          <ImageWithBlur
                            src={imageProps.src}
                            alt=""
                            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                            sizes={`(max-width: 768px) ${Math.round(100 / cols)}vw, ${Math.round(80 / cols)}vw`}
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
            alt=""
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
      const { source, uploadedImage, indexItemRef, layout, width, customWidth, alignment, caption, captionPosition } = value;

      let imageToRender = null;
      let displayCaption = caption;

      if (source === 'upload' && uploadedImage) {
        imageToRender = uploadedImage;
      } else if (source === 'reference' && indexItemRef?.featuredMedia?.image) {
        imageToRender = indexItemRef.featuredMedia.image;
        if (!displayCaption && indexItemRef.description) {
          displayCaption = indexItemRef.description;
        }
      }

      if (!imageToRender) return null;

      // Resolve width: prefer new width field, fall back to legacy layout field
      const resolvedWidth = width
        ? getWidthStyle(width, customWidth, '100%')
        : legacyLayoutToWidth(layout);

      const justifyClass = alignmentClass[alignment] || 'justify-center';
      const capClass = captionAlignClass[captionPosition] || 'text-center';

      const imageProps = getImageProps(imageToRender, 2400);
      if (!imageProps) return null;
      const dims = imageToRender?.asset?.metadata?.dimensions;
      const iw = Math.round(dims?.width || 1200);
      const ih = Math.round(dims?.height || 800);

      return (
        <div className="my-8">
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '0.5px' }}
            />
            <figure className={`relative z-10 mx-4 sm:mx-6 lg:mx-8 flex ${justifyClass}`}>
              <div className="w-full" style={{ maxWidth: resolvedWidth }}>
                <ImageWithBlur
                  src={imageProps.src}
                  alt=""
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
          {displayCaption && (
            <figcaption className={`mt-2 text-sm text-muted ${capClass}`}>
              {displayCaption}
            </figcaption>
          )}

        </div>
      );
    },

    spacer: ({ value }) => {
      // Support both new number field and legacy string value
      let heightRem = 8;
      if (typeof value.height === 'number') {
        heightRem = value.height;
      } else if (typeof value.height === 'string') {
        const parsed = parseFloat(value.height);
        if (!isNaN(parsed)) heightRem = parsed;
      }

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