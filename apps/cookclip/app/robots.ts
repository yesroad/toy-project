import { MetadataRoute } from 'next';
import { serverEnv } from '@/env/server';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/'],
    },
    sitemap: `${serverEnv.siteUrl}/sitemap.xml`,
  };
}
