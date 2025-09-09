'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Image from 'next/image';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, createItemParam } from '@/lib/utils';

interface SlideshowProps {
  items: FeedItem[];
  section: string;
  autoPlayInterval?: number; // in milliseconds, defaults to 5000 (5 seconds)
}

export default function Slideshow({ items, section, autoPlayInterval = 5000 }: SlideshowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { tags: activeTags } = parseSearchParams(searchParams);

  // Determine current route context
  const currentRoute = pathname.includes('/work') ? 'work' : 'index';

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
    // Open lightbox
    const itemParam = createItemParam(item.parentSlug, item.index);
    const newParams = createSearchParams(activeTags, itemParam);
    
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [section, router, activeTags, currentRoute]);

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
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--border)] z-10"
        />

        {/* Image wrapper with padding */}
        <div className="relative overflow-hidden p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full h-full flex items-center justify-center">
          <button
            onClick={() => handleItemClick(currentItem)}
            className="group block focus:outline-none cursor-pointer z-30 relative"
            aria-label={`Open ${currentItem.parentTitle} in lightbox`}
          >
            <div className="relative aspect-square w-[80vmin] h-[80vmin]">
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
            </div>
          </button>
        </div>
      </div>

    </div>
  );
}