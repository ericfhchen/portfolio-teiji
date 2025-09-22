import Image from 'next/image';
import Link from 'next/link';
import { PortableText, PortableTextComponents } from 'next-sanity';
import { getImageProps, isVerticalMedia } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import ImageWithGrid from '@/components/ImageWithGrid';
import { VideoLayout, VideoBleed } from '@/components/VideoPlayer';
import ImageWithBlur from '@/components/ImageWithBlur';

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
                <ImageWithBlur
                  src={imageProps.src}
                  alt=""
                  lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
                />
              </div>
            </figure>
          </div>
        </div>
      );
    },


    imageDual: ({ value }) => {
      const { images, caption } = value;
      if (!images?.length || images.length !== 2) return null;

      // Helper function to get the appropriate image source
      const getImageSource = (imageItem: any) => {
        if (imageItem.source === 'reference' && imageItem.indexItemRef?.image) {
          return {
            image: imageItem.indexItemRef.image,
          };
        } else if (imageItem.source === 'upload' && imageItem.uploadedImage) {
          return {
            image: imageItem.uploadedImage,
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
            <figure className="relative z-10 max-w-7xl mx-auto flex justify-center">
              <div className="w-full max-w-[90%] sm:max-w-[60%]">
                <div className="grid grid-cols-2 gap-4 sm:gap-16">
                  {images
                    .map((imageItem: any, index: number) => {
                      const imageSource = getImageSource(imageItem);
                      if (!imageSource) return null;
                      
                      const imageProps = getImageProps(imageSource.image, 400);
                      if (!imageProps) return null;

                      return (
                        <div key={imageItem._key || `dual-image-${index}`} className="relative overflow-hidden">
                          <ImageWithBlur
                            src={imageProps.src}
                            alt=""
                            lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                            sizes="(max-width: 768px) 40vw, 30vw"
                            className="w-full h-auto"
                            fill={false}
                            width={400}
                            height={300}
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
      // console.log('🎥 videoMux component received value:', value);
      const playbackIdToUse = getPlaybackId(value);
      if (!playbackIdToUse) {
        console.error('No valid playback ID found in video data:', value);
        return null; // Return null instead of error div to avoid layout issues
      }
      
      try {
        // Use VideoLayout component for consistent vertical handling
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
        const imageProps = getImageProps(media.image, 1600, 900);
        if (!imageProps) return null;

      return (
        <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <ImageWithBlur
              src={imageProps.src}
              alt=""
              lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      );
      }
      
      // Fallback if neither image nor video
      return null;
    },

    
    projectImage: ({ value }) => {
      const { source, uploadedImage, indexItemRef, layout, caption } = value;
      
      let imageToRender = null;
      let displayCaption = caption;
      
      if (source === 'upload' && uploadedImage) {
        imageToRender = uploadedImage;
      } else if (source === 'reference' && indexItemRef) {
        imageToRender = indexItemRef.image;
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
                <ImageWithBlur
                  src={imageProps.src}
                  alt=""
                  lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  className="object-cover"
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
      // Always use 8rem height (value.height will always be '8rem')
      const spacerClass = 'h-32'; // 8rem

      return (
        <div 
          className={spacerClass}
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