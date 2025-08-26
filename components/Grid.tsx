'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import Image from 'next/image';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, toggleTag, createItemParam } from '@/lib/utils';

interface GridProps {
  items: FeedItem[];
  allTags: string[];
  section: string;
  /**
   * Controls the default column count based on page context.
   * "home" → 1 column
   * "work" → 2 columns
   * "index" (default) → 3 columns
   */
  variant?: 'home' | 'work' | 'index';
}

export default function Grid({ items, allTags, section, variant = 'index' }: GridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { tags: activeTags, item: activeItem } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  const filteredItems = useMemo(() => {
    if (activeTags.length === 0) return items;
    
    return items.filter(item =>
      item.parentTags.some(tag => activeTags.includes(tag))
    );
  }, [items, activeTags]);

  const handleTagToggle = useCallback((tag: string) => {
    const newTags = toggleTag(activeTags, tag);
    const newParams = createSearchParams(newTags);
    
    router.replace(`/${section}/index?${newParams}`, { scroll: false });
  }, [activeTags, router, section]);

  const handleItemClick = useCallback((item: FeedItem) => {
    const itemParam = createItemParam(item.parentSlug, item.index);
    const newParams = createSearchParams(activeTags, itemParam);
    
    router.replace(`/${section}/index?${newParams}`, { scroll: false });
  }, [activeTags, router, section]);

  // Determine column classes based on variant
  const columnClasses = useMemo(() => {
    switch (variant) {
      case 'home':
        return 'grid-cols-1';
      case 'work':
        return 'grid-cols-2';
      case 'index':
      default:
        return 'grid-cols-3';
    }
  }, [variant]);

  return (
    <div className="w-full">
      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag, index) => (
              <button
                key={`${tag}-${index}`}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  activeTags.includes(tag)
                    ? 'bg-var text-var border-var'
                    : 'bg-transparent text-muted border-var hover:text-var'
                }`}
                style={{
                  backgroundColor: activeTags.includes(tag) ? 'var(--fg)' : 'transparent',
                  color: activeTags.includes(tag) ? 'var(--bg)' : 'var(--muted)',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {/* Tailwind base grid + dynamic base column count; rely on responsive utilities for smaller screens */}
      <div className={`grid ${columnClasses} gap-4 justify-items-center`}>
        {filteredItems.map((item) => (
          <div key={item._id} className="relative w-full">
            {/* full-width hairline across the column */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--border)] z-0"
            />

            {/*
              Wrapper with padding controls visual cropping and overall size constraints.
              The button sits inside so only the actual image area is interactive.
            */}
            <div className="relative overflow-hidden p-12 lg:p-20 lg:max-w-[100dvh] mx-auto w-full">
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
                    placeholder="blur"
                    blurDataURL={item.lqip}
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
              </button>
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