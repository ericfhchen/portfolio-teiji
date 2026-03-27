'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

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
  lazy?: boolean;
}

// Track global image loading stats
const imageStats = {
  total: 0,
  loaded: 0,
  times: [] as number[],
};

export default function ImageWithBlur({
  src,
  alt,
  lqip,
  sizes,
  className,
  fill = true,
  width,
  height,
  priority,
  lazy,
}: ImageWithBlurProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const loadStartRef = useRef(performance.now());
  const mountTimeRef = useRef(performance.now());
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    imageStats.total++;
    const id = imageStats.total;
    const shortSrc = src.split('?')[0].split('/').slice(-2).join('/');
    console.log(`[IMG #${id} MOUNT] ${shortSrc} | priority=${!!priority} | lazy=${lazy ?? !priority} | sizes="${sizes}" | fill=${fill} | ${width ? `${width}x${height}` : 'fill'}`);
    return () => {
      console.log(`[IMG #${id} UNMOUNT] ${shortSrc}`);
    };
  }, []);

  // Check if already cached on mount
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, []);

  const handleLoad = useCallback(() => {
    const elapsed = performance.now() - loadStartRef.current;
    const sinceMount = performance.now() - mountTimeRef.current;
    imageStats.loaded++;
    imageStats.times.push(elapsed);
    const shortSrc = src.split('?')[0].split('/').slice(-2).join('/');
    const avg = Math.round(imageStats.times.reduce((a, b) => a + b, 0) / imageStats.times.length);
    console.log(
      `[IMG LOADED] ${shortSrc} | ${Math.round(elapsed)}ms (${Math.round(sinceMount)}ms since mount) | ${imageStats.loaded}/${imageStats.total} loaded | avg ${avg}ms`
    );
    setImageLoaded(true);
  }, [src]);

  // Determine loading strategy: priority=eager, explicit lazy, or default lazy for non-priority
  const loading = priority ? 'eager' : (lazy !== false ? 'lazy' : undefined);

  // Build style for fill mode
  const fillStyle: React.CSSProperties = fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }
    : {};

  const imgClassName = `${className} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className="relative" style={fill ? { position: 'absolute', inset: 0 } : undefined}>
      {/* Full-res image — loaded directly from Sanity CDN, no double optimization */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        sizes={sizes}
        loading={loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        className={imgClassName}
        style={fill ? fillStyle : undefined}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        onLoad={handleLoad}
      />
      {/* LQIP blur placeholder — inline base64, renders instantly */}
      {lqip && (
        <div
          className={`absolute inset-0 overflow-hidden transition-opacity duration-300 ${imageLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <img
            src={lqip}
            alt=""
            aria-hidden="true"
            className={`${className} blur-xl scale-110`}
            style={fill ? { ...fillStyle, objectFit: 'cover' } : undefined}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
          />
        </div>
      )}
    </div>
  );
}
