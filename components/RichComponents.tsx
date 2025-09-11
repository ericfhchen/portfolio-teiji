import Image from 'next/image';
import Link from 'next/link';
import { PortableText, PortableTextComponents } from 'next-sanity';
import { getImageProps } from '@/lib/image';
import { getVideoSourceFromMux, getPlaybackId, posterFromSanity } from '@/lib/mux';
import { client } from '@/lib/sanity.client';
import ImageWithGrid from '@/components/ImageWithGrid';
import { VideoLayout, VideoBleed } from '@/components/VideoPlayer';

const RichComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageProps = getImageProps(value, 1200, 800);
      if (!imageProps) return null;

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
              <div className="relative aspect-[3/2] w-full max-w-4xl overflow-hidden ">
                <Image
                  src={imageProps.src}
                  alt={imageProps.alt}
                  fill
                  className="object-cover"
                  {...(imageProps.hasBlur && {
                    placeholder: "blur" as const,
                    blurDataURL: imageProps.blurDataURL,
                  })}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </figure>
          </div>
          {imageProps.alt && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {imageProps.alt}
            </figcaption>
          )}
        </div>
      );
    },

    imageLayout: ({ value }) => {
      const { media, layout, caption } = value;
      
      if (!media) return null;
      
      if (media.mediaType === 'video' && media.video) {
        return <VideoLayout video={media.video} layout={layout} caption={caption} alt={media.alt} />;
      }
      
      if (media.mediaType === 'image' && media.image) {
        const imageProps = getImageProps(media.image, layout === 'small' ? 400 : layout === 'medium' ? 800 : 1200);
        if (!imageProps) return null;

      // Define layout styles
      const layoutStyles = {
        full: 'w-full max-w-4xl',
        medium: 'w-full max-w-[60%]',
        small: 'w-full max-w-[40%]',
      };

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
            {/* Image centered within normal content width with layout sizing */}
            <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
              <div className={`relative aspect-[3/2] overflow-hidden ${layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full}`}>
                <Image
                  src={imageProps.src}
                  alt={imageProps.alt}
                  fill
                  className="object-cover"
                  {...(imageProps.hasBlur && {
                    placeholder: "blur" as const,
                    blurDataURL: imageProps.blurDataURL,
                  })}
                  sizes={
                    layout === 'small' 
                      ? '(max-width: 768px) 50vw, 40vw'
                      : layout === 'medium'
                      ? '(max-width: 768px) 80vw, 60vw'
                      : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
                  }
                />
              </div>
            </figure>
          </div>
          {(caption || imageProps.alt || media.alt) && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {caption || imageProps.alt || media.alt}
            </figcaption>
          )}
        </div>
      );
      }
      
      // Fallback if neither image nor video
      return null;
    },

    imageDual: ({ value }) => {
      const { images, caption } = value;
      if (!images?.length || images.length !== 2) return null;

      // Helper function to get the appropriate image source
      const getImageSource = (imageItem: any) => {
        if (imageItem.source === 'reference' && imageItem.indexItemRef?.image) {
          return {
            image: imageItem.indexItemRef.image,
            alt: imageItem.indexItemRef.image.alt || imageItem.indexItemRef.title || '',
          };
        } else if (imageItem.source === 'upload' && imageItem.uploadedImage) {
          return {
            image: imageItem.uploadedImage,
            alt: imageItem.uploadedImage.alt || '',
          };
        }
        return null;
      };

      return (
        <div className="my-8">
          {/* Full-width container that breaks out of prose constraints */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
            {/* Full-width horizontal line at vertical center, behind images */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '0.5px' }}
            />
            {/* Images centered within normal content width */}
            <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
              <div className="w-full max-w-[60%]">
                <div className="grid grid-cols-2 gap-16">
                  {images
                    .map((imageItem: any, index: number) => {
                      const imageSource = getImageSource(imageItem);
                      if (!imageSource) return null;
                      
                      const imageProps = getImageProps(imageSource.image, 400);
                      if (!imageProps) return null;

                      return (
                        <div key={imageItem._key || `dual-image-${index}`} className="relative">
                          <Image
                            src={imageProps.src}
                            alt={imageSource.alt || imageProps.alt}
                            width={0}
                            height={0}
                            className="w-full h-auto"
                            {...(imageProps.hasBlur && {
                              placeholder: "blur" as const,
                              blurDataURL: imageProps.blurDataURL,
                            })}
                            sizes="(max-width: 768px) 40vw, 30vw"
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
            <figcaption className="mt-2 text-sm text-muted text-center">
              {caption}
            </figcaption>
          )}
        </div>
      );
    },
    
    videoMux: ({ value }) => {
      const {
        asset,
        poster,
        captions,
        displayMode
      } = value;
      
      const playbackIdToUse = getPlaybackId(value);
      if (!playbackIdToUse) {
        console.error('No valid playback ID found in video data:', value);
        return null; // Return null instead of error div to avoid layout issues
      }
      
      try {
        const videoSource = getVideoSourceFromMux(value);
        const posterUrl = posterFromSanity(poster);
        
        // Ensure we have a valid video source
        if (!videoSource?.src) {
          console.error('No valid video source generated:', videoSource);
          return null;
        }
        
        // Get captions URL if available
        let captionsUrl = '';
        if (captions?.asset?._ref) {
          const assetId = captions.asset._ref.replace('file-', '').replace('-vtt', '');
          captionsUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${assetId}.vtt`;
        }

        return (
          <div className="my-8">
            <video
              controls={true}
              playsInline
              preload="metadata"
              autoPlay={false}
              loop={false}
              muted={true}
              {...(posterUrl && { poster: posterUrl })}
              className="w-full"
            >
              <source src={videoSource.src} type={videoSource.type} />
              {captionsUrl && (
                <track
                  kind="captions"
                  src={captionsUrl}
                  srcLang="en"
                  label="English"
                  default
                />
              )}
              Your browser does not support the video tag.
            </video>
          </div>
        );
      } catch (error) {
        console.error('Error rendering video:', error);
        return null;
      }
    },

    imageRow: ({ value }) => {
      const { images } = value;
      if (!images?.length) return null;

      return (
        <div className={`my-8 grid gap-4 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images
            .map((image: any, index: number) => {
              const imageProps = getImageProps(image, 600);
              if (!imageProps) return null;

              return (
                <div key={image._key || image.asset?._ref || `row-image-${index}`} className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={imageProps.src}
                    alt={imageProps.alt}
                    fill
                    className="object-cover"
                    {...(imageProps.hasBlur && {
                      placeholder: "blur" as const,
                      blurDataURL: imageProps.blurDataURL,
                    })}
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              );
            })
            .filter(Boolean)}
        </div>
      );
    },

    imageBleed: ({ value }) => {
      const { media } = value;
      
      if (!media) return null;
      
      if (media.mediaType === 'video' && media.video) {
        return <VideoBleed video={media.video} alt={media.alt} />;
      }
      
      if (media.mediaType === 'image' && media.image) {
        const imageProps = getImageProps(media.image, 1600, 900);
        if (!imageProps) return null;

      return (
        <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={imageProps.src}
              alt={imageProps.alt}
              fill
              className="object-cover"
              {...(imageProps.hasBlur && {
                placeholder: "blur" as const,
                blurDataURL: imageProps.blurDataURL,
              })}
              sizes="100vw"
            />
          </div>
        </div>
      );
      }
      
      // Fallback if neither image nor video
      return null;
    },

    textAside: ({ value }) => {
      const { body, aside } = value;

      return (
        <div className="my-8 grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            <PortableText 
              value={body || []} 
              components={{
                block: {
                  normal: ({ children }) => (
                    <div className="w-3/5 mx-auto">
                      <p className="text-var">{children}</p>
                    </div>
                  ),
                  blockquote: ({ children }) => (
                    <div className="w-3/5 mx-auto">
                      <blockquote className="border-l-4 border-var pl-6 text-muted italic">
                        {children}
                      </blockquote>
                    </div>
                  ),
                  caption: ({ children }) => (
                    <div className="w-3/5 mx-auto">
                      <p className="text-sm text-muted text-center">{children}</p>
                    </div>
                  ),
                  small: ({ children }) => (
                    <div className="w-3/5 mx-auto">
                      <p className="text-xs text-muted">{children}</p>
                    </div>
                  ),
                },
                marks: {
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                },
              }}
            />
          </div>
          <aside className="text-sm text-muted">
            {aside}
          </aside>
        </div>
      );
    },
    
    projectImage: ({ value }) => {
      const { source, uploadedImage, indexItemRef, layout, caption } = value;
      
      let imageToRender = null;
      let altText = '';
      let displayCaption = caption;
      
      if (source === 'upload' && uploadedImage) {
        imageToRender = uploadedImage;
        altText = uploadedImage.alt || '';
      } else if (source === 'reference' && indexItemRef) {
        imageToRender = indexItemRef.image;
        altText = indexItemRef.image?.alt || indexItemRef.title || '';
        // Use index item description as fallback caption if no custom caption
        if (!displayCaption && indexItemRef.description) {
          displayCaption = indexItemRef.description;
        }
      }
      
      if (!imageToRender) return null;
      
      const imageProps = getImageProps(
        imageToRender, 
        layout === 'small' ? 400 : layout === 'medium' ? 800 : 1200
      );
      if (!imageProps) return null;
      
      // Define layout styles (same as your existing imageLayout)
      const layoutStyles = {
        full: 'w-full max-w-4xl',
        medium: 'w-full max-w-[60%]',
        small: 'w-full max-w-[40%]',
      };
      
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
            {/* Image centered within normal content width with layout sizing */}
            <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
              <div className={`relative aspect-[3/2] overflow-hidden ${layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full}`}>
                <Image
                  src={imageProps.src}
                  alt={altText}
                  fill
                  className="object-cover"
                  {...(imageProps.hasBlur && {
                    placeholder: "blur" as const,
                    blurDataURL: imageProps.blurDataURL,
                  })}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </figure>
          </div>
          {displayCaption && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {displayCaption}
            </figcaption>
          )}
          
        </div>
      );
    },

    spacer: ({ value }) => {
      const { height, customHeight } = value;
      
      // Map height values to CSS custom properties or classes
      const heightMap = {
        small: 'h-8',    // 2rem
        medium: 'h-16',  // 4rem  
        large: 'h-24',   // 6rem
        xl: 'h-32',      // 8rem
      };
      
      const spacerClass = height === 'custom' 
        ? '' 
        : heightMap[height as keyof typeof heightMap] || heightMap.medium;
      
      const customStyle = height === 'custom' && customHeight 
        ? { height: `${customHeight}rem` }
        : undefined;

      return (
        <div 
          className={spacerClass}
          style={customStyle}
          aria-hidden="true"
        />
      );
    },
  },

  block: {
    normal: ({ children }) => (
      <div className="w-3/5 mx-auto">
        <p className="my-4 text-var">{children}</p>
      </div>
    ),
    blockquote: ({ children }) => (
      <div className="w-3/5 mx-auto">
        <blockquote className="my-6 border-l-4 border-var pl-6 text-muted italic">
          {children}
        </blockquote>
      </div>
    ),
    caption: ({ children }) => (
      <div className="w-3/5 mx-auto">
        <p className="my-2 text-sm text-muted text-center">{children}</p>
      </div>
    ),
    small: ({ children }) => (
      <div className="w-3/5 mx-auto">
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