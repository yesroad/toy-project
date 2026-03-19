import { MetadataRoute } from 'next';
import { getAllRecipeSitemapEntries } from '@/services/supabaseService';
import { serverEnv } from '@/env/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = serverEnv.siteUrl;
  const recipes = await getAllRecipeSitemapEntries().catch(() => []);

  const recipeUrls: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${siteUrl}/recipe/${r.videoId}`,
    lastModified: new Date(r.createdAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...recipeUrls,
  ];
}
