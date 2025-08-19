'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, parseItemParam, createItemParam, trapFocus } from '@/lib/utils';

interface LightboxProps {
  items: FeedItem[];
  section: string;
}

export default function Lightbox({ items, section }: LightboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const { tags: activeTags, item: activeItem } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const currentItemData = useMemo(() => {
    if (!activeItem) return null;
    return parseItemParam(activeItem);
  }, [activeItem]);

  const currentItem = useMemo(() => {
    if (!currentItemData) return null;
    return items.find(
      item => item.parentSlug === currentItemData.parentSlug && item.index === currentItemData.index
    );
  }, [items, currentItemData]);

  const currentIndex = useMemo(() => {
    if (!currentItem) return -1;
    return items.findIndex(
      item => item.parentSlug === currentItem.parentSlug && item.index === currentItem.index
    );
  }, [items, currentItem]);

  const close = useCallback(() => {
    const newParams = createSearchParams(activeTags);
    router.replace(`/${section}?${newParams}`, { scroll: false });
  }, [activeTags, router, section]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (items.length === 0) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    }
    
    const newItem = items[newIndex];
    const itemParam = createItemParam(newItem.parentSlug, newItem.index);
    const newParams = createSearchParams(activeTags, itemParam);
    
    router.replace(`/${section}?${newParams}`, { scroll: false });
  }, [activeTags, currentIndex, items, router, section]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowLeft':
        navigate('prev');
        break;
      case 'ArrowRight':
        navigate('next');
        break;
    }
  }, [close, navigate]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  }, [close]);

  // Preload next and previous images
  useEffect(() => {
    if (currentIndex === -1 || items.length <= 1) return;
    
    const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    
    const preloadImage = (src: string) => {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
    };
    
    preloadImage(items[prevIndex].src);
    preloadImage(items[nextIndex].src);
  }, [currentIndex, items]);

  // Setup keyboard listeners and focus trap
  useEffect(() => {
    if (!currentItem || !dialogRef.current) return;
    
    document.addEventListener('keydown', handleKeyDown);
    const cleanup = trapFocus(dialogRef.current);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cleanup();
    };
  }, [currentItem, handleKeyDown]);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 lightbox-backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${currentItem.parentTitle} - Image ${currentItem.index + 1}`}
        className="flex items-center justify-center min-h-screen p-4"
      >
        {/* Close Button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close lightbox"
        >
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Buttons */}
        {items.length > 1 && (
          <>
            <button
              onClick={() => navigate('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next image"
            >
              <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image */}
        <div className="relative max-w-5xl max-h-[80vh] w-full h-full">
          <Image
            src={currentItem.src}
            alt={currentItem.alt}
            fill
            className="object-contain"
            placeholder="blur"
            blurDataURL={currentItem.lqip}
            sizes="80vw"
            priority
          />
        </div>

        {/* Info Panel */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black bg-opacity-75 text-white rounded-lg p-4 max-w-md">
            <h3 className="font-medium mb-2">{currentItem.parentTitle}</h3>
            {currentItem.parentTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {currentItem.parentTags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs bg-white bg-opacity-20 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Link
              href={`/${section}/${currentItem.parentSlug}`}
              className="inline-flex items-center text-sm hover:underline"
            >
              Open project
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}