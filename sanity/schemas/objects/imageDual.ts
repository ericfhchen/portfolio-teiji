import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageDual',
  title: 'Dual Images (Side by Side)',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
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
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(2).error('Must have exactly 2 images'),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the images',
    }),
  ],
  preview: {
    select: {
      image1: 'images.0',
      image2: 'images.1',
      caption: 'caption',
    },
    prepare({ image1, image2, caption }) {
      return {
        title: 'Dual Images (60% width)',
        subtitle: caption || 'Side by side layout',
        media: image1,
      }
    },
  },
})