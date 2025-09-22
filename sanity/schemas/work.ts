import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  fields: [
    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',
      options: {
        list: [
          { title: 'Art', value: 'art' },
          { title: 'Design', value: 'design' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Media',
      type: 'mediaItem',
      description: 'Featured image or video for this work',
    }),
    defineField({
      name: 'hoverTextTop',
      title: 'Hover text 1 (above line)',
      type: 'string',
      description: 'Shown on section home/work page when hovering Featured/Cover media. Regular style, above the horizontal line.',
    }),
    defineField({
      name: 'hoverTextBottom',
      title: 'Hover text 2 (below line)',
      type: 'string',
      description: 'Shown on section home/work page when hovering Featured/Cover media. Italic style, below the horizontal line.',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Media',
      type: 'mediaItem',
      description: 'Cover image or video for this work',
    }),
    defineField({
      name: 'hoverMedia',
      title: 'Hover Media',
      type: 'mediaItem',
      description: 'Image or video that appears on hover in the work grid (16:9 aspect ratio recommended)',
    }),
    defineField({
      name: 'heroAsset',
      title: 'Hero Gallery',
      type: 'array',
      of: [{ type: 'mediaItem' }],
      options: { sortable: true },
      validation: (Rule) => Rule.max(10),
      description: 'One or more images/videos for the project hero. If empty, falls back to cover media.',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'string',
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Quote', value: 'blockquote' },
            { title: 'Caption', value: 'caption' },
            { title: 'Small', value: 'small' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
        {
          type: 'projectImage',
          title: 'Project Image',
        },
        {
          type: 'imageDual',
          title: 'Dual Images (Side by Side)',
        },
        {
          type: 'imageBleed',
          title: 'Full Bleed Image',
        },
        {
          type: 'spacer',
          title: 'Spacer',
        },
        {
          type: 'videoMux',
          title: 'Video (MUX)',
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'tag' }],
          options: {
            disableNew: false,
          },
        },
      ],
      description: 'Select existing tags or create new ones. Tags are shared across all items.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Toggle to appear on section pages',
      initialValue: false,
    }),
    orderRankField({ type: 'work' }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Should be unique within the same discipline',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      year: 'year',
      discipline: 'discipline',
      coverImage: 'coverImage',
    },
    prepare({ title, year, discipline, coverImage }) {
      // Get media for preview - prioritize image
      let media = null;
      if (coverImage?.mediaType === 'image' && coverImage.image) {
        media = coverImage.image;
      }
      
      return {
        title: `${title} (${discipline})`,
        subtitle: year ? `${year}` : undefined,
        media,
      }
    },
  },
  orderings: [
    orderRankOrdering,
    {
      title: 'Year, Newest',
      name: 'yearDesc',
      by: [{ field: 'year', direction: 'desc' }],
    },
    {
      title: 'Year, Oldest',
      name: 'yearAsc',
      by: [{ field: 'year', direction: 'asc' }],
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
})
