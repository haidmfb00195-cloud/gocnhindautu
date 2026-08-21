import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Kiến thức Trading',
  description: 'Tổng hợp kiến thức trading từ cơ bản đến nâng cao: phân tích kỹ thuật, quản lý vốn, tâm lý giao dịch.',
};

async function getArticlesGroupedByCategory() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, published_at, category_id, categories(slug, name)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return data ?? [];
}

export default async function KienThucPage() {
  const articles = await getArticlesGroupedByCategory();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Kiến thức Trading</h1>
      <p className="text-gray-400 mb-10">Từ cơ bản đến nâng cao — phân tích kỹ thuật, quản lý vốn, tâm lý giao dịch.</p>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Chưa có bài viết nào được xuất bản.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article: any) => (
            <Link
              key={article.id}
              href={`/kien-thuc/${article.categories?.slug ?? 'chung'}/${article.slug}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-emerald-500/50 transition-colors"
            >
              {article.categories?.name && (
                <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                  {article.categories.name}
                </span>
              )}
              <h2 className="mt-2 font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-2">
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
