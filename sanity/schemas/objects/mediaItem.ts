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
          if (parent?.mediaType === 'image' && !image) {
            return 'Image is required when media type is image';
          }
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
          if (parent?.mediaType === 'video' && !video) {
            return 'Video is required when media type is video';
          }
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