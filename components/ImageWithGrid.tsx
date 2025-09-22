'use client';

import ImageWithBlur from '@/components/ImageWithBlur';

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

  return (
    <div className={`relative ${containerClassName}`}>
      {/* Horizontal hairline across the full width at vertical center */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-10"
              style={{ height: '0.5px' }}
      />
      
      {/* Image container */}
      <div className={`relative ${aspectRatio} w-full overflow-hidden`}>
        <ImageWithBlur
          src={src}
          alt={alt}
          lqip={placeholder && blurDataURL ? blurDataURL : undefined}
          sizes={sizes || ""}
          className={className}
          fill={fill}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}