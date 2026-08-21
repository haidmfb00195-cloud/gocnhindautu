import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createArticleAction } from '@/lib/actions/articles';

export const metadata: Metadata = { title: 'Tạo bài viết mới | Admin' };

async function getCategories() {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('type', 'kien-thuc')
    .order('name');
  return data ?? [];
}

export default async function NewArticlePage() {
  const categories = await getCategories();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/kien-thuc" className="text-sm text-gray-400 hover:text-white">← Danh sách bài viết</a>
        <h1 className="text-2xl font-bold text-white mt-2">Tạo bài viết mới</h1>
      </div>

      <form action={createArticleAction as any} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="article-title" className="block text-sm font-medium text-gray-300 mb-1">
              Tiêu đề <span className="text-red-400">*</span>
            </label>
            <input
              id="article-title"
              name="title"
              type="text"
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Tiêu đề bài viết"
            />
          </div>
          <div>
            <label htmlFor="article-slug" className="block text-sm font-medium text-gray-300 mb-1">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              id="article-slug"
              name="slug"
              type="text"
              required
              pattern="[a-z0-9-]+"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="ten-bai-viet"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="article-category" className="block text-sm font-medium text-gray-300 mb-1">
              Danh mục
            </label>
            <select
              id="article-category"
              name="category_id"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="article-status" className="block text-sm font-medium text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              id="article-status"
              name="status"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản ngay</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="article-meta" className="block text-sm font-medium text-gray-300 mb-1">
            Meta Description
          </label>
          <input
            id="article-meta"
            name="meta_description"
            type="text"
            maxLength={160}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Mô tả ngắn (tối đa 160 ký tự) — dùng cho SEO"
          />
        </div>

        <div>
          <label htmlFor="article-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung HTML <span className="text-red-400">*</span>
            <span className="text-xs text-gray-500 ml-2">(HTML sẽ được sanitize tự động trước khi lưu)</span>
          </label>
          <textarea
            id="article-content"
            name="content_html"
            rows={20}
            required
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
            placeholder="<h2>Tiêu đề</h2>&#10;<p>Nội dung bài viết...</p>"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="article-save"
            type="submit"
            name="status"
            value="draft"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Lưu nháp
          </button>
          <button
            id="article-publish"
            type="submit"
            name="status"
            value="published"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Xuất bản
          </button>
        </div>
      </form>
    </div>
  );
}
