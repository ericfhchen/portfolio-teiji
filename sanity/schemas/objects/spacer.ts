import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'height',
      title: 'Height (rem)',
      type: 'number',
      description: 'Spacer height in rem units (1–20)',
      initialValue: 8,
      validation: (Rule) => Rule.required().min(1).max(20),
    }),
  ],
  preview: {
    select: {
      height: 'height',
    },
    prepare({ height }) {
      return {
        title: 'Spacer',
        subtitle: `Height: ${height || 8}rem`,
        media: () => null,
      };
    },
  },
})