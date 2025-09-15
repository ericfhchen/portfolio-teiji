import { urlFor } from './sanity.client';

export function getImageProps(
  image: any,
  width: number = 800,
  height?: number
) {
  if (!image?.asset) return null;

  let builder = urlFor(image).width(width);
  
  if (height) {
    builder = builder.height(height);
  }
  
  if (image.hotspot) {
    builder = builder.fit('crop').crop('focalpoint');
  } else {
    builder = builder.fit('crop').crop('center');
  }

  const lqip = image.lqip || image.asset?.metadata?.lqip;
  
  return {
    src: builder.url(),
    blurDataURL: lqip || undefined,
    alt: typeof image.alt === 'string' ? image.alt : '',
    hasBlur: Boolean(lqip),
  };
}

export function getImageUrl(image: any, width: number = 800) {
  if (!image?.asset) return '';
  
  return urlFor(image)
    .width(width)
    .fit('crop')
    .crop(image.hotspot ? 'focalpoint' : 'center')
    .url();
}

// Utility to detect if an image/video is vertical (portrait) based on dimensions
export function isVerticalMedia(media: any): boolean {
  // For images, check asset metadata
  if (media?.asset?.metadata?.dimensions) {
    const { width, height } = media.asset.metadata.dimensions;
    return height > width;
  }
  
  // For videos, check aspectRatio or dimensions in the video object
  if (media?.aspectRatio) {
    return media.aspectRatio < 1;
  }
  
  // For video objects with width/height
  if (media?.width && media?.height) {
    return media.height > media.width;
  }
  
  // For MUX videos, check nested asset structures
  if (media?.asset?.asset?.data?.aspect_ratio) {
    const aspectRatio = parseFloat(media.asset.asset.data.aspect_ratio);
    return aspectRatio < 1;
  }
  
  // For MUX videos, check asset data if available
  if (media?.asset?.data?.aspect_ratio) {
    const aspectRatio = parseFloat(media.asset.data.aspect_ratio);
    return aspectRatio < 1;
  }
  
  // Check for nested asset metadata dimensions
  if (media?.asset?.asset?.metadata?.dimensions) {
    const { width, height } = media.asset.asset.metadata.dimensions;
    return height > width;
  }
  
  // Check for nested asset dimensions in various MUX structures
  if (media?.asset?.data?.max_resolution_tier) {
    const resolution = media.asset.data.max_resolution_tier;
    if (typeof resolution === 'string') {
      const [width, height] = resolution.split('x').map(Number);
      if (width && height) {
        return height > width;
      }
    }
  }
  
  // Default to false (horizontal) if we can't determine
  return false;
}

// Get aspect ratio as a number (width/height)
export function getMediaAspectRatio(media: any): number {
  // For images, check asset metadata
  if (media?.asset?.metadata?.dimensions) {
    const { width, height } = media.asset.metadata.dimensions;
    return width / height;
  }
  
  // For videos, check aspectRatio
  if (media?.aspectRatio) {
    return media.aspectRatio;
  }
  
  // For video objects with width/height
  if (media?.width && media?.height) {
    return media.width / media.height;
  }
  
  // For MUX videos, check nested asset structures
  if (media?.asset?.asset?.data?.aspect_ratio) {
    return parseFloat(media.asset.asset.data.aspect_ratio);
  }
  
  // For MUX videos, check asset data if available
  if (media?.asset?.data?.aspect_ratio) {
    return parseFloat(media.asset.data.aspect_ratio);
  }
  
  // Check for nested asset metadata dimensions
  if (media?.asset?.asset?.metadata?.dimensions) {
    const { width, height } = media.asset.asset.metadata.dimensions;
    return width / height;
  }
  
  // Check for nested asset dimensions in various MUX structures
  if (media?.asset?.data?.max_resolution_tier) {
    const resolution = media.asset.data.max_resolution_tier;
    if (typeof resolution === 'string') {
      const [width, height] = resolution.split('x').map(Number);
      if (width && height) {
        return width / height;
      }
    }
  }
  
  // Default to 16:9 if we can't determine
  return 16 / 9;
}