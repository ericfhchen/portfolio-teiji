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

  // Debug: Log the actual data structure to understand what we're working with
  // console.log('🔍 getPlaybackId: Video data structure:', JSON.stringify(videoData, null, 2));

  // Check for various possible structures from MUX plugin
  
  // Structure 1: Direct playbackId field (most common in current MUX plugin)
  if (videoData?.playbackId) {
    // console.log('✅ Found playbackId in direct field:', videoData.playbackId);
    return videoData.playbackId;
  }

  // Structure 2: { asset: { playbackId: "..." } } - standard MUX structure
  if (videoData?.asset?.playbackId) {
    // console.log('✅ Found playbackId in asset field:', videoData.asset.playbackId);
    return videoData.asset.playbackId;
  }

  // Structure 3: { asset: { asset: { playbackId: "..." } } } - nested asset structure
  if (videoData?.asset?.asset?.playbackId) {
    // console.log('✅ Found playbackId in nested asset field:', videoData.asset.asset.playbackId);
    return videoData.asset.asset.playbackId;
  }

  // Structure 4: { asset: { data: { playback_ids: [{ id: "..." }] } } }
  if (videoData?.asset?.data?.playback_ids?.[0]?.id) {
    // console.log('✅ Found playbackId in data.playback_ids:', videoData.asset.data.playback_ids[0].id);
    return videoData.asset.data.playback_ids[0].id;
  }

  // Structure 5: { asset: { asset: { data: { playback_ids: [{ id: "..." }] } } } } - nested version
  if (videoData?.asset?.asset?.data?.playback_ids?.[0]?.id) {
    // console.log('✅ Found playbackId in nested data.playback_ids:', videoData.asset.asset.data.playback_ids[0].id);
    return videoData.asset.asset.data.playback_ids[0].id;
  }

  // Structure 6: { asset: { assetId: "..." } } - some older MUX versions
  if (videoData?.asset?.assetId) {
    // console.log('✅ Found assetId in asset field:', videoData.asset.assetId);
    return videoData.asset.assetId;
  }

  // Structure 7: { asset: { asset: { assetId: "..." } } } - nested version
  if (videoData?.asset?.asset?.assetId) {
    // console.log('✅ Found assetId in nested asset field:', videoData.asset.asset.assetId);
    return videoData.asset.asset.assetId;
  }

  // Structure 8: Check if the nested asset object is the playback ID (string)
  if (typeof videoData?.asset?.asset === 'string') {
    // console.log('✅ Found string asset as playbackId:', videoData.asset.asset);
    return videoData.asset.asset;
  }

  // Structure 9: Check for MUX metadata structure with playbacks array
  if (videoData?.asset?.metadata?.playbacks?.[0]?._id) {
    // console.log('✅ Found playbackId in metadata.playbacks:', videoData.asset.metadata.playbacks[0]._id);
    return videoData.asset.metadata.playbacks[0]._id;
  }

  // Structure 10: Check for nested asset metadata structure
  if (videoData?.asset?.asset?.metadata?.playbacks?.[0]?._id) {
    // console.log('✅ Found playbackId in nested metadata.playbacks:', videoData.asset.asset.metadata.playbacks[0]._id);
    return videoData.asset.asset.metadata.playbacks[0]._id;
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