'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { parseSearchParams, createSearchParams, toggleTag } from '@/lib/utils';
import { client } from '@/lib/sanity.client';
import { allTagsQuery } from '@/lib/queries';

interface HeaderProps {
  currentSection: string;
}

export default function Header({ currentSection }: HeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [allTags, setAllTags] = useState<string[]>([]);
  
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

  // Fetch tags when on index pages
  useEffect(() => {
    if (currentRoute === 'index') {
      client.fetch(allTagsQuery, { section: currentSection })
        .then(tags => setAllTags(tags || []))
        .catch(error => {
          console.error('Failed to fetch tags:', error);
          setAllTags([]);
        });
    } else {
      setAllTags([]);
    }
  }, [currentRoute, currentSection]);

  const handleTagToggle = useCallback((tag: string) => {
    let newTags: string[];
    
    if (tag === 'All') {
      // Clear all tags when "All" is clicked
      newTags = [];
    } else {
      // Toggle the specific tag
      newTags = toggleTag(activeTags, tag);
    }
    
    const newParams = createSearchParams(newTags);
    router.replace(`/${currentSection}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, router, currentSection, currentRoute]);

  // Show tags only on index pages, when we have tags, and when lightbox is not open
  const showTags = currentRoute === 'index' && allTags.length > 0 && !activeItem;

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Section Switcher — centered */}
      <nav
        className="h-16 pointer-events-auto flex items-center absolute left-1/2 -translate-x-1/2"
        style={{ left: '50%' }}
      >
        {/* Art */}
        <Link
          href="/art"
          className={`w-24 text-center text-sm font-medium transition-colors ${
            currentSection === 'art' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Art
        </Link>

        {/* Design */}
        <Link
          href="/design"
          className={`w-24 text-center text-sm font-medium transition-colors ${
            currentSection === 'design' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Design
        </Link>
      </nav>

      {/* Primary Nav (Work / Index / About) */}
      <nav
        className={`h-16 pointer-events-auto flex items-center gap-12 px-4 absolute top-0 ${
          currentSection === 'art' ? 'left-0 justify-start' : 'right-0 justify-end'
        }`}
      >
        <Link 
          href={`/${currentSection}/work`} 
          className={`text-sm font-medium transition-colors ${
            currentRoute === 'work' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Work
        </Link>
        <Link 
          href={`/${currentSection}/index`} 
          className={`text-sm font-medium transition-colors ${
            currentRoute === 'index' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          Index
        </Link>
        <Link 
          href={`/${currentSection}/about`} 
          className={`text-sm font-medium transition-colors ${
            currentRoute === 'about' ? 'text-var' : 'text-muted hover:text-var'
          }`}
        >
          About
        </Link>
      </nav>

      {/* Tags - positioned below primary nav */}
      {showTags && (
        <nav
          className={`h-12 pointer-events-auto flex items-center gap-6 px-4 absolute top-10 ${
            currentSection === 'art' ? 'left-0 justify-start' : 'right-0 justify-end'
          }`}
        >
          {/* Filter label */}
          <span className="text-sm font-medium text-muted">Filter:</span>
          
          {/* All tag */}
          <button
            onClick={() => handleTagToggle('All')}
            className={`text-sm font-medium transition-colors ${
              activeTags.length === 0 ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            All
          </button>
          
          {/* Individual tags */}
          {allTags.map((tag, index) => (
            <button
              key={`${tag}-${index}`}
              onClick={() => handleTagToggle(tag)}
              className={`text-sm font-medium transition-colors ${
                activeTags.includes(tag) ? 'text-var' : 'text-muted hover:text-var'
              }`}
            >
              {tag}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}