import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';

import { schema } from './sanity/schema';
import { deskStructure } from './sanity/deskStructure';
import { projectId, dataset } from './sanity/env';

export default defineConfig({
  name: 'teiji-portfolio',
  title: 'Teiji Portfolio',
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