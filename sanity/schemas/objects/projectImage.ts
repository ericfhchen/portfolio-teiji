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
    }),
    
    // Layout options (consistent with your existing imageLayout)
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full Width (100%)', value: 'full' },
          { title: 'Medium Width (60%)', value: 'medium' },
          { title: 'Small Width (40%)', value: 'small' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the image',
    }),
  ],
  
  preview: {
    select: {
      source: 'source',
      uploadedMedia: 'uploadedImage',
      indexItem: 'indexItemRef.title',
      indexItemMedia: 'indexItemRef.image',
      layout: 'layout',
      caption: 'caption',
    },
    prepare({ source, uploadedMedia, indexItem, indexItemMedia, layout, caption }) {
      const layoutLabels = {
        full: 'Full Width',
        medium: '60% Width',  
        small: '40% Width',
      };
      
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
        subtitle: layoutLabels[layout as keyof typeof layoutLabels] || layout,
        media,
      };
    },
  },
}); 