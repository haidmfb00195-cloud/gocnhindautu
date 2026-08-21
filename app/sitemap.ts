import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE_URL = 'https://dungdautu.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();

  // Fetch published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('slug, updated_at, categories(slug)')
    .eq('status', 'published');

  // Fetch published brokers
  const { data: brokers } = await supabase
    .from('brokers')
    .select('slug, updated_at')
    .eq('status', 'published');

  // Fetch published comparisons
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('slug, updated_at')
    .eq('status', 'published');

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/kien-thuc`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/danh-gia-san`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/khoa-hoc`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/cong-cu/pip-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cong-cu/lot-calculator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/cong-cu/risk-reward`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/ve-chung-toi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/lien-he`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((article: any) => ({
    url: `${BASE_URL}/kien-thuc/${article.categories?.slug ?? 'chung'}/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const brokerPages: MetadataRoute.Sitemap = (brokers ?? []).map((broker) => ({
    url: `${BASE_URL}/danh-gia-san/${broker.slug}`,
    lastModified: new Date(broker.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const comparisonPages: MetadataRoute.Sitemap = (comparisons ?? []).map((c) => ({
    url: `${BASE_URL}/so-sanh/${c.slug}`,
    lastModified: new Date(c.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...brokerPages, ...comparisonPages];
}
