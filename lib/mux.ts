import { getImageUrl } from './image';

export function muxHlsUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function muxMp4Url(
  playbackId: string,
  quality: 'low' | 'medium' | 'high' = 'medium'
): string {
  return `https://stream.mux.com/${playbackId}/${quality}.mp4`;
}

export function canPlayHlsNatively(): boolean {
  if (typeof window === 'undefined') return false;
  const video = document.createElement('video');
  // Safari/iOS returns 'probably'. Chrome/Edge return '' or 'maybe'.
  return video.canPlayType('application/vnd.apple.mpegurl') === 'probably';
}

export function shouldUseHls(): boolean {
  return canPlayHlsNatively();
}

export function posterFromSanity(image: any): string {
  if (!image) return '';
  return getImageUrl(image, 1200);
}

export function getVideoSource(playbackId: string) {
  if (!playbackId) {
    return null;
  }
  
  if (shouldUseHls()) {
    return {
      src: muxHlsUrl(playbackId),
      type: 'application/vnd.apple.mpegurl',
    };
  }
  
  return {
    src: muxMp4Url(playbackId, 'medium'),
    type: 'video/mp4',
  };
}

// Helper function to extract playbackId from MUX plugin data structure
export function getPlaybackId(videoData: any): string | null {
  // Check if it's the new MUX plugin structure with asset field
  if (videoData?.asset?.playbackId) {
    return videoData.asset.playbackId;
  }
  
  // Fallback to old structure with direct playbackId field
  if (videoData?.playbackId) {
    return videoData.playbackId;
  }
  
  return null;
}

// Updated helper function for video source that works with both old and new data structures
export function getVideoSourceFromMux(videoData: any) {
  const playbackId = getPlaybackId(videoData);
  if (!playbackId) {
    throw new Error('No valid playback ID found in video data');
  }
  
  return getVideoSource(playbackId);
}

export function getVideoThumbnailUrl(playbackId: string, time?: number): string {
  const timeParam = time ? `?time=${time}` : '';
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${timeParam}`;
}

export function getVideoGifUrl(playbackId: string, options?: {
  start?: number;
  end?: number;
  fps?: number;
  width?: number;
}): string {
  const params = new URLSearchParams();
  if (options?.start) params.set('start', options.start.toString());
  if (options?.end) params.set('end', options.end.toString());
  if (options?.fps) params.set('fps', options.fps.toString());
  if (options?.width) params.set('width', options.width.toString());
  
  const queryString = params.toString() ? `?${params.toString()}` : '';
  return `https://image.mux.com/${playbackId}/animated.gif${queryString}`;
}