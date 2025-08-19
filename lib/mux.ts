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
  return video.canPlayType('application/vnd.apple.mpegurl') !== '';
}

export function shouldUseHls(): boolean {
  return canPlayHlsNatively();
}

export function posterFromSanity(image: any): string {
  if (!image) return '';
  return getImageUrl(image, 1200);
}

export function getVideoSource(playbackId: string) {
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