import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import { updateArticleAction } from '@/lib/actions/articles';

export const metadata: Metadata = { title: 'Chỉnh sửa bài viết | Admin' };

interface Props {
  params: { id: string };
}

async function getArticleForEdit(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, meta_description, r2_key, category_id, categories(id, name)')
    .eq('id', id)
    .single();
  return data;
}

async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'kien-thuc')
    .order('name');
  return data ?? [];
}

export default async function EditArticlePage({ params }: Props) {
  const [article, categories] = await Promise.all([
    getArticleForEdit(params.id),
    getCategories(),
  ]);

  if (!article) notFound();

  // Load current HTML content from R2 for editing
  let currentHtml = '';
  try {
    currentHtml = await getFromR2(article.r2_key);
  } catch (err) {
    console.error('[EditArticle] Cannot load R2 content:', err);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/kien-thuc" className="text-sm text-gray-400 hover:text-white">← Danh sách bài viết</a>
        <h1 className="text-2xl font-bold text-white mt-2">Chỉnh sửa bài viết</h1>
      </div>

      <form action={updateArticleAction as any} className="space-y-6">
        <input type="hidden" name="id" value={article.id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-300 mb-1">Tiêu đề</label>
            <input
              id="edit-title"
              name="title"
              type="text"
              required
              defaultValue={article.title}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
            <input
              id="edit-slug"
              name="slug"
              type="text"
              required
              defaultValue={article.slug}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-category" className="block text-sm font-medium text-gray-300 mb-1">Danh mục</label>
            <select
              id="edit-category"
              name="category_id"
              defaultValue={article.category_id ?? ''}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
            <select
              id="edit-status"
              name="status"
              defaultValue={article.status}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-meta" className="block text-sm font-medium text-gray-300 mb-1">Meta Description</label>
          <input
            id="edit-meta"
            name="meta_description"
            type="text"
            maxLength={160}
            defaultValue={article.meta_description ?? ''}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung HTML
            <span className="text-xs text-gray-500 ml-2">(HTML sẽ được sanitize tự động)</span>
          </label>
          <textarea
            id="edit-content"
            name="content_html"
            rows={20}
            defaultValue={currentHtml}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="article-update"
            type="submit"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Lưu thay đổi
          </button>
          <a
            href="/admin/kien-thuc"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Hủy
          </a>
        </div>
      </form>
    </div>
  );
}
