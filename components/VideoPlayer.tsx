'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getVideoSourceFromMux, getPlaybackId, posterFromSanity } from '@/lib/mux';
import { client } from '@/lib/sanity.client';
import { isVerticalMedia } from '@/lib/image';

// VideoLayout component for layout-aware video rendering
export function VideoLayout({ video, layout, caption, alt }: { 
  video: any; 
  layout: string; 
  caption?: string; 
  alt?: string; 
}) {
  const layoutStyles = {
    full: 'w-full max-w-4xl',
    medium: 'w-full max-w-[60%]',
    small: 'w-full max-w-[40%]',
  };

  const isVertical = isVerticalMedia(video);

  return (
    <div className="my-8">
      {/* Full-width container that breaks out of prose constraints */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Full-width horizontal line at vertical center, behind video */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
        style={{ height: '0.5px' }}
        />
        {/* Video centered within normal content width with layout sizing */}
        <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
          <div className={`relative ${isVertical ? 'max-h-[60vh]' : 'aspect-[3/2]'} overflow-hidden ${layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full}`}>
            <VideoPlayer video={video} objectFit="contain" isVertical={isVertical} />
          </div>
        </figure>
      </div>
      {(caption || alt) && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {caption || alt}
        </figcaption>
      )}
    </div>
  );
}

// VideoBleed component for full-bleed video rendering
export function VideoBleed({ video, alt }: { video: any; alt?: string }) {
  const isVertical = isVerticalMedia(video);
  
  return (
    <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className={`relative w-full overflow-hidden ${isVertical ? 'max-h-[80vh]' : 'aspect-[16/9]'}`}>
        <VideoPlayer video={video} objectFit="cover" isVertical={isVertical} />
      </div>
      {alt && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {alt}
        </figcaption>
      )}
    </div>
  );
}

// VideoPlayer component
export function VideoPlayer({ video, objectFit = 'contain', isVertical = false }: { 
  video: any; 
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  isVertical?: boolean;
}) {
  // Early validation before any hooks
  const playbackId = getPlaybackId(video);
  if (!playbackId) {
    console.error('No valid playback ID found in video data:', video);
    return null;
  }

  let videoSource;
  let posterUrl;
  try {
    videoSource = getVideoSourceFromMux(video);
    if (!videoSource?.src) {
      console.error('No valid video source generated:', videoSource);
      return null;
    }
    posterUrl = posterFromSanity(video.poster);
  } catch (error) {
    console.error('Error processing video data:', error);
    return null;
  }

  // Get captions URL if available
  let captionsUrl = '';
  if (video.captions?.asset?._ref) {
    const assetId = video.captions.asset._ref.replace('file-', '').replace('-vtt', '');
    captionsUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${assetId}.vtt`;
  }

  // Now declare hooks after all validation and data processing
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [actualDimensions, setActualDimensions] = useState<{width: number, height: number} | null>(null);

  // Capture actual video dimensions when metadata loads
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      const dims = {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
      };
      setActualDimensions(dims);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  const handleVideoClick = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the video click handler
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  // Use height-constrained approach for vertical videos
  const actuallyVertical = actualDimensions 
    ? actualDimensions.height > actualDimensions.width 
    : isVertical;

  return (
    <div className="relative group cursor-pointer w-full h-full" onClick={handleVideoClick}>
      <video
        ref={videoRef}
        className={`w-full h-full object-${objectFit}`}
        autoPlay={true}
        loop={true}
        muted={isMuted}
        playsInline
        preload="metadata"
        {...(posterUrl && { poster: posterUrl })}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
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
      
      {/* Mute/Unmute Button */}
      <button 
        className="absolute bottom-0 right-0 z-10 px-2 py-1 bg-black/50 text-white text-xs font-medium tracking-wider rounded hover:opacity-60 transition-opacity"
        onClick={handleMuteToggle}
      >
        {isMuted ? 'UNMUTE' : 'MUTE'}
      </button>
    </div>
  );
}