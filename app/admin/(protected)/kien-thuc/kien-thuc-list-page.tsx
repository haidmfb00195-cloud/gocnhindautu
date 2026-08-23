import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteArticleAction } from '@/lib/actions/articles';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata: Metadata = { title: 'Quản lý bài viết | Admin' };

async function getArticles() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, published_at, updated_at, categories(name)')
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export default async function AdminArticlesPage() {
  const articles = await getArticles();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Bài viết</h1>
        <Link
          href="/admin/kien-thuc/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
        >
          + Tạo mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {articles.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Chưa có bài viết nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tiêu đề</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Danh mục</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Cập nhật</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {articles.map((article: any) => (
                <tr key={article.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium line-clamp-1">{article.title}</span>
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
                    {new Date(article.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/kien-thuc/${article.id}`}
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
    </div>
  );
}
