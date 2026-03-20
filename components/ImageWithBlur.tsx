'use client';

import Image from 'next/image';
import { useState, useRef, useCallback } from 'react';

interface ImageWithBlurProps {
  src: string;
  alt: string;
  lqip?: string;
  sizes: string;
  className: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function ImageWithBlur({
  src,
  alt,
  lqip,
  sizes,
  className,
  fill = true,
  width,
  height,
  priority
}: ImageWithBlurProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const loadStartRef = useRef(performance.now());

  const handleLoad = useCallback(() => {
    const elapsed = performance.now() - loadStartRef.current;
    console.log(`[ImageWithBlur] Loaded in ${Math.round(elapsed)}ms: ${src.substring(0, 80)}...`);
    setImageLoaded(true);
  }, [src]);

  const imageProps: any = {
    src,
    alt,
    className: `${className} transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`,
    sizes,
    placeholder: "empty",
    onLoad: handleLoad,
  };

  if (priority) {
    imageProps.priority = priority;
  }

  if (fill) {
    imageProps.fill = true;
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  // Use a relative wrapper to contain the absolute blur overlay
  // When fill mode, the wrapper itself must be absolute to fill parent
  return (
    <div className="relative" style={fill ? { position: 'absolute', inset: 0 } : undefined}>
      <Image {...imageProps} />
      {/* Blur placeholder that matches image dimensions */}
      {lqip && (
        <div
          className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <Image
            src={lqip}
            alt=""
            {...(fill ? { fill: true } : { width, height })}
            className={`${className} blur-xl scale-110`}
            sizes={sizes}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
