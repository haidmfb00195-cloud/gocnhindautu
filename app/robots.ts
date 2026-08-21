import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/admin/*', '/api/'],
      },
    ],
    sitemap: 'https://dungdautu.com/sitemap.xml',
    host: 'https://dungdautu.com',
  };
}
