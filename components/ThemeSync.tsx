'use client';

import { useLayoutEffect } from 'react';

/**
 * Syncs the data-theme attribute and background-color to <html> and <body>,
 * so iOS Safari's translucent bar area picks up the correct theme color.
 */
export default function ThemeSync({ theme }: { theme: string }) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const bg = theme === 'design' ? '#000' : '#fff';
    html.setAttribute('data-theme', theme);
    html.style.setProperty('background-color', bg, 'important');
    document.body.style.setProperty('background-color', bg, 'important');
  }, [theme]);

  return null;
}
