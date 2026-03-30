'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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

  useEffect(() => {
    console.log(`[HERO_GALLERY] ${items.length} items | current=${currentIndex} | title="${title}"`);
  }, [items.length, currentIndex, title]);

  // Pre-resolve all image props so they stay in DOM
  const resolvedItems = useMemo(() => {
    return items.map((item, i) => {
      if (item?.mediaType === 'image' && item.image) {
        return { type: 'image' as const, imageProps: getImageProps(item.image, 3200), index: i };
      } else if (item?.mediaType === 'video' && item.video) {
        return { type: 'video' as const, video: item.video, index: i };
      }
      return { type: 'empty' as const, index: i };
    });
  }, [items]);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    // Only trigger if horizontal swipe is dominant and exceeds threshold
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full h-full flex items-center justify-center min-h-[60svh]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Hero media container: centered with proper aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
        {/* Horizontal hairline across the full width at vertical center */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
          style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
        />

        <div className="relative w-full h-[100svh] py-20 max-w-7xl flex items-center justify-center">
          {/* Pre-render ALL gallery items, toggle visibility.
              First item is relative (sets container size), rest are absolute overlays.
              All get the same py-20 padding so images never touch top/bottom. */}
          {resolvedItems.map((resolved, i) => {
            const isActive = resolved.index === currentIndex;
            const isFirst = i === 0;

            const wrapperClassName = `w-full h-full transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;
            const wrapperStyle: React.CSSProperties = {
              position: isFirst ? 'relative' : 'absolute',
              inset: isFirst ? undefined : 0,
              paddingTop: isFirst ? undefined : '5rem',
              paddingBottom: isFirst ? undefined : '5rem',
            };

            if (resolved.type === 'image' && resolved.imageProps) {
              return (
                <div key={resolved.index} className={wrapperClassName} style={wrapperStyle}>
                  <div className="relative w-full h-full">
                    <ImageWithBlur
                      src={resolved.imageProps.src}
                      alt={resolved.imageProps.alt}
                      lqip={resolved.imageProps.hasBlur ? resolved.imageProps.blurDataURL : undefined}
                      sizes="(max-width: 768px) 100vw, 80vw"
                      className="object-contain object-center w-full h-full"
                      priority={resolved.index === 0}
                    />
                  </div>
                </div>
              );
            }

            if (resolved.type === 'video') {
              return (
                <div key={resolved.index} className={wrapperClassName} style={wrapperStyle}>
                  <div className="relative w-full h-full">
                    <VideoPlayer video={resolved.video} objectFit="contain" isVertical={false} />
                  </div>
                </div>
              );
            }

            return null;
          })}

          {/* Full-screen navigation area – single element to avoid compositing seam at center */}
          {items.length > 1 && (
              <div
                className="absolute left-0 right-0 top-16 bottom-16 z-20 md:cursor-none md:top-0 md:bottom-0"
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
                  if (!isFinePointer) return;
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
                  if (!isFinePointer) return;
                  hideTimeoutRef.current = setTimeout(() => {
                    setShowCursor(false);
                    setCursorText('');
                  }, 100);
                }}
              />
          )}
        </div>
      </div>

      {/* Counter – mobile only, left-aligned above footer nav */}
      {items.length > 1 && (
        <div className="md:hidden pointer-events-none absolute left-4 z-30"
          style={{ top: 'calc(100svh - 2.5rem - env(safe-area-inset-bottom, 0px))', transform: 'translateY(-100%)' }}>
          <span className="text-var font-light tracking-wider">
            {currentIndex + 1}/{items.length}
          </span>
        </div>
      )}

      {/* Navigation chevrons – mobile only, centered above footer nav */}
      {items.length > 1 && (
        <div className="md:hidden pointer-events-none absolute inset-x-0 z-30 flex justify-center gap-6"
          style={{ top: 'calc(100svh - 2.5rem - env(safe-area-inset-bottom, 0px))', transform: 'translateY(-100%)' }}>
          <svg aria-hidden className="w-2 h-4" viewBox="0 0 12 24" fill="none"
            stroke="var(--fg)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="10,2 2,12 10,22" />
          </svg>
          <svg aria-hidden className="w-2 h-4" viewBox="0 0 12 24" fill="none"
            stroke="var(--fg)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2,2 10,12 2,22" />
          </svg>
        </div>
      )}

      {/* Custom cursor */}
      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}
