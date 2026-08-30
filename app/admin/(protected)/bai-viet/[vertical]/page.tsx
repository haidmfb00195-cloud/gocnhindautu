import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteArticleAction } from '@/lib/actions/articles';
import DeleteButton from '@/components/admin/DeleteButton';
import PinHomeButton from '@/components/admin/PinHomeButton';
import {
  isArticleVertical,
  getVerticalLabel,
  type ArticleVertical,
} from '@/lib/constants/article-verticals';

const PAGE_SIZE = 10;

interface Props {
  params: { vertical: string };
  searchParams: { page?: string };
}

async function getArticlesByVertical(vertical: ArticleVertical, page: number) {
  const supabase = createClient();
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from('articles')
    .select('id, title, slug, status, published_at, created_at, is_pinned_home, is_featured, categories!inner(name, slug, type)', { count: 'exact' })
    .eq('categories.type', vertical)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  return {
    articles: data ?? [],
    totalPages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)),
  };
}

export async function generateMetadata({ params }: Props) {
  if (!isArticleVertical(params.vertical)) return { title: 'Bài viết | Admin' };
  return { title: `Bài viết — ${getVerticalLabel(params.vertical)} | Admin` };
}

export default async function VerticalArticlesPage({ params, searchParams }: Props) {
  if (!isArticleVertical(params.vertical)) notFound();

  const vertical = params.vertical;
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const { articles, totalPages } = await getArticlesByVertical(vertical, currentPage);
  const label = getVerticalLabel(vertical);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Bài viết — {label}</h1>
        <Link
          href={`/admin/bai-viet/${vertical}/new`}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
        >
          + Tạo mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {articles.length === 0 ? (
          <p className="p-8 text-center text-gray-500">
            {currentPage > 1 ? 'Không còn bài viết ở trang này.' : 'Chưa có bài viết nào trong chuyên mục này.'}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Danh mục</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Xuất bản</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-medium line-clamp-1">{article.title}</span>
                      {article.is_pinned_home && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400 shrink-0">
                          Đang ở đầu trang chủ
                        </span>
                      )}
                      {article.is_featured && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 shrink-0">
                          Nổi bật
                        </span>
                      )}
                    </div>
                    <span className="text-gray-500 text-xs block">{article.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {article.categories?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      article.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {article.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString('vi-VN')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <PinHomeButton articleId={article.id} isPinned={article.is_pinned_home} />
                      <Link
                        href={`/admin/bai-viet/edit/${article.id}`}
                        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Sửa
                      </Link>
                      <DeleteButton
                        action={deleteArticleAction.bind(null, article.id) as any}
                        confirmMessage={`Xóa bài "${article.title}"?`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/bai-viet/${vertical}?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? 'bg-emerald-500 text-black'
                  : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-500'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
