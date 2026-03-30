'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CustomCursor from './CustomCursor';
import { FeedItem } from '@/sanity/schema';
import { getVideoSource } from '@/lib/mux';
import Hls from 'hls.js';
import ImageWithBlur from '@/components/ImageWithBlur';

interface SlideshowProps {
  items: FeedItem[];
  section: string;
  autoPlayInterval?: number; // in milliseconds, defaults to 5000 (5 seconds)
}

export default function Slideshow({ items, section, autoPlayInterval = 5000 }: SlideshowProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom cursor state
  const [cursorText, setCursorText] = useState<string>('');
  const [showCursor, setShowCursor] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Touch/swipe state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Reset to first image if items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop auto-play based on isPlaying state
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      stopAutoPlay();
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % items.length);
      }, autoPlayInterval);
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, stopAutoPlay, items.length, autoPlayInterval]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % items.length);
    stopAutoPlay();
    setIsPlaying(true);
  }, [items.length, stopAutoPlay]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
    stopAutoPlay();
    setIsPlaying(true);
  }, [items.length, stopAutoPlay]);

  const handleItemClick = useCallback((item: FeedItem) => {
    router.push(`/${section}/${item.parentSlug}`);
  }, [section, router]);

  // Pause auto-play on mouse enter, resume on leave
  const handleMouseEnter = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (items.length > 1) {
      setIsPlaying(true);
    }
  }, [items.length]);

  // Touch handlers for swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">No featured works found.</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div
      className="relative w-full h-[100dvh] overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-screen navigation area – single element to avoid compositing seam at center */}
      <div
        className="absolute inset-0 z-20 cursor-none"
        role="button"
        tabIndex={0}
        onClick={(e) => {
          if (e.button !== 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          if (clickX < rect.width / 2) {
            goToPrevious();
          } else {
            goToNext();
          }
        }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToNext(); } }}
        aria-label="Navigate gallery"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const newText = mouseX < rect.width / 2 ? 'PREV' : 'NEXT';
          if (newText !== cursorText) {
            setCursorText(newText);
          }
          if (!showCursor) {
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
              hideTimeoutRef.current = null;
            }
            setShowCursor(true);
          }
        }}
        onMouseLeave={() => {
          hideTimeoutRef.current = setTimeout(() => {
            setShowCursor(false);
            setCursorText('');
          }, 100);
        }}
      />

      {/* Image container */}
      <div className="group relative w-full h-full flex items-center justify-center">
        {/* Hairline across center */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-10"
              style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
        />

        {/* Desktop-only hover texts on section home – positioned to screen edges, above image */}
        {(currentItem.hoverTextTop || currentItem.hoverTextBottom) && (
          <div className="hidden md:block pointer-events-none absolute inset-0 z-40">
            {currentItem.hoverTextTop && (
              <div
                className={`absolute ${section === 'design' ? 'right-0 pr-8 text-right' : 'left-0 pl-8 text-left'} text-var font-normal text-base opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                style={{ top: 'calc(50% - 2rem)' }}
              >
                {currentItem.hoverTextTop}
              </div>
            )}
            {currentItem.hoverTextBottom && (
              <div
                className={`absolute ${section === 'design' ? 'right-0 pr-8 text-right' : 'left-0 pl-8 text-left'} text-var italic text-base opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
                style={{ top: 'calc(50% + 0.5rem)' }}
              >
                {currentItem.hoverTextBottom}
              </div>
            )}
          </div>
        )}

        {/* Navigation chevrons – mobile only, just above footer nav */}
        {items.length > 1 && (
          <div className="md:hidden pointer-events-none absolute inset-x-0 z-30 flex justify-center gap-6"
            style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom, 0px))' }}>
            <svg
              aria-hidden
              className="w-2 h-4"
              viewBox="0 0 12 24"
              fill="none"
              stroke="var(--fg)"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="10,2 2,12 10,22" />
            </svg>
            <svg
              aria-hidden
              className="w-2 h-4"
              viewBox="0 0 12 24"
              fill="none"
              stroke="var(--fg)"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="2,2 10,12 2,22" />
            </svg>
          </div>
        )}

        {/* Image wrapper with padding – all items stacked, crossfade via opacity */}
        <div className="relative overflow-hidden px-4 py-6 md:p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full h-full flex items-center justify-center">
          <button
            onClick={() => handleItemClick(currentItem)}
            className="group block focus:outline-none cursor-pointer z-30 relative"
            aria-label={`Open ${currentItem.parentTitle} in lightbox`}
          >
            <div className="relative aspect-[3/4] md:aspect-square w-[85vw] md:w-[80vmin]">
              {items.map((item, index) => (
                <div
                  key={item.parentSlug || index}
                  className={`transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  style={index === 0
                    ? { position: 'relative', width: '100%', height: '100%' }
                    : { position: 'absolute', inset: 0 }
                  }
                >
                  {item.mediaType === 'video' && item.playbackId ? (
                    <SlideshowVideoItem item={item} />
                  ) : item.src && item.src.trim() !== '' ? (
                    <ImageWithBlur
                      src={item.src}
                      alt={item.alt || ''}
                      lqip={item.lqip}
                      sizes="80vmin"
                      className="object-contain object-center shadow-none"
                      priority={index === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM10 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </div>
                        <p className="text-sm">Media unavailable</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </button>
        </div>
      </div>

      {/* Custom cursor */}
      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}

// SlideshowVideoItem component for rendering video items in the slideshow
function SlideshowVideoItem({ item }: { item: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const shouldShowVideo = true; // Always show videos in slideshow
  const videoSource = item.playbackId ? getVideoSource(item.playbackId) : null;

  // Setup HLS.js for Chrome
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSource?.src || !shouldShowVideo) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Reset states
    setIsVideoReady(false);
    setVideoError(false);

    const handleLoadedMetadata = () => setIsVideoReady(true);
    const handleCanPlay = () => {
      video.play().catch(() => {
        // Autoplay prevented, user will need to interact
      });
    };
    const handleError = () => setVideoError(true);

    // Prefer HLS.js when available (Chrome returns "maybe" for HLS canPlayType but can't actually play it)
    if (Hls.isSupported()) {
      let mediaErrorRecoveries = 0;

      const hls = new Hls({
        enableWorker: false,
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsVideoReady(true);
        setVideoError(false);
        video.play().catch(() => {
          // Autoplay prevented, user will need to interact
        });
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        // Reset error state once data is actually flowing
        setVideoError(false);
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
                setIsVideoReady(true);
                setVideoError(false);
                video.play().catch(() => {});
              });
              retry.on(Hls.Events.ERROR, (e, d) => {
                if (d.fatal) {
                  setVideoError(true);
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
                setVideoError(true);
                hls.destroy();
              }
              break;
            default:
              setVideoError(true);
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

      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [videoSource?.src, shouldShowVideo]);

  return (
    <div className="relative w-full h-full">
      {/* Video Element - always render but only show when ready */}
      {shouldShowVideo && videoSource && videoSource.src && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-200 ${
            isVideoReady && !videoError ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline
          preload="metadata"
        >
          {/* Fallback message for unsupported formats */}
          <p>Your browser does not support the video format.</p>
        </video>
      )}

      {/* Show nothing while loading - no poster image flash */}
      {/* Only show fallback if there's an error or no video source */}
      {(videoError || !videoSource || !videoSource.src) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM10 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <p className="text-sm">Media loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}