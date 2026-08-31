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
    sitemap: 'https://www.gocnhindautu.com/sitemap.xml',
    host: 'https://www.gocnhindautu.com',
  };
}
