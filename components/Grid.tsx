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
}

export default function Grid({ items, allTags, section }: GridProps) {
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
    
    router.replace(`/${section}?${newParams}`, { scroll: false });
  }, [activeTags, router, section]);

  const handleItemClick = useCallback((item: FeedItem) => {
    const itemParam = createItemParam(item.parentSlug, item.index);
    const newParams = createSearchParams(activeTags, itemParam);
    
    router.replace(`/${section}?${newParams}`, { scroll: false });
  }, [activeTags, router, section]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <button
            key={`${item.parentSlug}-${item.index}`}
            onClick={() => handleItemClick(item)}
            className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-var focus:ring-offset-2"
          >
            <Image
              src={item.src}
              alt=""
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={item.lqip}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200" />
          </button>
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