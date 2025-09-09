import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'imageDual',
  title: 'Dual Images (Side by Side)',
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
                  // Only show index items from the same discipline as the current work
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
          ],
          preview: {
            select: {
              source: 'source',
              uploadedImage: 'uploadedImage',
              indexItem: 'indexItemRef.title',
              indexItemImage: 'indexItemRef.image',
            },
            prepare({ source, uploadedImage, indexItem, indexItemImage }) {
              if (source === 'reference' && indexItem) {
                return {
                  title: `Referenced: ${indexItem}`,
                  media: indexItemImage,
                };
              } else if (source === 'upload') {
                return {
                  title: 'Uploaded Image',
                  media: uploadedImage,
                };
              }
              return {
                title: 'Image',
                media: uploadedImage || indexItemImage,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(2).max(2).error('Must have exactly 2 images'),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the images',
    }),
  ],
  preview: {
    select: {
      image1Source: 'images.0.source',
      image1Upload: 'images.0.uploadedImage',
      image1IndexItem: 'images.0.indexItemRef.title',
      image1IndexImage: 'images.0.indexItemRef.image',
      image2Source: 'images.1.source',
      image2Upload: 'images.1.uploadedImage',
      image2IndexItem: 'images.1.indexItemRef.title',
      image2IndexImage: 'images.1.indexItemRef.image',
      caption: 'caption',
    },
    prepare({ 
      image1Source, 
      image1Upload, 
      image1IndexItem, 
      image1IndexImage,
      image2Source,
      image2Upload,
      image2IndexItem,
      image2IndexImage,
      caption 
    }) {
      // Get the first image for preview
      let previewImage = image1Upload;
      let subtitle = caption || 'Side by side layout';
      
      if (image1Source === 'reference' && image1IndexImage) {
        previewImage = image1IndexImage;
        if (image1IndexItem && image2IndexItem) {
          subtitle = `${image1IndexItem} + ${image2IndexItem}`;
        } else if (image1IndexItem) {
          subtitle = `Referenced: ${image1IndexItem} + 1 more`;
        }
      } else if (image1Source === 'upload' && image2Source === 'reference' && image2IndexItem) {
        subtitle = `1 uploaded + Referenced: ${image2IndexItem}`;
      }
      
      return {
        title: 'Dual Images (60% width)',
        subtitle,
        media: previewImage,
      }
    },
  },
})