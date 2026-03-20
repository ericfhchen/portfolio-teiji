import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'projectImage',
  title: 'Project Image',
  type: 'object',
  fields: [
    defineField({
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
    }),

    // Direct upload option
    defineField({
      name: 'uploadedImage',
      title: 'Upload Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [],
      hidden: ({ parent }) => parent?.source !== 'upload',
      validation: (Rule) => Rule.custom((value, context) => {
        const parent = context.parent as any;
        return parent?.source === 'upload' && !value
          ? 'Please upload an image'
          : true;
      }),
    }),

    // Reference to Index Item
    defineField({
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
      description: 'Optional caption to display below the image',
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
      source: 'source',
      uploadedMedia: 'uploadedImage',
      indexItem: 'indexItemRef.title',
      indexItemMedia: 'indexItemRef.image',
      width: 'width',
      customWidth: 'customWidth',
      caption: 'caption',
    },
    prepare({ source, uploadedMedia, indexItem, indexItemMedia, width, customWidth, caption }) {
      const widthLabel = width === 'custom' && customWidth ? `${customWidth}%` : (width || '100%');

      let title = 'Project Image';
      let media = uploadedMedia;

      if (source === 'reference' && indexItem) {
        title = `Referenced: ${indexItem}`;
        media = indexItemMedia;
      } else if (source === 'upload') {
        title = caption || 'Uploaded Image';
      }

      return {
        title,
        subtitle: `Width: ${widthLabel}`,
        media,
      };
    },
  },
});