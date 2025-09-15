import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'mediaItem',
  title: 'Media Item',
  type: 'object',
  fields: [
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Alternative text for screen readers',
        },
      ],
      hidden: ({ parent }) => parent?.mediaType !== 'image',
      validation: (Rule) => 
        Rule.custom((image, context) => {
          const parent = context.parent as any;
          
          // Only validate if this is actually an image media type
          if (parent?.mediaType === 'image') {
            if (!image) {
              return 'Image is required when media type is image';
            }
          }
          
          // Always return true for other media types or when validation passes
          return true;
        }),
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'videoMux',
      hidden: ({ parent }) => parent?.mediaType !== 'video',
      validation: (Rule) => 
        Rule.custom((video, context) => {
          const parent = context.parent as any;
          
          // Only validate if this is actually a video media type
          if (parent?.mediaType === 'video') {
            if (!video) {
              return 'Video is required when media type is video';
            }
            // Also check if the video has an asset
            if (video && typeof video === 'object' && !(video as any).asset) {
              return 'Video asset is required';
            }
          }
          
          // Always return true for other media types or when validation passes
          return true;
        }),
    }),
    defineField({
      name: 'alt',
      title: 'Alt Text / Description',
      type: 'string',
      description: 'Alternative text for screen readers (applies to both images and videos)',
    }),
  ],
  preview: {
    select: {
      mediaType: 'mediaType',
      image: 'image',
      poster: 'video.poster',
      playbackId: 'video.asset.playbackId',
      alt: 'alt',
    },
    prepare({ mediaType, image, poster, playbackId, alt }) {
      const media = mediaType === 'image' ? image : poster;
      const title = mediaType === 'image' ? 'Image' : `Video (${playbackId || 'No ID'})`;
      const subtitle = alt || 'No description';
      
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})