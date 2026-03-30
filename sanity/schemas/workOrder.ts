import { defineType, defineField, defineArrayMember } from 'sanity'

export default defineType({
  name: 'workOrder',
  title: 'Work Order',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: 'Work Order',
    }),
    defineField({
      name: 'items',
      title: 'Work Items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'work' }],
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Work Order' }
    },
  },
})
