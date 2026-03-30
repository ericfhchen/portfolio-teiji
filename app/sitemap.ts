import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity.client';
import { workSlugParamsQuery, siteSettingsQuery } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, works] = await Promise.all([
    client.fetch(siteSettingsQuery),
    client.fetch<{ section: string; slug: string }[]>(workSlugParamsQuery),
  ]);

  const baseUrl = settings?.seo?.siteUrl?.replace(/\/$/, '') || 'https://tei-ji.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/art`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/design`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/art/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/design/work`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/art/index`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/design/index`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/art/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/design/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const workRoutes: MetadataRoute.Sitemap = works.map((work) => ({
    url: `${baseUrl}/${work.section}/${work.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...workRoutes];
}
