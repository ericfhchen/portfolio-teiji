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
  
  // Always use HLS for now since MP4 renditions may not be enabled
  // HLS works in Safari natively and can work in Chrome with proper handling
  return {
    src: muxHlsUrl(playbackId),
    type: 'application/vnd.apple.mpegurl',
  };
  
  // TODO: Re-enable MP4 fallback once MP4 renditions are confirmed to be enabled in MUX
  // if (shouldUseHls()) {
  //   return {
  //     src: muxHlsUrl(playbackId),
  //     type: 'application/vnd.apple.mpegurl',
  //   };
  // }
  // 
  // return {
  //   src: muxMp4Url(playbackId, 'medium'),
  //   type: 'video/mp4',
  // };
}

// Enhanced function to extract playbackId from various MUX data structures
export function getPlaybackId(videoData: any): string | null {
  if (!videoData) {
    console.warn('getPlaybackId: No video data provided');
    return null;
  }

  // Check for various possible structures from MUX plugin
  
  // Structure 1: { asset: { asset: { playbackId: "..." } } } - NEW: nested asset structure
  if (videoData?.asset?.asset?.playbackId) {
    return videoData.asset.asset.playbackId;
  }

  // Structure 2: { asset: { playbackId: "..." } }
  if (videoData?.asset?.playbackId) {
    return videoData.asset.playbackId;
  }

  // Structure 3: { asset: { data: { playback_ids: [{ id: "..." }] } } }
  if (videoData?.asset?.data?.playback_ids?.[0]?.id) {
    return videoData.asset.data.playback_ids[0].id;
  }

  // Structure 4: { asset: { asset: { data: { playback_ids: [{ id: "..." }] } } } } - nested version
  if (videoData?.asset?.asset?.data?.playback_ids?.[0]?.id) {
    return videoData.asset.asset.data.playback_ids[0].id;
  }

  // Structure 5: Direct playbackId field
  if (videoData?.playbackId) {
    return videoData.playbackId;
  }

  // Structure 6: { asset: { assetId: "..." } } - some older MUX versions
  if (videoData?.asset?.assetId) {
    return videoData.asset.assetId;
  }

  // Structure 7: { asset: { asset: { assetId: "..." } } } - nested version
  if (videoData?.asset?.asset?.assetId) {
    return videoData.asset.asset.assetId;
  }

  // Structure 8: Check if the nested asset object is the playback ID (string)
  if (typeof videoData?.asset?.asset === 'string') {
    return videoData.asset.asset;
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