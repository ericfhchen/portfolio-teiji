'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import CustomCursor from './CustomCursor';
import { FeedItem } from '@/sanity/schema';
import { getVideoSource, shouldUseHls } from '@/lib/mux';
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

  // Auto-advance functionality
  const startAutoPlay = useCallback(() => {
    if (items.length <= 1) return;
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
    }, autoPlayInterval);
  }, [items.length, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop auto-play based on isPlaying state
  useEffect(() => {
    if (isPlaying && items.length > 1) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isPlaying, startAutoPlay, stopAutoPlay, items.length]);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
    // Reset auto-play timer
    stopAutoPlay();
    setIsPlaying(true);
  }, [items.length, stopAutoPlay]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + items.length) % items.length);
    // Reset auto-play timer  
    stopAutoPlay();
    setIsPlaying(true);
  }, [items.length, stopAutoPlay]);

  const handleItemClick = useCallback((item: FeedItem) => {
    // Navigate directly to project page
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
    >
      {/* Left navigation area (left half of screen) */}
      <div 
        className="absolute left-0 top-0 w-1/2 h-full z-20 cursor-none"
        onClick={goToPrevious}
        aria-label="Previous image"
        onMouseEnter={() => {
          // Clear any pending hide timeout
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
          setCursorText('PREV');
          setShowCursor(true);
        }}
        onMouseLeave={() => {
          // Delay hiding to prevent flicker when moving between areas
          hideTimeoutRef.current = setTimeout(() => {
            setShowCursor(false);
            setCursorText('');
          }, 100);
        }}
      />
      
      {/* Right navigation area (right half of screen) */}
      <div 
        className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-none"
        onClick={goToNext}
        aria-label="Next image"
        onMouseEnter={() => {
          // Clear any pending hide timeout
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
          setCursorText('NEXT');
          setShowCursor(true);
        }}
        onMouseLeave={() => {
          // Delay hiding to prevent flicker when moving between areas
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
              style={{ height: '0.5px' }}
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

        {/* Image wrapper with padding */}
        <div className="relative overflow-hidden px-4 py-6 md:p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full h-full flex items-center justify-center">
          <button
            onClick={() => handleItemClick(currentItem)}
            className="group block focus:outline-none cursor-pointer z-30 relative"
            aria-label={`Open ${currentItem.parentTitle} in lightbox`}
          >
            <div className="relative aspect-[3/4] md:aspect-square w-[85vw] md:w-[80vmin]">
              {currentItem.mediaType === 'video' && currentItem.playbackId ? (
                <SlideshowVideoItem item={currentItem} />
              ) : currentItem.src && currentItem.src.trim() !== '' ? (
                <ImageWithBlur
                  src={currentItem.src}
                  alt={currentItem.alt || ''}
                  lqip={currentItem.lqip}
                  sizes="80vmin"
                  className="object-contain object-center shadow-none"
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

    // Check if browser supports HLS natively (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSource.src;
      
      // For Safari, we can detect when the video is ready
      video.addEventListener('loadedmetadata', () => {
        setIsVideoReady(true);
      });
      
      video.addEventListener('canplay', () => {
        video.play().catch(() => {
          // Autoplay prevented, user will need to interact
        });
      });
      
      video.addEventListener('error', () => {
        setVideoError(true);
      });
    } else if (Hls.isSupported()) {
      // Use HLS.js for Chrome and other browsers
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
      });
      
      hls.loadSource(videoSource.src);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsVideoReady(true);
        video.play().catch(() => {
          // Autoplay prevented, user will need to interact
        });
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setVideoError(true);
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
      
      video.addEventListener('error', () => {
        setVideoError(true);
      });
      
      hlsRef.current = hls;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
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