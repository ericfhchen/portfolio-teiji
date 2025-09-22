'use client';

import { getImageProps } from '@/lib/image';
import { getPlaybackId } from '@/lib/mux';
import { VideoLayout, VideoPlayer } from '@/components/VideoPlayer';
import { isVerticalMedia } from '@/lib/image';
import ImageWithBlur from '@/components/ImageWithBlur';

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
        <ImageWithBlur
          src={imageProps.src}
          alt={imageProps.alt}
          lqip={imageProps.hasBlur ? imageProps.blurDataURL : undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
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

