 import { defineType, defineField } from 'sanity'
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'

export default defineType({
  name: 'indexItem',
  title: 'Index Item',
  type: 'document',
  fields: [
    defineField({
      name: 'featuredMedia',
      title: 'Featured Media',
      type: 'mediaItem',
      description: 'Main image or video for this index item',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'medium',
      title: 'Medium',
      type: 'string',
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
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
      description: 'Additional images and videos that will appear in the lightbox gallery for this item',
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
    orderRankField({ type: 'indexItem' }),
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
      tags: 'tags',
      featuredMedia: 'featuredMedia',
    },
    prepare({ title, year, discipline, tags, featuredMedia }) {
      // Get media for preview - prioritize image, fall back to video poster
      let media = null;
      if (featuredMedia?.mediaType === 'image' && featuredMedia.image) {
        media = featuredMedia.image;
      } else if (featuredMedia?.mediaType === 'video' && featuredMedia.video?.poster) {
        media = featuredMedia.video.poster;
      }
      
      const yearText = year ? `${year}` : '';
      const tagsText = tags && tags.length > 0 ? ` • ${tags.length} tag${tags.length === 1 ? '' : 's'}` : '';
      return {
        title: `${title} (${discipline})`,
        subtitle: `${yearText}${tagsText}`,
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