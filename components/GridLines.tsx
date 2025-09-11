'use client';

import { useMemo } from 'react';

type GridType = 'home' | 'about' | 'project' | 'work' | 'index';

interface GridLinesProps {
  type: GridType;
}

export default function GridLines({ type }: GridLinesProps) {
  const { mobileLines, desktopLines } = useMemo(() => {
    switch (type) {
      case 'home':
      case 'about':
      case 'project':
        // Single line at 50% (center) for all screen sizes
        return { mobileLines: [50], desktopLines: [50] };
      
      case 'work':
        // Mobile: Single line at 50% (center), Desktop: Two lines at 25% and 75%
        return { mobileLines: [50], desktopLines: [25, 75] };
      
      case 'index':
        // Mobile: Two lines at 25% and 75%, Desktop: Three lines at ~16.67%, 50%, and ~83.33% (midpoints of 3 equal columns)
        return { mobileLines: [25, 75], desktopLines: [16.666667, 50, 83.333333] };
      
      default:
        return { mobileLines: [], desktopLines: [] };
    }
  }, [type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Mobile lines (visible on small screens) */}
      {mobileLines.map((position, index) => (
        <div
          key={`mobile-${index}`}
          className="absolute top-0 bottom-0 bg-[var(--border)] lg:hidden"
          style={{ left: `${position}%`, width: '0.5px' }}
        />
      ))}
      
      {/* Desktop lines (visible on large screens) */}
      {desktopLines.map((position, index) => (
        <div
          key={`desktop-${index}`}
          className="absolute top-0 bottom-0 bg-[var(--border)] hidden lg:block"
          style={{ left: `${position}%`, width: '0.5px' }}
        />
      ))}
    </div>
  );
}