'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useMobileNavVisibility } from '@/lib/hooks/useMobileNavVisibility';

interface HeaderProps {
  currentSection: string;
}

export default function Header({ currentSection }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isVisible } = useMobileNavVisibility();

  // Hide header when lightbox is open (when `?item=` is present)
  const isLightboxOpen = useMemo(() => {
    const item = searchParams.get('item');
    return Boolean(item);
  }, [searchParams]);

  // Determine current route context  
  const currentRoute = useMemo(() => {
    if (pathname.includes('/work')) return 'work';
    if (pathname.includes('/index')) return 'index';
    if (pathname.includes('/about')) return 'about';
    return 'home'; // default fallback for section home pages
  }, [pathname]);

  if (isLightboxOpen) return null;

  return (
    <>
      {/* Top Header - Section Switcher only */}
      <header className={`pointer-events-none fixed inset-x-0 top-0 z-[100] mix-blend-difference transition-all duration-300 ${isVisible ? 'max-md:opacity-100 max-md:translate-y-0' : 'max-md:opacity-0 max-md:-translate-y-2'}`}>
        {/* Section Switcher — centered */}
        <nav
          className="h-16 pointer-events-auto flex items-center absolute left-1/2 -translate-x-1/2"
          style={{ left: '50%' }}
        >
          {/* Art */}
          <Link
            href="/art"
            prefetch={true}
            className={`w-24 text-center text-base font-normal transition-colors ${
              currentSection === 'art' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Art
          </Link>

          {/* Design */}
          <Link
            href="/design"
            prefetch={true}
            className={`w-24 text-center text-base font-normal transition-colors ${
              currentSection === 'design' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Design
          </Link>
        </nav>

        {/* Tags are now handled by the Filters component in the index page */}
      </header>

      {/* Primary Navigation - Position responsive: bottom on mobile, top corners on desktop */}
      <nav className={`pointer-events-auto fixed z-[100] md:h-16 mix-blend-difference
        max-md:inset-x-0 max-md:bottom-0
        md:top-0 ${currentSection === 'art' ? 'md:left-0' : 'md:right-0'}
        transition-all duration-300 ${isVisible ? 'max-md:opacity-100 max-md:translate-y-0' : 'max-md:opacity-0 max-md:translate-y-2'}`}>
        <div className="flex items-center max-md:h-12 h-full max-md:w-full max-md:px-4 md:gap-16 lg:gap-24 md:px-8"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <Link
            href={`/${currentSection}/work`}
            prefetch={true}
            className={`max-md:flex-1 max-md:text-left text-base font-normal transition-colors ${
              currentRoute === 'work' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Work
          </Link>
          <Link
            href={`/${currentSection}/index`}
            prefetch={true}
            className={`max-md:flex-1 max-md:text-center text-base font-normal transition-colors ${
              currentRoute === 'index' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Index
          </Link>
          <Link
            href={`/${currentSection}/about`}
            prefetch={true}
            className={`max-md:flex-1 max-md:text-right text-base font-normal transition-colors ${
              currentRoute === 'about' ? 'text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            About
          </Link>
        </div>
      </nav>
    </>
  );
}