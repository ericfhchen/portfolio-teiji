'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, createItemParam } from '@/lib/utils';
import HoverMedia from '@/components/HoverMedia';

interface GridProps {
  items: FeedItem[];
  section: string;
  /**
   * Controls the default column count based on page context.
   * "home" → 1 column
   * "work" → 2 columns
   * "index" (default) → 3 columns
   */
  variant?: 'home' | 'work' | 'index';
}

export default function Grid({ items, section, variant = 'index' }: GridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
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

  const filteredItems = useMemo(() => {
    if (activeTags.length === 0) return items;
    
    return items.filter(item =>
      item.parentTags.some(tag => activeTags.includes(tag))
    );
  }, [items, activeTags]);



  const handleItemClick = useCallback((item: FeedItem) => {
    if (variant === 'work') {
      // For work page, navigate directly to project page
      router.push(`/${section}/${item.parentSlug}`);
    } else {
      // For index/home pages, open lightbox
      const itemParam = createItemParam(item.parentSlug, item.index);
      const newParams = createSearchParams(activeTags, itemParam);
      
      router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
    }
  }, [variant, section, router, activeTags, currentRoute]);

  // Determine column classes and count based on variant
  const { columnClasses, mobileColumnCount, desktopColumnCount } = useMemo(() => {
    switch (variant) {
      case 'home':
        return { columnClasses: 'grid-cols-1', mobileColumnCount: 1, desktopColumnCount: 1 };
      case 'work':
        return { columnClasses: 'grid-cols-1 lg:grid-cols-2', mobileColumnCount: 1, desktopColumnCount: 2 };
      case 'index':
      default:
        return { columnClasses: 'grid-cols-2 lg:grid-cols-3', mobileColumnCount: 2, desktopColumnCount: 3 };
    }
  }, [variant]);

  // Calculate empty tiles needed for mobile and desktop separately
  const { mobileEmptyTiles, desktopEmptyTiles } = useMemo(() => {
    // Single column layouts don't need empty tiles
    if (mobileColumnCount === 1 && desktopColumnCount === 1) {
      return { mobileEmptyTiles: 0, desktopEmptyTiles: 0 };
    }

    // Calculate for mobile
    const mobileRemainder = filteredItems.length % mobileColumnCount;
    const mobileEmpty = mobileColumnCount === 1 ? 0 : 
      (mobileRemainder === 0 ? 0 : mobileColumnCount - mobileRemainder);

    // Calculate for desktop
    const desktopRemainder = filteredItems.length % desktopColumnCount;
    const desktopEmpty = desktopColumnCount === 1 ? 0 : 
      (desktopRemainder === 0 ? 0 : desktopColumnCount - desktopRemainder);

    return { 
      mobileEmptyTiles: mobileEmpty, 
      desktopEmptyTiles: desktopEmpty 
    };
  }, [filteredItems.length, mobileColumnCount, desktopColumnCount]);

  // Create empty tiles - we need the maximum of mobile and desktop needs
  const maxEmptyTiles = Math.max(mobileEmptyTiles, desktopEmptyTiles);
  const emptyTiles = useMemo(() => {
    return Array.from({ length: maxEmptyTiles }, (_, index) => ({
      _id: `empty-${index}`,
      isEmpty: true,
      // Mark which breakpoints this empty tile should be visible on
      showOnMobile: index < mobileEmptyTiles,
      showOnDesktop: index < desktopEmptyTiles
    }));
  }, [maxEmptyTiles, mobileEmptyTiles, desktopEmptyTiles]);

  return (
    <div className="w-full">
      {/* Grid */}
      {/* Tailwind base grid + dynamic base column count; rely on responsive utilities for smaller screens */}
      <div className={`grid ${columnClasses} justify-items-center`}>
        {/* Render actual items */}
        {filteredItems.map((item) => (
          <div key={item._id} className="relative w-full">
            {/* Image container with horizontal rule centered on it */}
            <div className="relative">
              {/* full-width hairline across the column, centered on image container only */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
              />

              {/*
                Wrapper with padding controls visual cropping and overall size constraints.
                The button sits inside so only the actual image area is interactive.
              */}
              <div className={`relative overflow-hidden ${variant === 'work' ? 'p-12' : 'p-6 lg:p-16'} ${variant !== 'work' ? 'lg:max-w-[100dvh]' : ''} mx-auto w-full`}>
                {variant === 'work' ? (
                  <div className={`relative ${variant === 'work' ? 'aspect-[16/9]' : 'aspect-square'}`}>
                    <HoverMedia
                      staticMedia={{
                        src: item.src,
                        alt: item.alt || '',
                        lqip: item.lqip,
                        mediaType: item.mediaType,
                        videoData: item.videoData,
                      }}
                      hoverMedia={item.hoverMedia ? {
                        src: item.hoverMedia.src,
                        alt: item.hoverMedia.alt,
                        lqip: item.hoverMedia.lqip,
                        mediaType: item.hoverMedia.mediaType,
                        videoData: item.hoverMedia.videoData,
                      } : undefined}
                      onClick={() => handleItemClick(item)}
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    className="group block w-full focus:outline-none"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={item.src}
                        alt=""
                        fill
                        className="object-contain object-center"
                        {...(item.lqip && {
                          placeholder: "blur" as const,
                          blurDataURL: item.lqip,
                        })}
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            {/* Text content for work variant - outside the image container */}
            {variant === 'work' && (
              <div className="px-12 pb-4 mx-auto w-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-var font-normal text-sm sm:text-base">
                      {item.parentTitle}
                    </div>
                    {item.medium && (
                      <div className="text-muted font-light text-sm sm:text-base tracking-widest">
                        {item.medium}
                      </div>
                    )}
                  </div>
                  {item.year && (
                    <div className="text-muted font-light text-sm sm:text-base tracking-widest">
                      {item.year}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Render empty tiles to fill incomplete rows */}
        {emptyTiles.map((emptyTile) => {
          // Create responsive visibility classes
          let visibilityClasses = '';
          if (emptyTile.showOnMobile && emptyTile.showOnDesktop) {
            visibilityClasses = 'block'; // Show on all screen sizes
          } else if (emptyTile.showOnMobile && !emptyTile.showOnDesktop) {
            visibilityClasses = 'block lg:hidden'; // Show on mobile only
          } else if (!emptyTile.showOnMobile && emptyTile.showOnDesktop) {
            visibilityClasses = 'hidden lg:block'; // Show on desktop only
          } else {
            visibilityClasses = 'hidden'; // Don't show (shouldn't happen, but safety)
          }

          return (
            <div key={emptyTile._id} className={`relative w-full ${visibilityClasses}`}>
              {/* Empty image container with horizontal rule centered on it */}
              <div className="relative">
                {/* full-width hairline across the column, centered on image container only */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
                style={{ height: '0.5px' }}
                />
                {/* Empty tile with same padding as regular tiles to maintain grid alignment */}
                <div className={`relative overflow-hidden ${variant === 'work' ? 'p-12' : 'p-12 lg:p-20'} ${variant !== 'work' ? 'lg:max-w-[100dvh]' : ''} mx-auto w-full`}>
                  <div className={`relative ${variant === 'work' ? 'aspect-[16/9]' : 'aspect-square'}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No items found for the selected tags.</p>
        </div>
      )}
    </div>
  );
}