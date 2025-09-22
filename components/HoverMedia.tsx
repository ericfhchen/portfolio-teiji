'use client';

import { useState, useCallback } from 'react';
import { VideoPlayer } from '@/components/VideoPlayer';
import ImageWithBlur from '@/components/ImageWithBlur';

interface HoverMediaProps {
  // Static media data (always present)
  staticMedia: {
    src: string;
    alt: string;
    lqip?: string;
    mediaType: 'image' | 'video';
    videoData?: any;
  };
  
  // Hover media data (optional)
  hoverMedia?: {
    src: string;
    alt: string;
    lqip?: string;
    mediaType: 'image' | 'video';
    videoData?: any;
  };
  
  // Container styling
  className?: string;
  
  // Event handlers
  onClick?: () => void;
}

export default function HoverMedia({
  staticMedia,
  hoverMedia,
  className = '',
  onClick,
}: HoverMediaProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showHoverMedia, setShowHoverMedia] = useState(false);

  const hasHoverMedia = hoverMedia && 
    !(staticMedia.mediaType === 'video' && hoverMedia.mediaType === 'video'); // No video->video

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (hasHoverMedia) {
      // Small delay to prevent flicker on quick hovers
      setTimeout(() => {
        setShowHoverMedia(true);
      }, 150);
    }
  }, [hasHoverMedia]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setShowHoverMedia(false);
  }, []);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group block w-full focus:outline-none ${className}`}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Static Media - always visible */}
        <div 
          className={`absolute inset-0 transition-opacity duration-300 ${
            showHoverMedia && hasHoverMedia ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {staticMedia.mediaType === 'video' && staticMedia.videoData ? (
            <VideoPlayer 
              video={staticMedia.videoData} 
              objectFit="contain" 
              isVertical={false}
              autoPlay={false}
              showMuteButton={false}
            />
          ) : (
            <ImageWithBlur
              src={staticMedia.src}
              alt={staticMedia.alt}
              lqip={staticMedia.lqip}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain object-center"
            />
          )}
        </div>

        {/* Hover Media - shown on hover if available */}
        {hasHoverMedia && hoverMedia && (
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              showHoverMedia ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {hoverMedia.mediaType === 'video' && hoverMedia.videoData ? (
              <VideoPlayer 
                video={hoverMedia.videoData} 
                objectFit="cover" 
                isVertical={false}
                autoPlay={showHoverMedia}
                showMuteButton={false}
              />
            ) : (
              <ImageWithBlur
                src={hoverMedia.src}
                alt={hoverMedia.alt}
                lqip={hoverMedia.lqip}
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover object-center"
              />
            )}
          </div>
        )}

      </div>
    </button>
  );
}
