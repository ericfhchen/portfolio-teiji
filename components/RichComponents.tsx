import Image from 'next/image';
import Link from 'next/link';
import { PortableTextComponents } from 'next-sanity';
import { getImageProps } from '@/lib/image';
import { getVideoSource, posterFromSanity } from '@/lib/mux';
import { client } from '@/lib/sanity.client';

const RichComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const imageProps = getImageProps(value, 1200, 800);
      if (!imageProps) return null;

      return (
        <figure className="my-8">
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={imageProps.src}
              alt={imageProps.alt}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={imageProps.blurDataURL}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
          {imageProps.alt && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {imageProps.alt}
            </figcaption>
          )}
        </figure>
      );
    },

    imageLayout: ({ value }) => {
      const { image, layout, caption } = value;
      const imageProps = getImageProps(image, layout === 'small' ? 400 : layout === 'medium' ? 800 : 1200);
      if (!imageProps) return null;

      // Define layout styles
      const layoutStyles = {
        full: 'w-full',
        medium: 'w-full max-w-[60%] mx-auto',
        small: 'w-full max-w-[20%] mx-auto',
      };

      const containerClass = layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full;

      return (
        <figure className={`my-8 ${containerClass}`}>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg">
            <Image
              src={imageProps.src}
              alt={imageProps.alt}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={imageProps.blurDataURL}
              sizes={
                layout === 'small' 
                  ? '(max-width: 768px) 50vw, 20vw'
                  : layout === 'medium'
                  ? '(max-width: 768px) 80vw, 60vw'
                  : '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px'
              }
            />
          </div>
          {(caption || imageProps.alt) && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {caption || imageProps.alt}
            </figcaption>
          )}
        </figure>
      );
    },

    imageDual: ({ value }) => {
      const { images, caption } = value;
      if (!images?.length || images.length !== 2) return null;

      return (
        <figure className="my-8 w-full max-w-[60%] mx-auto">
          <div className="grid grid-cols-2 gap-4">
            {images.map((image: any, index: number) => {
              const imageProps = getImageProps(image, 400);
              if (!imageProps) return null;

              return (
                <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src={imageProps.src}
                    alt={imageProps.alt}
                    fill
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL={imageProps.blurDataURL}
                    sizes="(max-width: 768px) 40vw, 30vw"
                  />
                </div>
              );
            })}
          </div>
          {caption && (
            <figcaption className="mt-2 text-sm text-muted text-center">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    },
    
    videoMux: ({ value }) => {
      const {
        playbackId,
        poster,
        captions,
        autoplay = false,
        loop = false,
        muted = false,
        controls = true,
      } = value;
      
      const videoSource = getVideoSource(playbackId);
      const posterUrl = posterFromSanity(poster);
      
      // Get captions URL if available
      let captionsUrl = '';
      if (captions?.asset?._ref) {
        const assetId = captions.asset._ref.replace('file-', '').replace('-vtt', '');
        captionsUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${assetId}.vtt`;
      }

      return (
        <div className="my-8">
          <video
            controls={controls}
            playsInline
            preload="metadata"
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            poster={posterUrl || undefined}
            className="w-full rounded-lg"
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
    },

    imageRow: ({ value }) => {
      const { images } = value;
      if (!images?.length) return null;

      return (
        <div className={`my-8 grid gap-4 ${images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.map((image: any, index: number) => {
            const imageProps = getImageProps(image, 600);
            if (!imageProps) return null;

            return (
              <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={imageProps.src}
                  alt={imageProps.alt}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={imageProps.blurDataURL}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            );
          })}
        </div>
      );
    },

    imageBleed: ({ value }) => {
      const { image } = value;
      const imageProps = getImageProps(image, 1600, 900);
      if (!imageProps) return null;

      return (
        <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={imageProps.src}
              alt={imageProps.alt}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={imageProps.blurDataURL}
              sizes="100vw"
            />
          </div>
        </div>
      );
    },

    textAside: ({ value }) => {
      const { body, aside } = value;

      return (
        <div className="my-8 grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-4">
            {body?.map((block: any, index: number) => (
              <p key={index} className="text-var">
                {block.children?.map((child: any) => child.text).join('')}
              </p>
            ))}
          </div>
          <aside className="text-sm text-muted">
            {aside}
          </aside>
        </div>
      );
    },
  },

  block: {
    normal: ({ children }) => <p className="my-4 text-var">{children}</p>,
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-var pl-6 text-muted italic">
        {children}
      </blockquote>
    ),
    caption: ({ children }) => (
      <p className="my-2 text-sm text-muted text-center">{children}</p>
    ),
    small: ({ children }) => (
      <p className="my-2 text-xs text-muted">{children}</p>
    ),
  },

  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
  },
};

export default RichComponents;