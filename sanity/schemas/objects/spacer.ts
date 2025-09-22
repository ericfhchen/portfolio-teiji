import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'spacer',
  title: 'Spacer',
  type: 'object',
  fields: [
    defineField({
      name: 'height',
      title: 'Height',
      type: 'string',
      options: {
        list: [
          { title: '8rem', value: '8rem' },
        ],
        layout: 'dropdown',
      },
      initialValue: '8rem',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Spacer',
        subtitle: 'Height: 8rem',
        media: () => '↕️',
      };
    },
  },
})