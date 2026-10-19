import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.APP_URL || 'https://bahiapp.local';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/llm.txt', '/llms.txt', '/manifest.webmanifest'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
