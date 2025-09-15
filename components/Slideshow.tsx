'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FeedItem } from '@/sanity/schema';
import { getVideoSource, shouldUseHls } from '@/lib/mux';
import Hls from 'hls.js';

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

  // Reset to first image if items change
  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

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
      className="relative w-full h-screen overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Left navigation area (left half of screen) */}
      <div 
        className="absolute left-0 top-0 w-1/2 h-full z-20 cursor-w-resize flex items-center justify-start pl-8"
        onClick={goToPrevious}
        aria-label="Previous image"
      />
      
      {/* Right navigation area (right half of screen) */}
      <div 
        className="absolute right-0 top-0 w-1/2 h-full z-20 cursor-e-resize flex items-center justify-end pr-8"
        onClick={goToNext}
        aria-label="Next image"
      />

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Hairline across center */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-10"
              style={{ height: '0.5px' }}
        />

        {/* Image wrapper with padding */}
        <div className="relative overflow-hidden p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full h-full flex items-center justify-center">
          <button
            onClick={() => handleItemClick(currentItem)}
            className="group block focus:outline-none cursor-pointer z-30 relative"
            aria-label={`Open ${currentItem.parentTitle} in lightbox`}
          >
            <div className="relative aspect-square w-[80vmin] h-[80vmin]">
              {currentItem.mediaType === 'video' && currentItem.playbackId ? (
                <SlideshowVideoItem item={currentItem} />
              ) : currentItem.src && currentItem.src.trim() !== '' ? (
                <Image
                  src={currentItem.src}
                  alt={currentItem.alt || ''}
                  fill
                  className="object-contain object-center"
                  {...(currentItem.lqip && {
                    placeholder: "blur" as const,
                    blurDataURL: currentItem.lqip,
                  })}
                  sizes="80vmin"
                  priority
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

    </div>
  );
}

// SlideshowVideoItem component for rendering video items in the slideshow
function SlideshowVideoItem({ item }: { item: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  const shouldShowVideo = item.displayMode === 'thumbnail' || item.displayMode === 'hover';
  const videoSource = item.playbackId ? getVideoSource(item.playbackId) : null;

  useEffect(() => {
    if (shouldShowVideo) {
      setShowVideo(true);
    }
  }, [shouldShowVideo]);

  // Setup HLS.js for Chrome
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSource?.src || !showVideo) return;

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
        video.play().catch(() => {
          // Autoplay prevented, user will need to interact
        });
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
  }, [videoSource?.src, showVideo]);

  return (
    <div className="relative w-full h-full">

      {/* Poster/Fallback Image - only render if src is not empty */}
      {item.src && item.src.trim() !== '' && (
        <Image
          src={item.src}
          alt={item.alt || ''}
          fill
          className={`object-contain object-center transition-opacity duration-200 ${
            showVideo && shouldShowVideo ? 'opacity-0' : 'opacity-100'
          }`}
          {...(item.lqip && {
            placeholder: "blur" as const,
            blurDataURL: item.lqip,
          })}
          sizes="80vmin"
          priority
        />
      )}

      {/* Video Element */}
      {showVideo && shouldShowVideo && videoSource && videoSource.src && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-200 ${
            shouldShowVideo ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline
          preload="metadata"
          onError={(e) => {
            // Handle video errors silently
          }}
        >
          {/* Fallback message for unsupported formats */}
          <p>Your browser does not support the video format.</p>
        </video>
      )}

      {/* Fallback when no poster and no video source */}
      {(!item.src || item.src.trim() === '') && (!videoSource || !videoSource.src) && (
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