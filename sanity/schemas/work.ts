import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default defineType({
  name: 'work',
  title: 'Work',
  type: 'document',
  fields: [
    defineField({
      name: 'featuredImage',
      title: 'Featured Media',
      type: 'mediaItem',
      description: 'Featured image or video for this work',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Media',
      type: 'mediaItem',
      description: 'Cover image or video for this work',
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
          type: 'imageLayout',
          title: 'Image with Layout',
        },
        {
          type: 'imageDual',
          title: 'Dual Images (Side by Side)',
        },
        {
          type: 'imageRow',
          title: 'Image Row (2-3 images)',
        },
        {
          type: 'imageBleed',
          title: 'Full Bleed Image',
        },
        {
          type: 'textAside',
          title: 'Text with Aside',
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
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'mediaItem',
        },
      ],
      description: 'Images and videos that will appear in the index feed for this work',
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
      featuredImage: 'featuredImage',
    },
    prepare({ title, year, discipline, featuredImage }) {
      // Get media for preview - prioritize image, fall back to video poster
      let media = null;
      if (featuredImage?.mediaType === 'image' && featuredImage.image) {
        media = featuredImage.image;
      } else if (featuredImage?.mediaType === 'video' && featuredImage.video?.poster) {
        media = featuredImage.video.poster;
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
