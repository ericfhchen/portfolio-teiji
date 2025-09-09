'use client';

import Image from 'next/image';

interface ImageWithGridProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur';
  blurDataURL?: string;
  aspectRatio?: string;
  containerClassName?: string;
}

export default function ImageWithGrid({
  src,
  alt,
  fill = true,
  width,
  height,
  className = "object-cover",
  sizes,
  priority,
  placeholder,
  blurDataURL,
  aspectRatio = "aspect-[3/2]",
  containerClassName = "",
  ...props
}: ImageWithGridProps) {
  const imageProps: any = {
    src,
    alt,
    className,
    sizes,
    priority,
    ...props,
  };

  if (placeholder && blurDataURL) {
    imageProps.placeholder = placeholder;
    imageProps.blurDataURL = blurDataURL;
  }

  if (fill) {
    imageProps.fill = true;
  } else if (width && height) {
    imageProps.width = width;
    imageProps.height = height;
  }

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Horizontal hairline across the full width at vertical center */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-[var(--border)] z-10"
      />
      
      {/* Image container */}
      <div className={`relative ${aspectRatio} w-full overflow-hidden`}>
        <Image {...imageProps} />
      </div>
    </div>
  );
}