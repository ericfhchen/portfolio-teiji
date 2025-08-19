import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Alternative text for screen readers',
    }),
  ],
  preview: {
    select: {
      media: 'image',
      title: 'alt',
    },
    prepare({ media, title }) {
      return {
        title: title || 'Image',
        media,
      }
    },
  },
})