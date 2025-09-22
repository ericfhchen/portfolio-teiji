'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { VideoPlayer } from './VideoPlayer';
import CustomCursor from './CustomCursor';
import { getImageProps } from '@/lib/image';
import ImageWithBlur from '@/components/ImageWithBlur';

interface HeroGalleryProps {
  items: any[]; // Array of mediaItem objects
  title: string;
}

export default function HeroGallery({ items, title }: HeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Custom cursor state
  const [cursorText, setCursorText] = useState<string>('');
  const [showCursor, setShowCursor] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  const goToNext = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + items.length) % items.length);
  }, [items.length]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Detect fine pointer devices (desktop/mouse)
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

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  let coverImage = null;
  let coverVideo = null;
  if (currentItem?.mediaType === 'image' && currentItem.image) {
    coverImage = getImageProps(currentItem.image, 1600); // Remove the 900 height
  } else if (currentItem?.mediaType === 'video' && currentItem.video) {
    coverVideo = currentItem.video;
  }

  // Use full container size - let object-contain handle the fitting
  const displayWidth = '100%';
  const displayHeight = '100%';

  return (
    <div className="relative w-full h-full flex items-center justify-center min-h-[60svh]">
      {/* Hero media container: centered with proper aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        {/* Horizontal hairline across the full width at vertical center */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
          style={{ height: '0.5px' }}
        />
        
        <div className="relative w-full h-[100svh] py-20 max-w-7xl flex items-center justify-center">
          {coverImage ? (
            <div className="relative w-full h-full">
              {/* Navigation areas - only show if multiple items, limited to media height */}
              {items.length > 1 && (
                <>
                  <div 
                    className="absolute left-0 top-16 bottom-16 w-1/2 z-20 md:cursor-none md:top-0 md:bottom-0"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                    onMouseEnter={() => {
                      if (!isFinePointer) return;
                      // Clear any pending hide timeout
                      if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                        hideTimeoutRef.current = null;
                      }
                      setCursorText('PREV');
                      setShowCursor(true);
                    }}
                    onMouseLeave={() => {
                      if (!isFinePointer) return;
                      // Delay hiding to prevent flicker when moving between areas
                      hideTimeoutRef.current = setTimeout(() => {
                        setShowCursor(false);
                        setCursorText('');
                      }, 100);
                    }}
                  />
                  <div 
                    className="absolute right-0 top-16 bottom-16 w-1/2 z-20 md:cursor-none md:top-0 md:bottom-0"
                    onClick={goToNext}
                    aria-label="Next image"
                    onMouseEnter={() => {
                      if (!isFinePointer) return;
                      // Clear any pending hide timeout
                      if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                        hideTimeoutRef.current = null;
                      }
                      setCursorText('NEXT');
                      setShowCursor(true);
                    }}
                    onMouseLeave={() => {
                      if (!isFinePointer) return;
                      // Delay hiding to prevent flicker when moving between areas
                      hideTimeoutRef.current = setTimeout(() => {
                        setShowCursor(false);
                        setCursorText('');
                      }, 100);
                    }}
                  />
                </>
              )}
              <ImageWithBlur
                src={coverImage.src}
                alt={coverImage.alt}
                lqip={coverImage.hasBlur ? coverImage.blurDataURL : undefined}
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain object-center w-full h-full"
              />
            </div>
          ) : coverVideo ? (
            <div className="relative w-full h-full">
              {/* Navigation areas - only show if multiple items, limited to media height */}
              {items.length > 1 && (
                <>
                  <div 
                    className="absolute left-0 top-16 bottom-16 w-1/2 z-20 md:cursor-none md:top-0 md:bottom-0"
                    onClick={goToPrevious}
                    aria-label="Previous image"
                    onMouseEnter={() => {
                      if (!isFinePointer) return;
                      // Clear any pending hide timeout
                      if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                        hideTimeoutRef.current = null;
                      }
                      setCursorText('PREV');
                      setShowCursor(true);
                    }}
                    onMouseLeave={() => {
                      if (!isFinePointer) return;
                      // Delay hiding to prevent flicker when moving between areas
                      hideTimeoutRef.current = setTimeout(() => {
                        setShowCursor(false);
                        setCursorText('');
                      }, 100);
                    }}
                  />
                  <div 
                    className="absolute right-0 top-16 bottom-16 w-1/2 z-20 md:cursor-none md:top-0 md:bottom-0"
                    onClick={goToNext}
                    aria-label="Next image"
                    onMouseEnter={() => {
                      if (!isFinePointer) return;
                      // Clear any pending hide timeout
                      if (hideTimeoutRef.current) {
                        clearTimeout(hideTimeoutRef.current);
                        hideTimeoutRef.current = null;
                      }
                      setCursorText('NEXT');
                      setShowCursor(true);
                    }}
                    onMouseLeave={() => {
                      if (!isFinePointer) return;
                      // Delay hiding to prevent flicker when moving between areas
                      hideTimeoutRef.current = setTimeout(() => {
                        setShowCursor(false);
                        setCursorText('');
                      }, 100);
                    }}
                  />
                </>
              )}
              <VideoPlayer video={coverVideo} objectFit="contain" isVertical={false} />
            </div>
          ) : null}
        </div>
      </div>

      {/* Custom cursor */}
      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}
