import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'about',
  title: 'About',
  type: 'document',
  fields: [
    defineField({
      name: 'discipline',
      title: 'Discipline',
      type: 'string',
      options: {
        list: [
          { title: 'Art', value: 'art' },
          { title: 'Design', value: 'design' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                    validation: (Rule: any) => Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'cv',
      title: 'CV',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'cvItem',
          title: 'CV Item',
          fields: [
            {
              name: 'year',
              title: 'Year',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'text',
              title: 'Text',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    { title: 'Normal', value: 'normal' },
                  ],
                  marks: {
                    decorators: [
                      { title: 'Strong', value: 'strong' },
                      { title: 'Emphasis', value: 'em' },
                      { title: 'Muted', value: 'muted' },
                    ],
                    annotations: [
                      {
                        name: 'link',
                        type: 'object',
                        title: 'Link',
                        fields: [
                          {
                            name: 'href',
                            type: 'url',
                            title: 'URL',
                            validation: (Rule: any) => Rule.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
              validation: (Rule) => Rule.required(),
            },
          ],
          preview: {
            select: {
              year: 'year',
              text: 'text',
            },
            prepare({ year, text }) {
              const textPreview = text && text[0]?.children?.[0]?.text || '';
              return {
                title: `${year}`,
                subtitle: textPreview.substring(0, 50) + (textPreview.length > 50 ? '...' : ''),
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'services',
      title: 'Services (for Design section)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tag' }] }],
      description: 'Select tags to display as services - only used for design section',
      hidden: ({ document }) => document?.discipline !== 'design',
    }),
    defineField({
      name: 'clients',
      title: 'Clients (for Design section)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'client',
          title: 'Client',
          fields: [
            {
              name: 'name',
              title: 'Client Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'Website URL (optional)',
              type: 'url',
              description: 'Link will open in new tab',
            },
          ],
          preview: {
            select: {
              name: 'name',
              url: 'url',
            },
            prepare({ name, url }) {
              return {
                title: name,
                subtitle: url || 'No link',
              }
            },
          },
        },
      ],
      description: 'List of selected clients - only used for design section',
      hidden: ({ document }) => document?.discipline !== 'design',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'instagramHandle',
      title: 'Instagram Handle',
      type: 'string',
      description: 'Optional Instagram handle (without @ symbol)',
      validation: (Rule) => Rule.custom((value) => {
        if (!value) return true; // Optional field
        // Remove @ if user included it
        const cleanValue = value.replace(/^@/, '');
        // Basic validation for Instagram handle format
        if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanValue)) {
          return 'Instagram handle can only contain letters, numbers, periods, and underscores (max 30 characters)';
        }
        return true;
      }),
    }),
    defineField({
      name: 'gallery',
      title: 'Image Gallery (Art)',
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
            },
          ],
        },
      ],
      description: 'Images for the right side of the Art about page. Different aspect ratios are supported.',
      hidden: ({ document }) => document?.discipline !== 'art',
    }),
    defineField({
      name: 'mediaItem',
      title: 'Media Item (legacy)',
      type: 'mediaItem',
      description: 'Legacy field — use Gallery instead',
      hidden: true,
    }),
  ],
  preview: {
    select: {
      discipline: 'discipline',
      email: 'email',
    },
    prepare({ discipline, email }) {
      return {
        title: `About - ${discipline?.charAt(0).toUpperCase() + discipline?.slice(1)}`,
        subtitle: email,
      }
    },
  },
})