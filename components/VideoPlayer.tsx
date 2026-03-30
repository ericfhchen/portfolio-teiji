'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { getVideoSourceFromMux, getPlaybackId } from '@/lib/mux';
import { isVerticalMedia } from '@/lib/image';
import CustomCursor from './CustomCursor';
import Hls from 'hls.js';


// VideoLayout component for layout-aware video rendering
export function VideoLayout({ video, layout, caption, alt, isPortableText = false }: {
  video: any;
  layout: string;
  caption?: string;
  alt?: string;
  isPortableText?: boolean;
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
        style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
        />
        {/* Video centered within normal content width with layout sizing */}
        <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
          <div className={`relative ${
            isPortableText
              ? video?.width === 'half'
                ? 'w-full md:w-1/2'
                : 'w-full md:w-full md:max-w-4xl'
              : isVertical
                ? 'max-h-[60vh]'
                : 'aspect-[3/2]'
          } overflow-hidden ${
            isPortableText
              ? ''
              : layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full
          }`}>
            <VideoPlayer
              video={video}
              objectFit="contain"
              isVertical={isVertical}
              showMuteButton={!isPortableText}
            />
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

// Detect whether a video element has an audio track
function detectHasAudio(video: HTMLVideoElement): boolean {
  // WebKit/Chrome: mozHasAudio or webkitAudioDecodedByteCount
  if ((video as any).mozHasAudio !== undefined) {
    return (video as any).mozHasAudio;
  }
  if ((video as any).webkitAudioDecodedByteCount !== undefined) {
    return (video as any).webkitAudioDecodedByteCount > 0;
  }
  // Standard: audioTracks API
  if ((video as any).audioTracks !== undefined) {
    return (video as any).audioTracks.length > 0;
  }
  // Fallback: assume has audio (safe default to show mute button)
  return true;
}

// VideoPlayer component
export function VideoPlayer({ video, objectFit = 'contain', isVertical = false, autoPlay = true, showMuteButton = true, onHasAudioDetected }: {
  video: any;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  isVertical?: boolean;
  autoPlay?: boolean;
  showMuteButton?: boolean;
  onHasAudioDetected?: (hasAudio: boolean) => void;
}) {
  // Hooks must be declared unconditionally (Rules of Hooks)
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState<boolean | null>(null);
  const [actualDimensions, setActualDimensions] = useState<{width: number, height: number} | null>(null);

  // Custom cursor for play/pause
  const [cursorText, setCursorText] = useState<string>('');
  const [showCursor, setShowCursor] = useState(false);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Detect fine pointer
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    const update = (e?: MediaQueryListEvent) => {
      setIsFinePointer(e ? e.matches : mq.matches);
    };
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      // @ts-ignore deprecated
      mq.addListener(update);
      return () => {
        // @ts-ignore deprecated
        mq.removeListener(update);
      };
    }
  }, []);

  // Validation after hooks
  const playbackId = getPlaybackId(video);

  let videoSource;
  try {
    videoSource = getVideoSourceFromMux(video);
  } catch {
    videoSource = null;
  }

  // Get captions URL if available
  const projectIdEnv = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
  const datasetEnv = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  let captionsUrl = '';
  if (video.captions?.asset?._ref) {
    const assetId = video.captions.asset._ref.replace('file-', '').replace('-vtt', '');
    captionsUrl = `https://cdn.sanity.io/files/${projectIdEnv}/${datasetEnv}/${assetId}.vtt`;
  }

  if (!playbackId || !videoSource?.src) {
    return null;
  }

  // Setup HLS.js for Chrome
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSource?.src) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Prefer HLS.js when available (Chrome returns "maybe" for HLS canPlayType but can't actually play it)
    if (Hls.isSupported()) {
      let mediaErrorRecoveries = 0;

      const hls = new Hls({
        enableWorker: false,
      });

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
              // Destroy and recreate — startLoad() alone can't fix a closed MediaSource
              hls.destroy();
              hlsRef.current = null;
              const retry = new Hls({ enableWorker: false });
              retry.loadSource(videoSource.src);
              retry.attachMedia(video);
              retry.on(Hls.Events.MANIFEST_PARSED, () => {
                if (autoPlay) {
                  video.play().catch(() => {});
                }
              });
              retry.on(Hls.Events.ERROR, (e, d) => {
                if (d.fatal) {
                  retry.destroy();
                }
              });
              hlsRef.current = retry;
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (mediaErrorRecoveries < 2) {
                mediaErrorRecoveries++;
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(videoSource.src);
      hls.attachMedia(video);

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl') === 'probably') {
      // Native HLS (Safari) — only trust "probably", not "maybe"
      video.src = videoSource.src;
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

  // Capture actual video dimensions and detect audio when metadata loads
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

    // Detect audio after some data has loaded
    const handleLoadedData = () => {
      const audioDetected = detectHasAudio(videoElement);
      setHasAudio(audioDetected);
      onHasAudioDetected?.(audioDetected);
    };

    // For HLS.js, also check after playing starts (webkitAudioDecodedByteCount needs playback)
    const handleTimeUpdate = () => {
      if (hasAudio === null && videoElement.currentTime > 0.1) {
        const audioDetected = detectHasAudio(videoElement);
        setHasAudio(audioDetected);
        onHasAudioDetected?.(audioDetected);
        // Remove listener once detected
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [hasAudio, onHasAudioDetected]);

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

  const handleMouseEnter = useCallback(() => {
    if (!isFinePointer) return;
    setCursorText(isPlaying ? 'PAUSE' : 'PLAY');
    setShowCursor(true);
  }, [isFinePointer, isPlaying]);

  const handleMouseLeave = useCallback(() => {
    setShowCursor(false);
    setCursorText('');
  }, []);

  // Update cursor text when play state changes while hovering
  useEffect(() => {
    if (showCursor) {
      setCursorText(isPlaying ? 'PAUSE' : 'PLAY');
    }
  }, [isPlaying, showCursor]);

  // Use height-constrained approach for vertical videos
  const actuallyVertical = actualDimensions
    ? actualDimensions.height > actualDimensions.width
    : isVertical;

  // Only show mute if showMuteButton prop is true AND audio is detected
  const shouldShowMute = showMuteButton && hasAudio === true;

  return (
    <div
      className="relative group w-full h-full md:cursor-none"
      onClick={handleVideoClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-video-container
    >
      <video
        ref={videoRef}
        className={`w-full h-full object-${objectFit}`}
        autoPlay={autoPlay}
        loop={true}
        muted
        playsInline
        preload="metadata"
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

      {/* Unmute button - only shown when video has audio */}
      {shouldShowMute && (
        <>
          {/* Mobile: button below video */}
          <button
            onClick={toggleMute}
            className="md:hidden absolute -bottom-8 right-0 z-30 text-var text-xs font-light tracking-wider hover:opacity-60 transition-opacity px-0 py-1"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? 'UNMUTE' : 'MUTE'}
          </button>

          {/* Desktop: button overlaying bottom right */}
          <button
            onClick={toggleMute}
            className="hidden md:block absolute bottom-0 right-0 z-30 text-var text-xs font-light tracking-wider hover:opacity-60 transition-opacity px-2 py-1"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? 'UNMUTE' : 'MUTE'}
          </button>
        </>
      )}

      {/* Custom PLAY/PAUSE cursor */}
      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}
