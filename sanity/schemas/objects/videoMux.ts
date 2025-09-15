import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'videoMux',
  title: 'Video (MUX)',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Video Asset',
      type: 'mux.video',
      description: 'Upload a video file - it will be processed by MUX',
    }),
    defineField({
      name: 'poster',
      title: 'Poster Image',
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
      description: 'Optional poster image displayed before video loads',
    }),
    defineField({
      name: 'width',
      title: 'Video Width',
      type: 'string',
      options: {
        list: [
          { title: 'Full Width', value: 'full' },
          { title: 'Half Width', value: 'half' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
      description: 'Width of the video in portable text content',
      fieldset: 'layout',
    }),
    

  ],
  fieldsets: [
    {
      name: 'layout',
      title: 'Layout Options',
      options: {
        collapsible: true,
        collapsed: true,
      },
    },
  ],
  preview: {
    select: {
      title: 'playbackId',
      poster: 'poster',
      width: 'width',
    },
    prepare({ title, poster, width }) {
      return {
        title: `Video: ${title || 'No playback ID'}`,
        subtitle: `Width: ${width || 'full'}`,
        media: poster,
      }
    },
  },
})