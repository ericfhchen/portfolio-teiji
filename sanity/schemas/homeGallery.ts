import { defineType, defineField, defineArrayMember } from 'sanity'

export default defineType({
  name: 'homeGallery',
  title: 'Home Gallery',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: 'Home Gallery',
    }),
    defineField({
      name: 'items',
      title: 'Gallery Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'homeGalleryItem',
          title: 'Gallery Item',
          fields: [
            defineField({
              name: 'work',
              title: 'Work',
              type: 'reference',
              to: [{ type: 'work' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'overrideMedia',
              title: 'Override Media',
              type: 'object',
              description: 'Optional: override the featured image for this gallery slide',
              fields: [
                defineField({
                  name: 'mediaType',
                  title: 'Media Type',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Image', value: 'image' },
                      { title: 'Video', value: 'video' },
                    ],
                    layout: 'radio',
                  },
                }),
                defineField({
                  name: 'image',
                  title: 'Image',
                  type: 'image',
                  options: { hotspot: true },
                  hidden: ({ parent }) => parent?.mediaType !== 'image',
                }),
                defineField({
                  name: 'video',
                  title: 'Video',
                  type: 'videoMux',
                  hidden: ({ parent }) => parent?.mediaType !== 'video',
                }),
              ],
            }),
            defineField({
              name: 'overrideHoverTextTop',
              title: 'Override Hover Text 1 (above line)',
              type: 'string',
              description: 'Optional: override the hover text shown above the horizontal line',
            }),
            defineField({
              name: 'overrideHoverTextBottom',
              title: 'Override Hover Text 2 (below line)',
              type: 'string',
              description: 'Optional: override the hover text shown below the horizontal line (italic)',
            }),
          ],
          preview: {
            select: {
              title: 'work.title',
              year: 'work.year',
              coverImage: 'work.coverImage.image',
              overrideImage: 'overrideMedia.image',
              overrideTop: 'overrideHoverTextTop',
            },
            prepare({ title, year, coverImage, overrideImage, overrideTop }) {
              const subtitle = [year, overrideTop].filter(Boolean).join(' — ');
              return {
                title: title || 'No work selected',
                subtitle: subtitle || undefined,
                media: overrideImage || coverImage,
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Gallery' }
    },
  },
})
