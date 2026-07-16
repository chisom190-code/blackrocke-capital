import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://blackrockecapital.com';
  const lastModified = new Date();

  const staticRoutes = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/plans', priority: 0.9, changeFrequency: 'weekly' as const },
    { url: '/services', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { url: '/auth/login', priority: 0.6, changeFrequency: 'yearly' as const },
    { url: '/auth/register', priority: 0.6, changeFrequency: 'yearly' as const },
  ];

  return staticRoutes.map(route => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
