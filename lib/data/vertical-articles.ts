import { createStaticClient } from '@/lib/supabase/static';
import type { ArticleVertical } from '@/lib/constants/article-verticals';

const PAGE_SIZE = 10;

export async function getVerticalArticlesPage(vertical: ArticleVertical, page: number) {
  const supabase = createStaticClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('articles')
    .select(
      'id, slug, title, meta_description, cover_image_url, published_at, categories!inner(name, type)',
      { count: 'exact' }
    )
    .eq('status', 'published')
    .eq('categories.type', vertical)
    .order('published_at', { ascending: false })
    .range(from, to);

  return {
    articles: data ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export async function getVerticalArticleBySlug(vertical: ArticleVertical, slug: string) {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('articles')
    .select(
      'id, title, slug, r2_key, meta_description, keywords, cover_image_url, published_at, categories!inner(name, type)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('categories.type', vertical)
    .maybeSingle();
  return data;
}
