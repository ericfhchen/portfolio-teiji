import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageGrid',
  title: 'Image Grid',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'source',
              title: 'Image Source',
              type: 'string',
              options: {
                list: [
                  { title: 'Upload New Image', value: 'upload' },
                  { title: 'Reference Index Item', value: 'reference' },
                ],
                layout: 'radio',
              },
              initialValue: 'upload',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'uploadedImage',
              title: 'Upload Image',
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
              hidden: ({ parent }) => parent?.source !== 'upload',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any;
                return parent?.source === 'upload' && !value
                  ? 'Please upload an image'
                  : true;
              }),
            },
            {
              name: 'indexItemRef',
              title: 'Select Index Item',
              type: 'reference',
              to: [{ type: 'indexItem' }],
              hidden: ({ parent }) => parent?.source !== 'reference',
              validation: (Rule) => Rule.custom((value, context) => {
                const parent = context.parent as any;
                return parent?.source === 'reference' && !value
                  ? 'Please select an index item'
                  : true;
              }),
              options: {
                filter: ({ document }) => {
                  if (document && document.discipline) {
                    return {
                      filter: 'discipline == $discipline',
                      params: { discipline: document.discipline }
                    };
                  }
                  return {};
                },
              },
            },
            {
              name: 'colSpan',
              title: 'Column Span',
              type: 'number',
              description: 'Number of columns this image spans (1–4)',
              initialValue: 1,
              validation: (Rule) => Rule.min(1).max(4),
            },
          ],
          preview: {
            select: {
              source: 'source',
              uploadedImage: 'uploadedImage',
              indexItem: 'indexItemRef.title',
              indexItemImage: 'indexItemRef.image',
              colSpan: 'colSpan',
            },
            prepare({ source, uploadedImage, indexItem, indexItemImage, colSpan }) {
              const spanLabel = colSpan && colSpan > 1 ? ` (span ${colSpan})` : '';
              if (source === 'reference' && indexItem) {
                return {
                  title: `Referenced: ${indexItem}${spanLabel}`,
                  media: indexItemImage,
                };
              } else if (source === 'upload') {
                return {
                  title: `Uploaded Image${spanLabel}`,
                  media: uploadedImage,
                };
              }
              return {
                title: `Image${spanLabel}`,
                media: uploadedImage || indexItemImage,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(12),
    }),

    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      description: 'Number of grid columns (2–4)',
      initialValue: 2,
      validation: (Rule) => Rule.required().min(2).max(4),
    }),

    defineField({
      name: 'gap',
      title: 'Gap',
      type: 'string',
      options: {
        list: [
          { title: 'Small (1rem)', value: 'small' },
          { title: 'Medium (2rem)', value: 'medium' },
          { title: 'Large (4rem)', value: 'large' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'medium',
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
      description: 'Enter a custom width between 20 and 100',
      validation: (Rule) => Rule.min(20).max(100),
      hidden: ({ parent }) => parent?.width !== 'custom',
    }),

    defineField({
      name: 'alignment',
      title: 'Alignment',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
    }),

    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the grid',
    }),

    defineField({
      name: 'captionPosition',
      title: 'Caption Position',
      type: 'string',
      options: {
        list: [
          { title: 'Left', value: 'left' },
          { title: 'Center', value: 'center' },
          { title: 'Right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'center',
      hidden: ({ parent }) => !parent?.caption,
    }),
  ],
  preview: {
    select: {
      image1Upload: 'images.0.uploadedImage',
      image1IndexImage: 'images.0.indexItemRef.image',
      image1Source: 'images.0.source',
      columns: 'columns',
      caption: 'caption',
    },
    prepare({ image1Upload, image1IndexImage, image1Source, columns, caption }) {
      const previewImage = image1Source === 'reference' ? image1IndexImage : image1Upload;

      return {
        title: `Image Grid (${columns || 2} columns)`,
        subtitle: caption || 'Grid layout',
        media: previewImage,
      };
    },
  },
})