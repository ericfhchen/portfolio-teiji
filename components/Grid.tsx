'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, createItemParam } from '@/lib/utils';

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
  const { columnClasses, columnCount } = useMemo(() => {
    switch (variant) {
      case 'home':
        return { columnClasses: 'grid-cols-1', columnCount: 1 };
      case 'work':
        return { columnClasses: 'grid-cols-2', columnCount: 2 };
      case 'index':
      default:
        return { columnClasses: 'grid-cols-3', columnCount: 3 };
    }
  }, [variant]);

  // Calculate empty tiles needed to fill incomplete rows
  const emptyTilesNeeded = useMemo(() => {
    if (columnCount === 1) return 0; // No need for empty tiles in single column
    
    const remainder = filteredItems.length % columnCount;
    return remainder === 0 ? 0 : columnCount - remainder;
  }, [filteredItems.length, columnCount]);

  // Create empty tiles for incomplete rows
  const emptyTiles = useMemo(() => {
    return Array.from({ length: emptyTilesNeeded }, (_, index) => ({
      _id: `empty-${index}`,
      isEmpty: true
    }));
  }, [emptyTilesNeeded]);

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
              <div className={`relative overflow-hidden ${variant === 'work' ? 'p-12 pb-4' : 'p-12 pb-4 lg:p-20'} ${variant !== 'work' ? 'lg:max-w-[100dvh]' : ''} mx-auto w-full`}>
                <button
                  onClick={() => handleItemClick(item)}
                  className="group block w-full focus:outline-none"
                >
                  <div className={`relative ${variant === 'work' ? 'aspect-[16/9]' : 'aspect-square'}`}>
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
              </div>
            </div>
            
            {/* Text content for work variant - outside the image container */}
            {variant === 'work' && (
              <div className="px-12 pb-4 mx-auto w-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-var font-normal">
                      {item.parentTitle}
                    </div>
                    {item.medium && (
                      <div className="text-muted font-light">
                        {item.medium}
                      </div>
                    )}
                  </div>
                  {item.year && (
                    <div className="text-muted font-light">
                      {item.year}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Render empty tiles to fill incomplete rows */}
        {emptyTiles.map((emptyTile) => (
          <div key={emptyTile._id} className="relative w-full">
            {/* Empty image container with horizontal rule centered on it */}
            <div className="relative">
              {/* full-width hairline across the column, centered on image container only */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
              style={{ height: '0.5px' }}
              />
              {/* Empty tile with same padding as regular tiles to maintain grid alignment */}
              <div className={`relative overflow-hidden ${variant === 'work' ? 'p-8' : 'p-12 lg:p-20'} ${variant !== 'work' ? 'lg:max-w-[100dvh]' : ''} mx-auto w-full`}>
                <div className={`relative ${variant === 'work' ? 'aspect-[16/9]' : 'aspect-square'}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No items found for the selected tags.</p>
        </div>
      )}
    </div>
  );
}