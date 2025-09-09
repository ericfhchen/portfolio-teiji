'use client';

import { useMemo } from 'react';

type GridType = 'home' | 'about' | 'project' | 'work' | 'index';

interface GridLinesProps {
  type: GridType;
}

export default function GridLines({ type }: GridLinesProps) {
  const lines = useMemo(() => {
    switch (type) {
      case 'home':
      case 'about':
      case 'project':
        // Single line at 50% (center)
        return [50];
      
      case 'work':
        // Two lines at 25% and 75% (midpoints of 2 equal columns)
        return [25, 75];
      
      case 'index':
        // Three lines at ~16.67%, 50%, and ~83.33% (midpoints of 3 equal columns)
        return [16.666667, 50, 83.333333];
      
      default:
        return [];
    }
  }, [type]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {lines.map((position, index) => (
        <div
          key={index}
          className="absolute top-0 bottom-0 bg-[var(--border)]"
          style={{ left: `${position}%`, width: '0.5px' }}
        />
      ))}
    </div>
  );
}