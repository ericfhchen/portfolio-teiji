'use client';

import Image from 'next/image';
import { useState } from 'react';

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

  const imageProps: any = {
    src,
    alt,
    className,
    sizes,
    placeholder: "empty",
    onLoad: () => setImageLoaded(true),
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

  return (
    <>
      <Image {...imageProps} />
      {/* Blur placeholder that matches image dimensions */}
      {lqip && !imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={lqip}
            alt=""
            {...(fill ? { fill: true } : { width, height })}
            className={`${className} opacity-100 blur-sm`}
            sizes={sizes}
            aria-hidden="true"
          />
        </div>
      )}
    </>
  );
}
