import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageLayout',
  title: 'Media with Layout',
  type: 'object',
  fields: [
    defineField({
      name: 'media',
      title: 'Media',
      type: 'mediaItem',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full Width (100%)', value: 'full' },
          { title: 'Medium Width (60%)', value: 'medium' },
          { title: 'Small Width (40%)', value: 'small' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the media',
    }),
  ],
  preview: {
    select: {
      mediaItem: 'media',
      alt: 'media.alt',
      layout: 'layout',
    },
    prepare({ mediaItem, alt, layout }) {
      const layoutLabels = {
        full: 'Full Width',
        medium: '60% Width',
        small: '40% Width',
      }
      
      // Get media for preview - prioritize image, fall back to video poster
      let media = null;
      if (mediaItem?.mediaType === 'image' && mediaItem.image) {
        media = mediaItem.image;
      } else if (mediaItem?.mediaType === 'video' && mediaItem.video?.poster) {
        media = mediaItem.video.poster;
      }
      
      const mediaType = mediaItem?.mediaType === 'video' ? 'Video' : 'Image';
      
      return {
        title: alt || mediaType,
        subtitle: layoutLabels[layout as keyof typeof layoutLabels] || layout,
        media,
      }
    },
  },
})