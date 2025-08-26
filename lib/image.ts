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

  return {
    src: builder.url(),
    blurDataURL: image.asset.metadata?.lqip || '',
    alt: typeof image.alt === 'string' ? image.alt : '',
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