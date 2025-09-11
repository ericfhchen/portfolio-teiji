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
      validation: (Rule) => Rule.required(),
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
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Video as Thumbnail', value: 'thumbnail' },
          { title: 'Show on Hover', value: 'hover' },
        ],
        layout: 'radio',
      },
      initialValue: 'thumbnail',
      description: 'How to display the video in grid views',
    }),
    

  ],
  preview: {
    select: {
      title: 'playbackId',
      poster: 'poster',
      displayMode: 'displayMode',
    },
    prepare({ title, poster, displayMode }) {
      return {
        title: `Video: ${title || 'No playback ID'}`,
        subtitle: `Display: ${displayMode || 'thumbnail'}`,
        media: poster,
      }
    },
  },
})