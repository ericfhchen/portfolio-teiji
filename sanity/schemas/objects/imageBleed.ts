import { defineType } from 'sanity';

export default defineType({
  name: 'imageBleed',
  title: 'Image Bleed',
  type: 'object',
  fields: [
    {
      name: 'image',
      title: 'Image',
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
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      media: 'image',
    },
    prepare(selection) {
      const { media } = selection;
      return {
        title: 'Image Bleed',
        media,
      };
    },
  },
});