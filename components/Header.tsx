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
      <header className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isVisible ? 'max-md:opacity-100 max-md:translate-y-0' : 'max-md:opacity-0 max-md:-translate-y-2'}`}>
        {/* Section Switcher — centered */}
        <nav
          className="h-16 pointer-events-auto flex items-center absolute left-1/2 -translate-x-1/2"
          style={{ left: '50%' }}
        >
          {/* Art */}
          <Link
            href="/art"
            className={`w-24 text-center text-base font-normal transition-colors ${
              currentSection === 'art' ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            Art
          </Link>

          {/* Design */}
          <Link
            href="/design"
            className={`w-24 text-center text-base font-normal transition-colors ${
              currentSection === 'design' ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            Design
          </Link>
        </nav>

        {/* Tags are now handled by the Filters component in the index page */}
      </header>

      {/* Primary Navigation - Position responsive: bottom on mobile, top corners on desktop */}
      <nav className={`pointer-events-auto fixed z-50 h-12 md:h-16 
        max-md:inset-x-0 max-md:bottom-0
        md:top-0 ${currentSection === 'art' ? 'md:left-0' : 'md:right-0'}
        transition-all duration-300 ${isVisible ? 'max-md:opacity-100 max-md:translate-y-0' : 'max-md:opacity-0 max-md:translate-y-2'}`}>
        <div className="flex items-center h-full max-md:justify-between max-md:w-full max-md:px-6 md:gap-16 lg:gap-24 md:px-8">
          <Link 
            href={`/${currentSection}/work`} 
            className={`text-base font-normal transition-colors ${
              currentRoute === 'work' ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            Work
          </Link>
          <Link 
            href={`/${currentSection}/index`} 
            className={`text-base font-normal transition-colors ${
              currentRoute === 'index' ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            Index
          </Link>
          <Link 
            href={`/${currentSection}/about`} 
            className={`text-base font-normal transition-colors ${
              currentRoute === 'about' ? 'text-var' : 'text-muted hover:text-var'
            }`}
          >
            About
          </Link>
        </div>
      </nav>
    </>
  );
}