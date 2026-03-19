import { MetadataRoute } from 'next';
import { getAllRecipeSitemapEntries, getAllDishSitemapEntries } from '@/services/supabaseService';
import { serverEnv } from '@/env/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = serverEnv.siteUrl;
  const [recipes, dishes] = await Promise.all([
    getAllRecipeSitemapEntries().catch(() => []),
    getAllDishSitemapEntries().catch(() => []),
  ]);

  const recipeUrls: MetadataRoute.Sitemap = recipes.map((r) => ({
    url: `${siteUrl}/recipe/${r.videoId}`,
    lastModified: new Date(r.createdAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const dishUrls: MetadataRoute.Sitemap = dishes.map((d) => ({
    url: `${siteUrl}/dish/${encodeURIComponent(d.dishName)}`,
    lastModified: new Date(d.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    ...dishUrls,
    ...recipeUrls,
  ];
}
