import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createArticleAction } from '@/lib/actions/articles';
import QuillEditor from '@/components/admin/QuillEditor';
import CoverImageInput from '@/components/admin/CoverImageInput';
import {
  isArticleVertical,
  getVerticalLabel,
  type ArticleVertical,
} from '@/lib/constants/article-verticals';

interface Props {
  params: { vertical: string };
}

async function getCategoriesForVertical(vertical: ArticleVertical) {
  const supabase = createClient();

  if (vertical === 'kien-thuc') {
    const { data } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('type', 'kien-thuc')
      .neq('slug', 'kien-thuc')
      .order('name');
    return { subCategories: data ?? [], defaultCategoryId: data?.[0]?.id ?? null };
  }

  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('type', vertical)
    .eq('slug', vertical)
    .single();

  return { subCategories: [], defaultCategoryId: data?.id ?? null };
}

export async function generateMetadata({ params }: Props) {
  if (!isArticleVertical(params.vertical)) return { title: 'Tạo bài viết | Admin' };
  return { title: `Tạo bài viết — ${getVerticalLabel(params.vertical)} | Admin` };
}

export default async function NewArticlePage({ params }: Props) {
  if (!isArticleVertical(params.vertical)) notFound();

  const vertical = params.vertical;
  const { subCategories, defaultCategoryId } = await getCategoriesForVertical(vertical);
  const label = getVerticalLabel(vertical);

  if (!defaultCategoryId) {
    return (
      <div className="max-w-3xl">
        <p className="text-red-400">
          Chưa có danh mục cho &quot;{label}&quot;. Vui lòng chạy migration 004 trên Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <a href={`/admin/bai-viet/${vertical}`} className="text-sm text-gray-400 hover:text-white">
          ← Danh sách — {label}
        </a>
        <h1 className="text-2xl font-bold text-white mt-2">Tạo bài viết — {label}</h1>
      </div>

      <form action={createArticleAction as any} className="space-y-6">
        <input type="hidden" name="vertical" value={vertical} />
        {vertical !== 'kien-thuc' && (
          <input type="hidden" name="category_id" value={defaultCategoryId} />
        )}

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
              pattern="[a-z0-9\-]+"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="ten-bai-viet"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {vertical === 'kien-thuc' ? (
            <div>
              <label htmlFor="article-category" className="block text-sm font-medium text-gray-300 mb-1">
                Danh mục con
              </label>
              <select
                id="article-category"
                name="category_id"
                defaultValue={defaultCategoryId ?? ''}
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
              >
                {subCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Chuyên mục</label>
              <p className="text-sm text-emerald-400 py-2.5">{label} (tự gán)</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Ảnh bìa</label>
          <CoverImageInput name="cover_image_url" />
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
            placeholder="Mô tả ngắn (tối đa 160 ký tự)"
          />
        </div>

        <div>
          <label htmlFor="article-keywords" className="block text-sm font-medium text-gray-300 mb-1">
            Keywords
            <span className="text-xs text-gray-500 ml-2">(phân cách bằng dấu phẩy)</span>
          </label>
          <input
            id="article-keywords"
            name="keywords"
            type="text"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="forex, exness, review san giao dich"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung <span className="text-red-400">*</span>
          </label>
          <QuillEditor name="content_html" placeholder="Viết nội dung bài viết ở đây..." />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            name="status"
            value="draft"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Lưu nháp
          </button>
          <button
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
