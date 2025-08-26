import { defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      description: 'The main title of your website (appears in browser tabs and search results)',
      validation: (Rule) => Rule.required().max(60).warning('Keep it under 60 characters for optimal SEO'),
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      description: 'A brief description of your website (appears in search results and social media)',
      validation: (Rule) => Rule.required().max(160).warning('Keep it under 160 characters for optimal SEO'),
    },
    {
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords that describe your website content (for SEO)',
      options: {
        layout: 'tags',
      },
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
      description: 'Upload a square image (32x32px recommended) for your site favicon',
      options: {
        accept: '.ico,.png,.svg',
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility',
        },
      ],
    },
    {
      name: 'ogImage',
      title: 'Social Media Image',
      type: 'image',
      description: 'Default image for social media sharing (1200x630px recommended)',
      options: {
        accept: '.jpg,.jpeg,.png,.webp',
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Alternative text for accessibility',
        },
      ],
    },
    {
      name: 'themeColors',
      title: 'Theme Colors',
      type: 'object',
      description: 'Theme colors for different sections',
      fields: [
        {
          name: 'art',
          title: 'Art Section Theme Color',
          type: 'string',
          description: 'Hex color for art section (default: #ffffff)',
          initialValue: '#ffffff',
          validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/).error('Please enter a valid hex color (e.g., #ffffff)'),
        },
        {
          name: 'design',
          title: 'Design Section Theme Color',
          type: 'string',
          description: 'Hex color for design section (default: #000000)',
          initialValue: '#000000',
          validation: (Rule) => Rule.regex(/^#[0-9A-Fa-f]{6}$/).error('Please enter a valid hex color (e.g., #000000)'),
        },
      ],
    },
    {
      name: 'seo',
      title: 'Advanced SEO',
      type: 'object',
      description: 'Additional SEO settings',
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        {
          name: 'author',
          title: 'Author',
          type: 'string',
          description: 'Your name or company name',
        },
        {
          name: 'twitterHandle',
          title: 'Twitter Handle',
          type: 'string',
          description: 'Your Twitter username (without @)',
          validation: (Rule) => Rule.regex(/^[A-Za-z0-9_]+$/).warning('Enter username without @ symbol'),
        },
        {
          name: 'siteUrl',
          title: 'Site URL',
          type: 'url',
          description: 'Your website URL (e.g., https://tei-ji.com)',
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
    prepare({ title, subtitle }) {
      return {
        title: title || 'Site Settings',
        subtitle: subtitle || 'Configure your website metadata',
      }
    },
  },
})