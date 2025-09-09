import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageLayout',
  title: 'Image with Layout',
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
      fields: [
        {
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          description: 'Alternative text for screen readers',
        },
      ],
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
      description: 'Optional caption to display below the image',
    }),
  ],
  preview: {
    select: {
      media: 'image',
      title: 'image.alt',
      subtitle: 'layout',
    },
    prepare({ media, title, subtitle }) {
      const layoutLabels = {
        full: 'Full Width',
        medium: '60% Width',
        small: '40% Width',
      }
      return {
        title: title || 'Image',
        subtitle: layoutLabels[subtitle as keyof typeof layoutLabels] || subtitle,
        media,
      }
    },
  },
})