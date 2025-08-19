import { defineType } from 'sanity';

export default defineType({
  name: 'imageRow',
  title: 'Image Row',
  type: 'object',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule) => Rule.min(2).max(3),
    },
  ],
  preview: {
    select: {
      images: 'images',
    },
    prepare(selection) {
      const { images } = selection;
      return {
        title: `Image Row (${images?.length || 0} images)`,
      };
    },
  },
});