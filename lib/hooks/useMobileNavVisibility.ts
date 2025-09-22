'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface UseMobileNavVisibilityOptions {
  idleDelay?: number; // milliseconds to wait after scroll stops
  threshold?: number; // minimum scroll distance to trigger hide
}

export function useMobileNavVisibility({
  idleDelay = 1500,
  threshold = 10
}: UseMobileNavVisibilityOptions = {}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const isInitialized = useRef(false);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = Math.abs(currentScrollY - lastScrollY.current);

    // Only trigger on significant scroll movement
    if (scrollDelta > threshold) {
      setIsScrolling(true);
      setIsVisible(false);

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout to show nav after idle period
      timeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        setIsVisible(true);
      }, idleDelay);

      lastScrollY.current = currentScrollY;
    }
  }, [idleDelay, threshold]);

  useEffect(() => {
    // Only add scroll listener on mobile devices
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (!isMobile) {
      // On desktop, ensure nav is always visible
      setIsVisible(true);
      setIsScrolling(false);
      return;
    }

    // Initial setup
    if (!isInitialized.current) {
      lastScrollY.current = window.scrollY;
      isInitialized.current = true;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleScroll]);

  // Handle window resize to re-evaluate mobile status
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (!isMobile) {
        // On desktop, always show nav
        setIsVisible(true);
        setIsScrolling(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isVisible,
    isScrolling
  };
}
