'use client';

import { useEffect, useState, useRef } from 'react';

interface CustomCursorProps {
  text: string;
  isVisible: boolean;
}

export default function CustomCursor({ text, isVisible }: CustomCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [showText, setShowText] = useState(false);
  const delayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);

  // Detect fine pointer devices (desktop/mouse). Do not render on touch/coarse pointers.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine)');
    const update = (e?: MediaQueryListEvent) => {
      setIsFinePointer(e ? e.matches : mq.matches);
    };
    update();
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    } else {
      // @ts-ignore deprecated
      mq.addListener(update);
      return () => {
        // @ts-ignore deprecated
        mq.removeListener(update);
      };
    }
  }, []);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    if (isVisible) {
      document.addEventListener('mousemove', updatePosition);
      setIsPointer(true);
      
      // Add a small delay before showing text to prevent flicker
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
      delayTimeoutRef.current = setTimeout(() => {
        setShowText(true);
      }, 50);
    } else {
      // Clear timeout and hide text immediately when not visible
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
      setShowText(false);
      setIsPointer(false);
    }

    return () => {
      document.removeEventListener('mousemove', updatePosition);
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
        delayTimeoutRef.current = null;
      }
    };
  }, [isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (delayTimeoutRef.current) {
        clearTimeout(delayTimeoutRef.current);
      }
    };
  }, []);

  if (!isFinePointer || !isVisible || !isPointer || !showText) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className="text-md font-light text-var">
          {text}
        </div>
      </div>
    </div>
  );
}
