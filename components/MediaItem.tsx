import Image from 'next/image';
import { getImageProps } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import { VideoLayout, VideoPlayer } from '@/components/VideoPlayer';
import { isVerticalMedia } from '@/lib/image';

interface MediaItemProps {
  mediaItem: {
    mediaType: 'image' | 'video';
    image?: {
      asset: any;
      lqip?: string;
      alt?: string;
    };
    video?: {
      asset: {
        asset: {
          playbackId: string;
          data: any;
          status: string;
          assetId: string;
        };
      };
      displayMode?: string;
      controls?: boolean;
      poster?: {
        asset: any;
        lqip?: string;
        alt?: string;
      };
      captions?: {
        asset: any;
      };
    };
    alt?: string;
  };
  className?: string;
}

export default function MediaItem({ mediaItem, className = '' }: MediaItemProps) {
  if (!mediaItem) return null;

  const { mediaType, alt } = mediaItem;

  if (mediaType === 'image' && mediaItem.image) {
    const imageProps = getImageProps(mediaItem.image, 800, 600);
    if (!imageProps) return null;

    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageProps.src}
          alt={imageProps.alt}
          fill
          className="object-cover"
          {...(imageProps.hasBlur && {
            placeholder: "blur" as const,
            blurDataURL: imageProps.blurDataURL,
          })}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  if (mediaType === 'video' && mediaItem.video) {
    const playbackId = getPlaybackId(mediaItem.video);
    if (!playbackId) return null;

    const isVertical = isVerticalMedia(mediaItem.video);

    return (
      <div className={`relative overflow-hidden h-full w-full ${className}`}>
        <div className="h-full w-full">
          <VideoPlayer
            video={mediaItem.video}
            objectFit="cover"
            isVertical={isVertical}
            showMuteButton={false}
          />
        </div>
      </div>
    );
  }

  return null;
}
