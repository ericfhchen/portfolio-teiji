import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { schema } from './sanity/schema';
import { deskStructure } from './sanity/deskStructure';
import { projectId, dataset } from './sanity/env';

export default defineConfig({
  name: 'tei-ji-portfolio',
  title: 'Tei-ji Portfolio',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: deskStructure,
    }),
    visionTool(),
  ],
  schema,
});