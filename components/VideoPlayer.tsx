'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getVideoSourceFromMux, getPlaybackId, posterFromSanity } from '@/lib/mux';
import { client } from '@/lib/sanity.client';
import { isVerticalMedia } from '@/lib/image';
import Hls from 'hls.js';

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
export function VideoPlayer({ video, objectFit = 'contain', isVertical = false, autoPlay = true, showMuteButton = true }: { 
  video: any; 
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  isVertical?: boolean;
  autoPlay?: boolean;
  showMuteButton?: boolean;
}) {
  // Early validation before any hooks
  const playbackId = getPlaybackId(video);
  if (!playbackId) {
    return null;
  }

  let videoSource;
  let posterUrl;
  try {
    videoSource = getVideoSourceFromMux(video);
    if (!videoSource?.src) {
      return null;
    }
    posterUrl = posterFromSanity(video.poster);
  } catch (error) {
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
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [actualDimensions, setActualDimensions] = useState<{width: number, height: number} | null>(null);

  // Setup HLS.js for Chrome
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSource?.src) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if browser supports HLS natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource.src;
    } else if (Hls.isSupported()) {
      // Use HLS.js for Chrome and other browsers
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
      });
      
      hls.loadSource(videoSource.src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay prevented, user will need to interact
          });
        }
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
      
      hlsRef.current = hls;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoSource?.src, autoPlay]);

  // Handle autoplay changes (for hover videos)
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !autoPlay) return;

    // If autoplay becomes true and video is paused, start playing
    if (video.paused) {
      video.play().catch(() => {
        // Autoplay prevented, user will need to interact
      });
    }
  }, [autoPlay]);

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

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent video click when clicking unmute button
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);


  // Use height-constrained approach for vertical videos
  const actuallyVertical = actualDimensions 
    ? actualDimensions.height > actualDimensions.width 
    : isVertical;

  return (
    <div className="relative group cursor-pointer w-full h-full" onClick={handleVideoClick}>
      <video
        ref={videoRef}
        className={`w-full h-full object-${objectFit}`}
        autoPlay={autoPlay}
        loop={true}
        muted={isMuted}
        playsInline
        preload="metadata"
        {...(posterUrl && { poster: posterUrl })}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
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
      
      {/* Unmute button - positioned at bottom right, only show if showMuteButton is true */}
      {showMuteButton && (
        <button
          onClick={toggleMute}
          className="absolute bottom-0 right-0 z-10 text-var text-xs font-light tracking-wider hover:opacity-60 transition-opacity bg-black/20 px-2 py-1 rounded"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? 'UNMUTE' : 'MUTE'}
        </button>
      )}
    </div>
  );
}