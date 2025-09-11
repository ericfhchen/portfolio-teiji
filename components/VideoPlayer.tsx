'use client';

import { useState, useCallback, useRef } from 'react';
import { getVideoSourceFromMux, getPlaybackId, posterFromSanity } from '@/lib/mux';
import { client } from '@/lib/sanity.client';

// VideoLayout component for layout-aware video rendering
export function VideoLayout({ video, layout, caption, alt }: { 
  video: any; 
  layout: string; 
  caption?: string; 
  alt?: string; 
}) {
  const layoutStyles = {
    full: 'w-full max-w-4xl',
    medium: 'w-full max-w-[60%]',
    small: 'w-full max-w-[40%]',
  };

  return (
    <div className="my-8">
      {/* Full-width container that breaks out of prose constraints */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        {/* Full-width horizontal line at vertical center, behind video */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 bg-[var(--border)] z-0"
        style={{ height: '0.5px' }}
        />
        {/* Video centered within normal content width with layout sizing */}
        <figure className="relative z-10 mx-4 sm:mx-6 lg:mx-8 flex justify-center">
          <div className={`relative aspect-[3/2] overflow-hidden ${layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.full}`}>
            <VideoPlayer video={video} />
          </div>
        </figure>
      </div>
      {(caption || alt) && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {caption || alt}
        </figcaption>
      )}
    </div>
  );
}

// VideoBleed component for full-bleed video rendering
export function VideoBleed({ video, alt }: { video: any; alt?: string }) {
  return (
    <div className="my-12 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <VideoPlayer video={video} />
      </div>
      {alt && (
        <figcaption className="mt-2 text-sm text-muted text-center">
          {alt}
        </figcaption>
      )}
    </div>
  );
}

// VideoPlayer component
export function VideoPlayer({ video }: { video: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playbackId = getPlaybackId(video);
  if (!playbackId) {
    console.error('No valid playback ID found in video data:', video);
    return null;
  }
  
  try {
    const videoSource = getVideoSourceFromMux(video);
    if (!videoSource?.src) {
      console.error('No valid video source generated:', videoSource);
      return null;
    }
    const posterUrl = posterFromSanity(video.poster);

    // Get captions URL if available
    let captionsUrl = '';
    if (video.captions?.asset?._ref) {
      const assetId = video.captions.asset._ref.replace('file-', '').replace('-vtt', '');
      captionsUrl = `https://cdn.sanity.io/files/${client.config().projectId}/${client.config().dataset}/${assetId}.vtt`;
    }

    const handleVideoClick = useCallback(() => {
      if (!videoRef.current) return;

      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }, []);

    return (
    <div className="relative group cursor-pointer" onClick={handleVideoClick}>
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay={true}
        loop={true}
        muted={true}
        playsInline
        preload="metadata"
        {...(posterUrl && { poster: posterUrl })}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoSource.src} type={videoSource.type} />
        {captionsUrl && (
          <track
            kind="captions"
            src={captionsUrl}
            srcLang="en"
            label="English"
            default
          />
        )}
        Your browser does not support the video tag.
      </video>


      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-50 text-white p-3 rounded-full">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      )}
    </div>
    );
  } catch (error) {
    console.error('Error rendering video player:', error);
    return null;
  }
}