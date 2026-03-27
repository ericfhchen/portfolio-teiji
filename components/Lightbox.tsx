'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FeedItem } from '@/sanity/schema';
import { parseSearchParams, createSearchParams, parseItemParam, createItemParam, trapFocus } from '@/lib/utils';
import { VideoPlayer } from '@/components/VideoPlayer';
import CustomCursor from './CustomCursor';
import { isVerticalMedia } from '@/lib/image';
import ImageWithBlur from '@/components/ImageWithBlur';

interface LightboxProps {
  items: FeedItem[];
  section: string;
}

export default function Lightbox({ items, section }: LightboxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Custom cursor state
  const [cursorText, setCursorText] = useState<string>('');
  const [showCursor, setShowCursor] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isFinePointer, setIsFinePointer] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const { tags: activeTags, item: activeItem } = useMemo(
    () => parseSearchParams(searchParams),
    [searchParams]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Detect fine pointer (desktop/mouse) to enable hover cursor effect only on desktop
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
      // Safari fallback
      // @ts-ignore deprecated
      mq.addListener(update);
      return () => {
        // @ts-ignore deprecated
        mq.removeListener(update);
      };
    }
  }, []);

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
  const [hasAudio, setHasAudio] = useState(false);

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

  // Reset gallery index and audio state when feed item changes
  useEffect(() => {
    setCurrentGalleryIndex(0);
    setHasAudio(false);
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

  // Swipe handlers for gallery navigation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) navigateGallery('next');
      else navigateGallery('prev');
    }
  }, [navigateGallery]);

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

  // Backdrop clicks no longer close the lightbox (explicit close only)

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

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (!currentItem) return;

    const scrollY = window.scrollY;
    const html = document.documentElement;

    // Prevent background scroll — use overflow on html to avoid
    // disrupting body positioning (which breaks iOS Safari translucent bar)
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    // Maintain scroll position visually via negative margin
    document.body.style.marginTop = `-${scrollY}px`;

    return () => {
      html.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.marginTop = '';
      window.scrollTo(0, scrollY);
    };
  }, [currentItem]);

  useEffect(() => {
    if (!currentItem) return;
    console.log(`[LIGHTBOX] item="${currentItem.parentTitle}" | gallery=${allMediaItems.length} items | showing=${currentGalleryIndex + 1}/${allMediaItems.length} | type=${currentMediaItem?.mediaType}`);
  }, [currentItem, allMediaItems.length, currentGalleryIndex]);

  // Log preload activity
  useEffect(() => {
    if (currentIndex === -1) return;
    const preloadCount = allMediaItems.length - 1 + (items.length > 1 ? 2 : 0);
    console.log(`[LIGHTBOX PRELOAD] preloading ${preloadCount} images (${allMediaItems.length - 1} gallery + ${items.length > 1 ? '2 adjacent feed items' : '0 adjacent'})`);
  }, [currentIndex, allMediaItems.length, items.length]);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--bg)]"
    >
      {/* Top-left close button */}
      <button
        onClick={close}
        className="absolute top-4 left-4 z-40 text-var text-md hover:opacity-60 transition-opacity focus:outline-none"
        aria-label="Close lightbox"
      >
        (CLOSE)
      </button>
      {/* Single vertical grid line in the center */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 bottom-0 bg-[var(--border)]"
          style={{ left: '50%', width: '1px', transform: 'scaleX(0.333)', transformOrigin: '0 0' }}
        />
      </div>

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${currentItem.parentTitle}${allMediaItems.length > 1 ? ` - Image ${currentGalleryIndex + 1} of ${allMediaItems.length}` : ''}`}
        className="relative z-10 h-full flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Full-screen navigation areas – matching home page */}
        {allMediaItems.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 w-1/2 h-full z-20 md:cursor-none"
              role="button"
              tabIndex={0}
              onClick={() => navigateGallery('prev')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateGallery('prev'); } }}
              aria-label="Previous image"
              onMouseEnter={() => {
                if (!isFinePointer) return;
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                setCursorText('PREV');
                setShowCursor(true);
              }}
              onMouseLeave={() => {
                if (!isFinePointer) return;
                hideTimeoutRef.current = setTimeout(() => {
                  setShowCursor(false);
                  setCursorText('');
                }, 100);
              }}
            />
            <div
              className="absolute right-0 top-0 w-1/2 h-full z-20 md:cursor-none"
              role="button"
              tabIndex={0}
              onClick={() => navigateGallery('next')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigateGallery('next'); } }}
              aria-label="Next image"
              onMouseEnter={() => {
                if (!isFinePointer) return;
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                  hideTimeoutRef.current = null;
                }
                setCursorText('NEXT');
                setShowCursor(true);
              }}
              onMouseLeave={() => {
                if (!isFinePointer) return;
                hideTimeoutRef.current = setTimeout(() => {
                  setShowCursor(false);
                  setCursorText('');
                }, 100);
              }}
            />
          </>
        )}

        {/* Work Tile - exactly matching Grid component home variant */}
        <div
          className="flex-1 flex items-center justify-center"
        >
          <div className="relative w-full">
            {/* Horizontal hairline across the full width at vertical center */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
            style={{ height: '1px', transform: 'scaleY(0.333)', transformOrigin: '0 0' }}
            />
            
            {/* Work tile container - matching Grid component exactly */}
            <div className="relative overflow-hidden p-6 lg:max-w-[100dvh] mx-auto w-full">
              {/* Media display — pre-render all gallery items, toggle visibility */}
              <div className="relative">
                {allMediaItems.map((mediaItem, index) => {
                  const isActive = index === currentGalleryIndex;

                  if (mediaItem.mediaType === 'video' && mediaItem.videoData) {
                    return (
                      <div
                        key={`lightbox-media-${index}`}
                        className={`relative w-full h-[70vh] overflow-hidden flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                        style={{
                          position: index === 0 ? 'relative' : 'absolute',
                          inset: index === 0 ? undefined : 0,
                        }}
                      >
                        <VideoPlayer
                          video={mediaItem.videoData}
                          objectFit="contain"
                          isVertical={isVerticalMedia(mediaItem.videoData)}
                          showMuteButton={false}
                          onHasAudioDetected={(detected) => setHasAudio(detected)}
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`lightbox-media-${index}`}
                      className={`relative w-full h-[70vh] flex items-center justify-center transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                      style={{
                        position: index === 0 ? 'relative' : 'absolute',
                        inset: index === 0 ? undefined : 0,
                      }}
                    >
                      <div className="relative w-full h-full">
                        <ImageWithBlur
                          src={mediaItem.src}
                          alt={mediaItem.alt || ''}
                          lqip={mediaItem.lqip}
                          sizes="50vw"
                          className="object-contain object-center"
                          priority={index === 0}
                        />
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>
          </div>
        </div>

        {/* Controls row - above footer */}
        <div className="absolute bottom-4 md:bottom-20 left-0 right-0 z-20">
          <div className="flex justify-between items-center px-4">
            {/* Left: Gallery number indicator - desktop only */}
            <div className="h-4 flex items-center hidden md:flex">
              {allMediaItems.length > 1 && (
                <div className="text-var font-light tracking-wider">
                  {currentGalleryIndex + 1}/{allMediaItems.length}
                </div>
              )}
            </div>
            
            {/* Right: Mute button - desktop only, only if video has audio */}
            <div className="h-4 flex items-center hidden md:flex">
              {currentMediaItem.mediaType === 'video' && currentMediaItem.videoData && hasAudio && (
                <button
                  onClick={toggleMute}
                  className="text-var font-light tracking-wider hover:opacity-60 transition-opacity"
                >
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom text layout */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 px-4 py-4"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}>
            {/* Mobile controls - top-right aligned with year/title */}
            <div className="absolute top-[1.5rem] right-4 z-30 md:hidden">
              <div className="flex flex-col items-end gap-1">
                {/* Mute button */}
                {currentMediaItem.mediaType === 'video' && currentMediaItem.videoData && hasAudio && (
                  <button
                    onClick={toggleMute}
                    className="text-var font-light tracking-wider hover:opacity-60 transition-opacity"
                  >
                    {isMuted ? 'UNMUTE' : 'MUTE'}
                  </button>
                )}

                {/* Navigation chevrons – above counter */}
                {allMediaItems.length > 1 && (
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => navigateGallery('prev')}
                      aria-label="Previous image"
                      className="px-1 py-0"
                    >
                      <svg aria-hidden className="w-2 h-4" viewBox="0 0 12 24" fill="none"
                        stroke="var(--fg)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="10,2 2,12 10,22" />
                      </svg>
                    </button>
                    <button
                      onClick={() => navigateGallery('next')}
                      aria-label="Next image"
                      className="px-1 py-0"
                    >
                      <svg aria-hidden className="w-2 h-4" viewBox="0 0 12 24" fill="none"
                        stroke="var(--fg)" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="2,2 10,12 2,22" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* Gallery number indicator */}
                {allMediaItems.length > 1 && (
                  <div className="text-var font-light tracking-wider">
                    {currentGalleryIndex + 1}/{allMediaItems.length}
                  </div>
                )}
              </div>
            </div>

            {/* Left side: Year and Title/Tags */}
            <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-8">
              {/* Year column - minimal width */}
              <div className="text-var">
                {currentItem.year || ''}
              </div>
              
              {/* Title and tags column - takes remaining space */}
              <div>
                <div className="text-var font-normal">
                  {currentItem.parentTitle}
                </div>
                {currentItem.parentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentItem.parentTags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="text-muted font-light">
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
            <div className="text-var hidden lg:block">
              {currentItem.description || ''}
            </div>
          </div>
        </div>
      </div>
      
      {/* Custom cursor */}
      <CustomCursor text={cursorText} isVisible={showCursor} />
    </div>
  );
}