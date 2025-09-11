# Tei-ji Portfolio

A minimal, production-grade Next.js + Sanity + Tailwind portfolio site for tei-ji.com.

## Features

- **Two sections**: `/art` (white theme) and `/design` (black theme)
- **URL-driven state**: Tags filtering (`?tags=tag1,tag2`) and lightbox deep linking (`?item=slug:index`)
- **Accessible lightbox**: Keyboard navigation, focus trapping, backdrop close
- **MUX video support**: HTML5 `<video>` with HLS/MP4 fallback
- **Responsive design**: Mobile-first with Tailwind CSS
- **SEO optimized**: OpenGraph, structured metadata, image optimization

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **CMS**: Sanity v3
- **Images**: next/image with LQIP blur placeholders
- **Video**: MUX with HTML5 video (no Mux Player), direct upload from Sanity Studio
- **Deployment**: Vercel

## Quick Start

1. **Clone and install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your Sanity project details:
   - Get your project ID and dataset from [sanity.io/manage](https://sanity.io/manage)
   - Get your MUX credentials from [dashboard.mux.com](https://dashboard.mux.com/) (Settings → Access Tokens)

3. **Set up Sanity CORS**:
   Add these domains to your Sanity project's CORS settings:
   - `http://localhost:3000` (development)
   - Your Vercel domain (production)

4. **Run the development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Run the Sanity Studio**:
   ```bash
   npm run studio
   ```
   
   Access the Sanity Studio at [http://localhost:3333](http://localhost:3333) to manage content.

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## MUX Video Setup

To enable direct video uploads in Sanity Studio:

1. **Get MUX credentials**:
   - Sign up at [mux.com](https://mux.com)
   - Go to [dashboard.mux.com](https://dashboard.mux.com/)
   - Navigate to Settings → Access Tokens
   - Create a new access token with Read and Write permissions

2. **Add credentials to your `.env.local`**:
   ```env
   MUX_TOKEN_ID=your_mux_token_id_here
   MUX_TOKEN_SECRET=your_mux_token_secret_here
   ```

3. **Enable video uploads**:
   - Once credentials are added, restart your Sanity Studio (`npm run studio`)
   - You can now upload videos directly in the Studio
   - Videos will be processed by MUX and playback IDs will be automatically generated

4. **Video rendering**:
   - Videos use HTML5 `<video>` elements (no Mux Player dependency)
   - Supports HLS on Safari/iOS, MP4 fallback on other browsers
   - Includes poster images, captions, and interactive controls

## Content Structure

### Work Document
- **discipline**: "art" | "design"
- **title**: Project title
- **slug**: URL-friendly identifier
- **hero**: Main project image
- **summary**: Brief description
- **content**: Rich content (text, images, videos, custom blocks)
- **gallery**: Array of images for the index grid
- **tags**: Filterable tags
- **featured**: Boost in ordering
- **order**: Manual ordering

### Custom Content Blocks
- **imageRow**: 2-3 images in a row
- **imageBleed**: Full-width image
- **textAside**: Two-column text layout
- **videoMux**: MUX video with HTML5 player

## URL Structure

- `/` → redirects to `/art`
- `/art` → Art section index
- `/design` → Design section index
- `/art/project-slug` → Individual project page
- `/art?tags=painting,sculpture` → Filtered by tags
- `/art?item=project-slug:2` → Lightbox deep link

## Development

### Commands
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
\`\`\`

### Project Structure
\`\`\`
app/
  page.tsx                    # Root redirect to /art
  layout.tsx                  # Root layout
  (site)/
    [section]/                # Art/Design sections
      layout.tsx              # Section layout with theming
      page.tsx                # Index with grid + lightbox
      [slug]/page.tsx         # Individual project pages

components/
  Header.tsx                  # Navigation
  Grid.tsx                    # Index grid with filtering
  Lightbox.tsx                # Accessible lightbox modal
  Prose.tsx                   # Typography wrapper
  RichComponents.tsx          # PortableText renderers

lib/
  sanity.client.ts           # Sanity client configuration
  queries.ts                 # GROQ queries
  image.ts                   # Image URL helpers
  mux.ts                     # MUX video helpers
  utils.ts                   # URL params and utilities

sanity/
  schema.ts                  # Schema definitions and types
  schemas/
    work.ts                  # Main work document
    objects/                 # Custom content blocks
\`\`\`

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Environment Variables for Production
\`\`\`
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
\`\`\`

## MUX Video Setup

1. **Enable MP4 renditions** in your MUX account settings
2. Upload videos and get **playback IDs**
3. Use playback IDs in Sanity's videoMux blocks
4. Videos will automatically use HLS on Safari, MP4 elsewhere

## Customization

### Theming
Colors are controlled via CSS variables in `styles/globals.css`:
- Art section: White background (`--bg: #fff`)
- Design section: Black background (`--bg: #000`)

### Adding Content Types
1. Create schema in `sanity/schemas/`
2. Add to `sanity/schema.ts`
3. Create component in `components/RichComponents.tsx`
4. Update TypeScript types

## Verification Checklist

- [ ] `/` redirects to `/art`
- [ ] Theme switches between art (white) and design (black)
- [ ] Tags filter works with URL sync (`?tags=`)
- [ ] Lightbox opens with deep links (`?item=`)
- [ ] Keyboard navigation works (Esc, arrows)
- [ ] MUX videos play with HTML5 player
- [ ] Mobile responsive design
- [ ] Focus management and accessibility
- [ ] Image optimization with LQIP

## Support

For issues or questions, refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Sanity Documentation](https://www.sanity.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)