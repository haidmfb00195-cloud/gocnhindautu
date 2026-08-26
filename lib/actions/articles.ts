'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { uploadToR2, deleteFromR2, makeArticleKey } from '@/lib/r2';
import { triggerRevalidate, logAdminAction } from '@/lib/actions/revalidate';
import { stripZeroWidth } from '@/lib/utils/text';
import {
  getArticlePublicPath,
  isArticleVertical,
  type ArticleVertical,
} from '@/lib/constants/article-verticals';
import DOMPurify from 'isomorphic-dompurify';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') throw new Error('Forbidden');
  return { user, supabase };
}

function sanitizeArticleHtml(rawHtml: string): string {
  const cleaned = stripZeroWidth(rawHtml);
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                   'strong','em','a','code','pre','img','table','thead','tbody',
                   'tr','td','th','br','hr','figure','figcaption'],
    ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
  });
}

async function revalidateArticlePaths(
  vertical: ArticleVertical,
  slug: string,
  categorySlug?: string | null
) {
  const publicPath = getArticlePublicPath(vertical, slug, categorySlug);
  await Promise.all([
    triggerRevalidate(publicPath),
    triggerRevalidate(`/${vertical}`, 'layout'),
    triggerRevalidate('/kien-thuc', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);
}

function revalidateAdminList(vertical?: ArticleVertical) {
  if (vertical) revalidatePath(`/admin/bai-viet/${vertical}`);
  revalidatePath('/admin/bai-viet/kien-thuc');
  revalidatePath('/admin/bai-viet/trade-quy');
  revalidatePath('/admin/bai-viet/san-giao-dich');
}

export async function createArticleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const title = stripZeroWidth((formData.get('title') as string) ?? '');
  const slug = stripZeroWidth((formData.get('slug') as string) ?? '');
  const categoryId = formData.get('category_id') as string | null;
  const verticalRaw = formData.get('vertical') as string | null;
  const metaDescription = stripZeroWidth((formData.get('meta_description') as string) ?? '') || null;
  const keywordsRaw = stripZeroWidth((formData.get('keywords') as string) ?? '') || null;
  const coverImageUrl = (formData.get('cover_image_url') as string) || null;
  const rawHtml = formData.get('content_html') as string;
  const status = (formData.get('status') as 'draft' | 'published') ?? 'draft';

  if (!title || !slug || !rawHtml) {
    return { error: 'Thiếu thông tin bắt buộc: title, slug, content' };
  }

  const safeHtml = sanitizeArticleHtml(rawHtml);
  const r2Key = makeArticleKey(slug);

  try {
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8', {
      'article-slug': slug,
      'author-id': user.id,
    });
  } catch (err) {
    return { error: `Lỗi upload R2: ${String(err)}` };
  }

  const { data: article, error: dbError } = await supabase
    .from('articles')
    .insert({
      title,
      slug,
      category_id: categoryId || null,
      author_id: user.id,
      r2_key: r2Key,
      status,
      meta_description: metaDescription,
      keywords: keywordsRaw,
      cover_image_url: coverImageUrl,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id, slug, categories(slug, type)')
    .single();

  if (dbError) {
    return { error: `Lỗi database: ${dbError.message}` };
  }

  await logAdminAction({
    adminId: user.id,
    action: 'create',
    targetTable: 'articles',
    targetId: article.id,
    metadata: { slug, status },
  });

  const category = (article as any).categories;
  const vertical = (verticalRaw && isArticleVertical(verticalRaw) ? verticalRaw : category?.type) as ArticleVertical | undefined;

  if (status === 'published' && vertical && isArticleVertical(vertical)) {
    await revalidateArticlePaths(vertical, slug, category?.slug);
  }

  if (vertical && isArticleVertical(vertical)) {
    revalidateAdminList(vertical);
  }

  return { success: true, id: article.id };
}

export async function updateArticleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const id = formData.get('id') as string;
  const title = stripZeroWidth((formData.get('title') as string) ?? '');
  const slug = stripZeroWidth((formData.get('slug') as string) ?? '');
  const categoryId = formData.get('category_id') as string | null;
  const metaDescription = stripZeroWidth((formData.get('meta_description') as string) ?? '') || null;
  const keywordsRaw = stripZeroWidth((formData.get('keywords') as string) ?? '') || null;
  const coverImageUrl = (formData.get('cover_image_url') as string) || null;
  const rawHtml = formData.get('content_html') as string;
  const status = formData.get('status') as 'draft' | 'published';
  const isFeatured = formData.get('is_featured') === 'true';

  if (!id || !title || !slug) {
    return { error: 'Thiếu thông tin bắt buộc' };
  }

  const { data: existing } = await supabase
    .from('articles')
    .select('r2_key, slug, status, categories(slug, type)')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài viết không tồn tại' };

  let r2Key = existing.r2_key;

  if (rawHtml) {
    const safeHtml = sanitizeArticleHtml(rawHtml);
    r2Key = makeArticleKey(slug);
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8');

    if (existing.r2_key !== r2Key) {
      await deleteFromR2(existing.r2_key).catch(console.error);
    }
  }

  const wasPublished = existing.status === 'published';
  const isPublishing = status === 'published';

  const { error: dbError } = await supabase
    .from('articles')
    .update({
      title,
      slug,
      category_id: categoryId || null,
      r2_key: r2Key,
      status,
      meta_description: metaDescription,
      keywords: keywordsRaw,
      cover_image_url: coverImageUrl,
      is_featured: isFeatured,
      published_at: isPublishing && !wasPublished ? new Date().toISOString() : undefined,
    })
    .eq('id', id);

  if (dbError) return { error: `Lỗi database: ${dbError.message}` };

  await logAdminAction({
    adminId: user.id,
    action: 'update',
    targetTable: 'articles',
    targetId: id,
    metadata: { slug, status },
  });

  const category = (existing as any).categories;
  const vertical = category?.type as ArticleVertical | undefined;

  if (vertical && isArticleVertical(vertical)) {
    await revalidateArticlePaths(vertical, slug, category?.slug);
    revalidateAdminList(vertical);
  }

  return { success: true };
}

export async function deleteArticleAction(id: string) {
  const { user, supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from('articles')
    .select('r2_key, slug, categories(slug, type)')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài viết không tồn tại' };

  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return { error: error.message };

  await deleteFromR2(existing.r2_key).catch(console.error);

  await logAdminAction({
    adminId: user.id,
    action: 'delete',
    targetTable: 'articles',
    targetId: id,
    metadata: { slug: existing.slug },
  });

  const category = (existing as any).categories;
  const vertical = category?.type as ArticleVertical | undefined;

  if (vertical && isArticleVertical(vertical)) {
    await revalidateArticlePaths(vertical, existing.slug, category?.slug);
    revalidateAdminList(vertical);
  }

  return { success: true };
}

/** Ghim bài viết lên banner đầu trang chủ — chỉ 1 bài tại một thời điểm */
export async function pinArticleHomeAction(articleId: string) {
  const { user, supabase } = await requireAdmin();

  const { data: article } = await supabase
    .from('articles')
    .select('id, slug, status, categories(slug, type)')
    .eq('id', articleId)
    .single();

  if (!article) return { error: 'Bài viết không tồn tại' };

  const service = createServiceClient();
  const { error } = await service.rpc('pin_article_home', { article_id: articleId });

  if (error) return { error: error.message };

  await logAdminAction({
    adminId: user.id,
    action: 'pin_home',
    targetTable: 'articles',
    targetId: articleId,
    metadata: { slug: article.slug },
  });

  revalidatePath('/');
  revalidateAdminList();

  return { success: true };
}
