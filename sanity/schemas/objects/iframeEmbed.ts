import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'iframeEmbed',
  title: 'Iframe Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Embed URL',
      type: 'url',
      description: 'The iframe source URL (paste the src from your embed code)',
      validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Accessible title for the embed (e.g. "Endless Tools Editor")',
    }),
    defineField({
      name: 'aspectRatio',
      title: 'Aspect Ratio',
      type: 'string',
      options: {
        list: [
          { title: '16:9 (Widescreen)', value: '16/9' },
          { title: '4:3', value: '4/3' },
          { title: '1:1 (Square)', value: '1/1' },
          { title: '9:16 (Portrait)', value: '9/16' },
          { title: 'Full Viewport Height', value: 'viewport' },
        ],
        layout: 'dropdown',
      },
      initialValue: '16/9',
    }),
    defineField({
      name: 'width',
      title: 'Width',
      type: 'string',
      options: {
        list: [
          { title: '40%', value: '40%' },
          { title: '60%', value: '60%' },
          { title: '80%', value: '80%' },
          { title: '100%', value: '100%' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'dropdown',
      },
      initialValue: '100%',
    }),
    defineField({
      name: 'customWidth',
      title: 'Custom Width (%)',
      type: 'number',
      description: 'Custom width between 20–100%',
      validation: (Rule) => Rule.min(20).max(100),
      hidden: ({ parent }) => parent?.width !== 'custom',
    }),
    defineField({
      name: 'mobileWidth',
      title: 'Mobile Width (optional)',
      type: 'string',
      description: 'Width on mobile only. If not set, uses the desktop width above.',
      options: {
        list: [
          { title: '40%', value: '40%' },
          { title: '60%', value: '60%' },
          { title: '80%', value: '80%' },
          { title: '100%', value: '100%' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'mobileCustomWidth',
      title: 'Mobile Custom Width (%)',
      type: 'number',
      description: 'Enter a custom mobile width between 20 and 100',
      validation: (Rule) => Rule.min(20).max(100),
      hidden: ({ parent }) => parent?.mobileWidth !== 'custom',
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      options: {
        list: [
          { title: 'Transparent', value: 'transparent' },
          { title: 'White', value: 'white' },
          { title: 'Black', value: 'black' },
        ],
        layout: 'radio',
      },
      initialValue: 'transparent',
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      url: 'url',
      title: 'title',
    },
    prepare({ url, title }) {
      return {
        title: title || 'Iframe Embed',
        subtitle: url || 'No URL set',
      }
    },
  },
})
