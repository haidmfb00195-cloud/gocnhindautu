import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createStaticClient as createClient } from '@/lib/supabase/static';

export const dynamic = 'force-static';

interface Props {
  params: { category: string };
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('slug')
    .eq('type', 'kien-thuc');
  return (data ?? []).map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('name, slug')
    .eq('slug', params.category)
    .eq('type', 'kien-thuc')
    .single();

  if (!category) return { title: 'Danh mục không tồn tại' };

  return {
    title: `Kiến thức ${category.name}`,
    description: `Tổng hợp bài viết về ${category.name} — phân tích và hướng dẫn chi tiết.`,
  };
}

async function getCategoryWithArticles(slug: string) {
  const supabase = createClient();
  const { data: category } = await supabase
    .from('categories')
    .select('id, slug, name')
    .eq('slug', slug)
    .eq('type', 'kien-thuc')
    .single();

  if (!category) return null;

  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, cover_image_url, published_at')
    .eq('category_id', category.id)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return { category, articles: articles ?? [] };
}

export default async function KienThucCategoryPage({ params }: Props) {
  const result = await getCategoryWithArticles(params.category);
  if (!result) notFound();

  const { category, articles } = result;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/kien-thuc" className="hover:text-white">Kiến thức</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{category.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-white mb-2">{category.name}</h1>
      <p className="text-gray-400 mb-10">{articles.length} bài viết</p>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Chưa có bài viết nào trong danh mục này.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/kien-thuc/${params.category}/${article.slug}`}
              className="group block overflow-hidden rounded-xl border border-gray-800 bg-gray-900 hover:border-emerald-500/50 transition-colors"
            >
              <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-gray-800 to-gray-900">
                {article.cover_image_url && (
                  <Image
                    src={article.cover_image_url}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                )}
              </div>
              <div className="p-6">
                <h2 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                {article.meta_description && (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-3">{article.meta_description}</p>
                )}
                {article.published_at && (
                  <p className="mt-4 text-xs text-gray-600">
                    {new Date(article.published_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
