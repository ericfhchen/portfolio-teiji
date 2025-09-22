'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { parseSearchParams, createSearchParams } from '@/lib/utils';

interface FiltersProps {
  tags: string[];
  section: string;
}

export default function Filters({ tags, section }: FiltersProps) {
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
    if (pathname.includes('/about')) return 'about';
    return 'home'; // default fallback for section home pages
  }, [pathname]);

  const handleTagToggle = useCallback((tag: string) => {
    // No-op if clicking the already active state
    if ((tag === 'All' && activeTags.length === 0) || (activeTags.length === 1 && activeTags[0] === tag)) {
      return;
    }

    const newTags: string[] = tag === 'All' ? [] : [tag];
    const newParams = createSearchParams(newTags);
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, router, section, currentRoute]);

  // Don't show filters if lightbox is open or no tags available
  if (activeItem || tags.length === 0) {
    return null;
  }

  return (
    <nav
      className={`h-12 pointer-events-auto flex items-center gap-4 sm:gap-6 px-6 md:px-8 fixed top-12 z-50 left-0 justify-start ${
        section === 'art' ? 'lg:left-0 lg:justify-start' : 'lg:right-0 lg:justify-end'
      }`}
    >
      {/* All tag */}
      <button
        onClick={() => handleTagToggle('All')}
        className={`text-sm font-normal transition-colors ${
          activeTags.length === 0 ? 'text-var' : 'text-muted hover:text-var'
        }`}
      >
        All
      </button>
      
      {/* Individual tags */}
      {tags.map((tag, index) => (
        <button
          key={`${tag}-${index}`}
          onClick={() => handleTagToggle(tag)}
          className={`text-sm font-normal transition-colors ${
            activeTags.includes(tag) ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          {tag}
        </button>
      ))}
    </nav>
  );
}