/**
 * Migrate about.mediaItem (single image) to about.gallery (array of images).
 * Only migrates Art about pages with an image mediaItem.
 *
 * Usage:
 *   node scripts/migrate-about-gallery.mjs          # dry run
 *   node scripts/migrate-about-gallery.mjs --write   # actually write
 */

import { createClient } from '@sanity/client';
import { randomUUID } from 'crypto';

const client = createClient({
  projectId: 'ch7h72uf',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
});

const dryRun = !process.argv.includes('--write');

if (dryRun) {
  console.log('🔍 DRY RUN — pass --write to actually migrate\n');
}

const abouts = await client.fetch(
  `*[_type == "about" && discipline == "art" && defined(mediaItem.image)] { _id, discipline, mediaItem }`
);

console.log(`Found ${abouts.length} art about page(s) with a mediaItem image.\n`);

for (const about of abouts) {
  const imageRef = about.mediaItem.image;

  const galleryImage = {
    _type: 'image',
    _key: randomUUID().slice(0, 12),
    asset: imageRef.asset,
  };

  console.log(`About Art (${about._id})`);
  console.log(`  Image ref: ${imageRef.asset._ref}`);
  console.log(`  → Moving to gallery[0]\n`);

  if (!dryRun) {
    await client
      .patch(about._id)
      .set({ gallery: [galleryImage] })
      .commit();
    console.log(`  ✓ migrated\n`);
  }
}

if (dryRun) {
  console.log('Done (dry run). Run with --write to apply.');
} else {
  console.log('Done! mediaItem image migrated to gallery.');
}
