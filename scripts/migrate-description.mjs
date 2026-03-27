/**
 * Migrate work.description from plain text (string) to portable text (array of blocks).
 *
 * Usage:
 *   node scripts/migrate-description.mjs          # dry run (preview changes)
 *   node scripts/migrate-description.mjs --write   # actually write to Sanity
 */

import { createClient } from '@sanity/client';
import { randomUUID } from 'crypto';

const client = createClient({
  projectId: 'ch7h72uf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN, // needs write access
});

const dryRun = !process.argv.includes('--write');

if (dryRun) {
  console.log('🔍 DRY RUN — pass --write to actually migrate\n');
}

// Fetch all work documents that have a string description
const works = await client.fetch(
  `*[_type == "work" && defined(description) && description match "*"] { _id, title, description }`
);

console.log(`Found ${works.length} work(s) with plain text descriptions.\n`);

for (const work of works) {
  const plainText = work.description;

  // Convert plain text to portable text blocks (split by double newline for paragraphs)
  const paragraphs = plainText.split(/\n\n+/).filter((p) => p.trim());
  const blocks = paragraphs.map((text) => ({
    _type: 'block',
    _key: randomUUID().slice(0, 12),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: randomUUID().slice(0, 12),
        text: text.trim(),
        marks: [],
      },
    ],
  }));

  console.log(`${work.title} (${work._id})`);
  console.log(`  "${plainText.slice(0, 80)}${plainText.length > 80 ? '...' : ''}"`);
  console.log(`  → ${blocks.length} block(s)\n`);

  if (!dryRun) {
    await client
      .patch(work._id)
      .set({ description: blocks })
      .commit();
    console.log(`  ✓ migrated\n`);
  }
}

if (dryRun) {
  console.log('Done (dry run). Run with --write to apply changes.');
} else {
  console.log('Done! All descriptions migrated to rich text.');
}
