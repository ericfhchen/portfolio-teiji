'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, parseItemParam, createItemParam, trapFocus } from '@/lib/utils';
import { VideoPlayer } from '@/components/VideoPlayer';
import { isVerticalMedia } from '@/lib/image';

interface LightboxProps {
  items: FeedItem[];
  section: string;
}

export default function Lightbox({ items, section }: LightboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  const { tags: activeTags, item: activeItem } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  // Determine current route context
  const currentRoute = useMemo(() => {
    if (pathname.includes('/work')) return 'work';
    if (pathname.includes('/index')) return 'index';
    return 'index'; // default fallback
  }, [pathname]);

  const currentItemData = useMemo(() => {
    if (!activeItem) return null;
    return parseItemParam(activeItem);
  }, [activeItem]);

  const currentItem = useMemo(() => {
    if (!currentItemData) return null;
    return items.find(
      item => item.parentSlug === currentItemData.parentSlug && item.index === currentItemData.index
    );
  }, [items, currentItemData]);

  const currentIndex = useMemo(() => {
    if (!currentItem) return -1;
    return items.findIndex(
      item => item.parentSlug === currentItem.parentSlug && item.index === currentItem.index
    );
  }, [items, currentItem]);

  // Gallery navigation state
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  
  // Video mute state
  const [isMuted, setIsMuted] = useState(true);

  // Get all media items for current feed item (main item + gallery)
  const allMediaItems = useMemo(() => {
    if (!currentItem) return [];
    
    const mediaItems = [
      // Main featured media
      {
        mediaType: currentItem.mediaType,
        src: currentItem.src,
        alt: currentItem.alt,
        lqip: currentItem.lqip,
        videoData: currentItem.videoData,
        playbackId: currentItem.playbackId,
        poster: currentItem.poster,
        controls: currentItem.controls,
      }
    ];
    
    // Add gallery items if they exist
    if (currentItem.gallery && currentItem.gallery.length > 0) {
      const galleryItems = currentItem.gallery.map(galleryItem => ({
        mediaType: galleryItem.mediaType,
        src: galleryItem.src,
        alt: galleryItem.alt || '',
        lqip: galleryItem.lqip || '',
        videoData: galleryItem.videoData,
        playbackId: galleryItem.playbackId,
        poster: galleryItem.poster,
        controls: galleryItem.controls,
      }));
      mediaItems.push(...galleryItems);
    }
    
    return mediaItems;
  }, [currentItem]);

  const currentMediaItem = allMediaItems[currentGalleryIndex] || allMediaItems[0];

  // Reset gallery index when feed item changes
  useEffect(() => {
    setCurrentGalleryIndex(0);
  }, [currentItem?._id]);

  const close = useCallback(() => {
    // Pause any playing videos before closing
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
    
    const newParams = createSearchParams(activeTags);
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, router, section, currentRoute]);

  // Gallery navigation within current feed item
  const navigateGallery = useCallback((direction: 'prev' | 'next') => {
    if (allMediaItems.length <= 1) return;
    
    // Pause current video if it's playing
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (!video.paused) {
        video.pause();
      }
    });
    
    setCurrentGalleryIndex(prev => {
      if (direction === 'prev') {
        return prev <= 0 ? allMediaItems.length - 1 : prev - 1;
      } else {
        return prev >= allMediaItems.length - 1 ? 0 : prev + 1;
      }
    });
  }, [allMediaItems]);

  // Navigate to different feed items
  const navigate = useCallback((direction: 'prev' | 'next') => {
    if (items.length === 0) return;
    
    // Pause current video if it's playing
    if (currentItem?.mediaType === 'video') {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        if (!video.paused) {
          video.pause();
        }
      });
    }
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
    }
    
    const newItem = items[newIndex];
    const itemParam = createItemParam(newItem.parentSlug, newItem.index);
    const newParams = createSearchParams(activeTags, itemParam);
    
    router.replace(`/${section}/${currentRoute}?${newParams}`, { scroll: false });
  }, [activeTags, currentIndex, items, router, section, currentRoute, currentItem]);

  // Toggle mute for videos
  const toggleMute = useCallback(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      video.muted = !isMuted;
    });
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowLeft':
        navigate('prev');
        break;
      case 'ArrowRight':
        navigate('next');
        break;
    }
  }, [close, navigate]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close();
    }
  }, [close]);

  // Preload next and previous images/videos (both feed items and gallery items)
  useEffect(() => {
    if (currentIndex === -1) return;
    
    const preloadMediaItem = (mediaItem: any) => {
      if (mediaItem.mediaType === 'image') {
        const img = new window.Image();
        img.decoding = 'async';
        img.src = mediaItem.src;
      }
      // For videos, preload the poster image if available
      else if (mediaItem.mediaType === 'video' && mediaItem.poster) {
        const img = new window.Image();
        img.decoding = 'async';
        img.src = mediaItem.poster;
      }
    };
    
    // Preload other gallery items in current feed item
    allMediaItems.forEach((mediaItem, index) => {
      if (index !== currentGalleryIndex) {
        preloadMediaItem(mediaItem);
      }
    });
    
    // Preload next/previous feed items if there are any
    if (items.length > 1) {
      const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;
      
      const preloadFeedItem = (item: FeedItem) => {
        // Preload main media
        preloadMediaItem(item);
        
        // Preload first gallery item if it exists
        if (item.gallery && item.gallery.length > 0) {
          preloadMediaItem(item.gallery[0]);
        }
      };
      
      preloadFeedItem(items[prevIndex]);
      preloadFeedItem(items[nextIndex]);
    }
  }, [currentIndex, items, allMediaItems, currentGalleryIndex]);

  // Setup keyboard listeners and focus trap
  useEffect(() => {
    if (!currentItem || !dialogRef.current) return;
    
    document.addEventListener('keydown', handleKeyDown);
    const cleanup = trapFocus(dialogRef.current);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cleanup();
    };
  }, [currentItem, handleKeyDown]);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      onClick={handleBackdropClick}
    >
      {/* Single vertical grid line in the center */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 bottom-0 border-r border-var"
          style={{ left: '50%', borderWidth: '0.5px' }}
        />
      </div>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${currentItem.parentTitle}${allMediaItems.length > 1 ? ` - Image ${currentGalleryIndex + 1} of ${allMediaItems.length}` : ''}`}
        className="relative z-10 h-full flex flex-col"
      >
        {/* Work Tile - exactly matching Grid component home variant */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full">
            {/* Horizontal hairline across the full width at vertical center */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '0.5px' }}
            />
            
            {/* Work tile container - matching Grid component exactly */}
            <div className="relative overflow-hidden p-6 lg:max-w-[100dvh] mx-auto w-full">
              {/* Media display */}
              <div className="relative">
                {currentMediaItem.mediaType === 'video' && currentMediaItem.videoData ? (
                  // Video rendering with consistent height
                  <div className="relative w-full h-[70vh] overflow-hidden flex items-center justify-center">
                    <VideoPlayer 
                      video={currentMediaItem.videoData} 
                      objectFit="contain" 
                      isVertical={isVerticalMedia(currentMediaItem.videoData)}
                      showMuteButton={false}
                    />
                  </div>
                ) : (
                  // Image rendering
                  <div className="relative w-full h-[70vh] flex items-center justify-center">
                    <div className="relative w-full h-full">
                      <Image
                        src={currentMediaItem.src}
                        alt={currentMediaItem.alt || ''}
                        fill
                        className="object-contain object-center"
                        {...(currentMediaItem.lqip && {
                          placeholder: "blur" as const,
                          blurDataURL: currentMediaItem.lqip,
                        })}
                        sizes="50vw"
                        priority
                      />
                    </div>
                  </div>
                )}

                {/* Gallery navigation click areas - only show if there are multiple media items */}
                {allMediaItems.length > 1 && (
                  <>
                    {/* Left click area - previous gallery item */}
                    <button
                      onClick={() => navigateGallery('prev')}
                      className="absolute left-0 top-0 w-1/3 h-full z-10 focus:outline-none cursor-w-resize"
                      aria-label="Previous image"
                    />
                    
                    {/* Right click area - next gallery item */}
                    <button
                      onClick={() => navigateGallery('next')}
                      className="absolute right-0 top-0 w-1/3 h-full z-10 focus:outline-none cursor-e-resize"
                      aria-label="Next image"
                    />
                  </>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* Controls row - above footer */}
        <div className="absolute bottom-16 md:bottom-16 left-0 right-0 z-20">
          <div className="flex justify-between items-center px-4">
            {/* Left: Gallery number indicator - desktop only */}
            <div className="h-4 flex items-center hidden md:flex">
              {allMediaItems.length > 1 && (
                <div className="text-var text-xs font-light tracking-wider">
                  {currentGalleryIndex + 1}/{allMediaItems.length}
                </div>
              )}
            </div>
            
            {/* Right: Mute button - desktop only */}
            <div className="h-4 flex items-center hidden md:flex">
              {currentMediaItem.mediaType === 'video' && currentMediaItem.videoData && (
                <button
                  onClick={toggleMute}
                  className="text-var text-xs font-light tracking-wider hover:opacity-60 transition-opacity"
                >
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile controls - fixed position bottom right */}
        <div className="fixed bottom-16 right-4 z-30 md:hidden">
          <div className="flex flex-col items-end gap-0">
            {/* Mute button - top */}
            {currentMediaItem.mediaType === 'video' && currentMediaItem.videoData && (
              <button
                onClick={toggleMute}
                className="text-var text-xs font-light tracking-wider hover:opacity-60 transition-opacity"
              >
                {isMuted ? 'UNMUTE' : 'MUTE'}
              </button>
            )}
            
            {/* Gallery number indicator - bottom */}
            {allMediaItems.length > 1 && (
              <div className="text-var text-xs font-light tracking-wider">
                {currentGalleryIndex + 1}/{allMediaItems.length}
              </div>
            )}
          </div>
        </div>

        {/* Bottom text layout - restored to original */}
        <div className="absolute bottom-12 md:bottom-0 left-0 right-0 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 py-4">
            {/* Left side: Year and Title/Tags */}
            <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-8">
              {/* Year column - minimal width */}
              <div className="text-var text-xs">
                {currentItem.year || ''}
              </div>
              
              {/* Title and tags column - takes remaining space */}
              <div>
                <div className="text-var font-normal text-xs">
                  {currentItem.parentTitle}
                </div>
                {currentItem.parentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentItem.parentTags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="text-muted font-light text-xs">
                        <Link
                          href={`/${section}/index?tags=${encodeURIComponent(tag)}`}
                          className="hover:text-var transition-colors focus:outline-none focus:text-var"
                        >
                          {tag}
                        </Link>
                        {index < currentItem.parentTags.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Description - hidden on mobile */}
            <div className="text-var text-xs hidden lg:block">
              {currentItem.description || ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}