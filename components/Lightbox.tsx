'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const { tags: activeTags, item: activeItem } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  // Determine current route context
  const currentRoute = useMemo(() => {
    if (pathname.includes('/work')) return 'work';
    if (pathname.includes('/index')) return 'index';
    return 'index'; // default fallback
  }, [pathname]);

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
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, router, section, currentRoute]);

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
    
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, currentIndex, items, router, section, currentRoute]);

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
      className="fixed inset-0 z-50 bg-white"
      onClick={handleBackdropClick}
    >
      {/* Single vertical grid line in the center */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 bottom-0 border-r border-var"
          style={{ left: '50%', borderWidth: '0.5px' }}
        />
      </div>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${currentItem.parentTitle} - Image ${currentItem.index + 1}`}
        className="relative z-10 h-full flex flex-col"
      >
        {/* Work Tile - exactly matching Grid component home variant */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full">
            {/* Horizontal hairline across the full width at vertical center */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--border)] z-0"
            />
            
            {/* Work tile container - matching Grid component exactly */}
            <div className="relative overflow-hidden p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full">
              <div className="relative aspect-square">
                <Image
                  src={currentItem.src}
                  alt={currentItem.alt || ''}
                  fill
                  className="object-contain object-center"
                  {...(currentItem.lqip && {
                    placeholder: "blur" as const,
                    blurDataURL: currentItem.lqip,
                  })}
                  sizes="50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom text layout */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="grid grid-cols-2 gap-16 px-8 py-6">
            {/* Left side: Year and Title/Tags */}
            <div className="grid grid-cols-[auto_1fr] gap-8">
              {/* Year column - minimal width */}
              <div className="text-var">
                {currentItem.year || ''}
              </div>
              
              {/* Title and tags column - takes remaining space */}
              <div>
                <div className="text-var font-normal">
                  {currentItem.parentTitle}
                </div>
                {currentItem.parentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentItem.parentTags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="text-muted font-light">
                        <Link
                          href={`/${section}/index?tags=${encodeURIComponent(tag)}`}
                          className="hover:text-var transition-colors focus:outline-none focus:text-var"
                        >
                          {tag}
                        </Link>
                        {index < currentItem.parentTags.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Description */}
            <div className="text-var">
              {currentItem.description || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}