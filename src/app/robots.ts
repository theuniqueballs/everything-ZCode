import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

/** force-static — обязателен для output: 'export' (GitHub Pages build). */
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
