import { defineType } from 'sanity';

export default defineType({
  name: 'textAside',
  title: 'Text with Aside',
  type: 'object',
  fields: [
    {
      name: 'body',
      title: 'Main Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Blockquote', value: 'blockquote' },
            { title: 'Caption', value: 'caption' },
            { title: 'Small', value: 'small' },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'aside',
      title: 'Aside Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      body: 'body',
      aside: 'aside',
    },
    prepare(selection) {
      const { body, aside } = selection;
      const block = (body || []).find((block: any) => block._type === 'block');
      return {
        title: 'Text with Aside',
        subtitle: block
          ? block.children?.find((child: any) => child._type === 'span')?.text
          : aside,
      };
    },
  },
});