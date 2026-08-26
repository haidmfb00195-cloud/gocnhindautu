import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import { updateArticleAction } from '@/lib/actions/articles';
import QuillEditor from '@/components/admin/QuillEditor';
import CoverImageInput from '@/components/admin/CoverImageInput';
import {
  isArticleVertical,
  getVerticalLabel,
  type ArticleVertical,
} from '@/lib/constants/article-verticals';

interface Props {
  params: { id: string };
}

async function getArticleForEdit(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, status, meta_description, keywords, cover_image_url, r2_key, category_id, is_featured, categories(id, name, slug, type)')
    .eq('id', id)
    .single();
  return data;
}

async function getCategoriesForVertical(vertical: ArticleVertical) {
  const supabase = createClient();

  if (vertical === 'kien-thuc') {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .eq('type', 'kien-thuc')
      .neq('slug', 'kien-thuc')
      .order('name');
    return data ?? [];
  }

  return [];
}

export const metadata: Metadata = { title: 'Chỉnh sửa bài viết | Admin' };

export default async function EditArticlePage({ params }: Props) {
  const article = await getArticleForEdit(params.id);
  if (!article) notFound();

  const vertical = article.categories?.type;
  if (!vertical || !isArticleVertical(vertical)) notFound();

  const categories = await getCategoriesForVertical(vertical);
  const label = getVerticalLabel(vertical);

  let currentHtml = '';
  try {
    currentHtml = await getFromR2(article.r2_key);
  } catch (err) {
    console.error('[EditArticle] Cannot load R2 content:', err);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <a href={`/admin/bai-viet/${vertical}`} className="text-sm text-gray-400 hover:text-white">
          ← Danh sách — {label}
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">Chỉnh sửa bài viết</h1>
      </div>

      <form action={updateArticleAction as any} className="space-y-6">
        <input type="hidden" name="id" value={article.id} />
        <input type="hidden" name="vertical" value={vertical} />

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
          {vertical === 'kien-thuc' ? (
            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-300 mb-1">Danh mục con</label>
              <select
                id="edit-category"
                name="category_id"
                defaultValue={article.category_id ?? ''}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <input type="hidden" name="category_id" value={article.category_id ?? ''} />
          )}
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
          <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh bìa</label>
          <CoverImageInput name="cover_image_url" defaultValue={article.cover_image_url ?? ''} />
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
          <label htmlFor="edit-keywords" className="block text-sm font-medium text-gray-300 mb-1">Keywords</label>
          <input
            id="edit-keywords"
            name="keywords"
            type="text"
            defaultValue={article.keywords ?? ''}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="edit-featured"
            name="is_featured"
            type="checkbox"
            value="true"
            defaultChecked={article.is_featured ?? false}
            className="w-4 h-4 rounded accent-emerald-500"
          />
          <label htmlFor="edit-featured" className="text-sm text-gray-300 cursor-pointer">
            Nổi bật (phân loại nội dung — không ảnh hưởng vị trí đầu trang chủ)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nội dung</label>
          <QuillEditor name="content_html" defaultValue={currentHtml} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Lưu thay đổi
          </button>
          <a
            href={`/admin/bai-viet/${vertical}`}
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Hủy
          </a>
        </div>
      </form>
    </div>
  );
}
