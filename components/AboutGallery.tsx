'use client';

import { useState, useCallback, useRef } from 'react';
import ImageWithBlur from '@/components/ImageWithBlur';
import CustomCursor from './CustomCursor';

interface GalleryImage {
  src: string;
  alt: string;
  lqip?: string;
  width: number;
  height: number;
}

interface AboutGalleryProps {
  images: GalleryImage[];
}

export default function AboutGallery({ images }: AboutGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cursorText, setCursorText] = useState('');
  const [showCursor, setShowCursor] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goToNext();
      else goToPrevious();
    }
  }, [goToNext, goToPrevious]);

  if (images.length === 0) return null;

  const current = images[currentIndex];

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation overlay */}
      {images.length > 1 && (
        <div
          className="absolute inset-0 z-20 md:cursor-none"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToNext(); }
          }}
          aria-label="Navigate gallery"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const newText = mouseX < rect.width / 2 ? 'PREV' : 'NEXT';
            if (newText !== cursorText) setCursorText(newText);
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
      )}

      {/* Image display */}
      <div className="relative w-full h-full flex items-start justify-start">
        {images.map((image, index) => (
          <div
            key={index}
            className={`transition-opacity duration-300 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={index === 0
              ? { position: 'relative', width: '100%' }
              : { position: 'absolute', top: 0, left: 0, width: '100%' }
            }
          >
            <ImageWithBlur
              src={image.src}
              alt={image.alt}
              lqip={image.lqip}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="w-full h-auto"
              fill={false}
              width={image.width}
              height={image.height}
            />
          </div>
        ))}
      </div>

      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}
