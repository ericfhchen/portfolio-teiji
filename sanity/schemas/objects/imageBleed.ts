import { defineType } from 'sanity';

export default defineType({
  name: 'imageBleed',
  title: 'Media Bleed',
  type: 'object',
  fields: [
    {
      name: 'media',
      title: 'Media',
      type: 'mediaItem',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      mediaItem: 'media',
    },
    prepare(selection) {
      const { mediaItem } = selection;
      
      // Get media for preview - prioritize image, fall back to video poster
      let media = null;
      if (mediaItem?.mediaType === 'image' && mediaItem.image) {
        media = mediaItem.image;
      } else if (mediaItem?.mediaType === 'video' && mediaItem.video?.poster) {
        media = mediaItem.video.poster;
      }
      
      const mediaType = mediaItem?.mediaType === 'video' ? 'Video' : 'Image';
      
      return {
        title: `${mediaType} Bleed`,
        media,
      };
    },
  },
});