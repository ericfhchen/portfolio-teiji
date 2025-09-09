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
          { title: 'Small (2rem)', value: 'small' },
          { title: 'Medium (4rem)', value: 'medium' },
          { title: 'Large (6rem)', value: 'large' },
          { title: 'Extra Large (8rem)', value: 'xl' },
          { title: 'Custom', value: 'custom' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'medium',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'customHeight',
      title: 'Custom Height (in rem)',
      type: 'number',
      description: 'Enter custom height in rem units (e.g., 3.5 for 3.5rem)',
      hidden: ({ parent }) => parent?.height !== 'custom',
      validation: (Rule) => 
        Rule.custom((customHeight, context) => {
          const parent = context?.parent as { height?: string };
          if (parent?.height === 'custom' && (!customHeight || customHeight <= 0)) {
            return 'Custom height is required and must be greater than 0';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      height: 'height',
      customHeight: 'customHeight',
    },
    prepare({ height, customHeight }) {
      const heightMap = {
        small: '2rem',
        medium: '4rem', 
        large: '6rem',
        xl: '8rem',
        custom: customHeight ? `${customHeight}rem` : '?rem',
      };
      
      return {
        title: 'Spacer',
        subtitle: `Height: ${heightMap[height as keyof typeof heightMap] || height}`,
        media: () => '↕️',
      };
    },
  },
})