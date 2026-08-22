'use server';

import { createClient, createServiceClient } from '@/lib/supabase/server';
import { uploadToR2, deleteFromR2, makeArticleKey } from '@/lib/r2';
import { triggerRevalidate, logAdminAction } from '@/lib/actions/revalidate';
import { stripZeroWidth } from '@/lib/utils/text';
import DOMPurify from 'isomorphic-dompurify';
import { revalidatePath } from 'next/cache';

// ── Helper: get current admin user ────────────────────────────────────────────
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

// Sanitize + strip zero-width chars in one place, shared by create/update.
// ZWSP (\u200B etc.) is a valid unicode char DOMPurify does NOT strip on
// its own — it's not an XSS vector, just invisible junk — so we strip it
// explicitly BEFORE sanitizing. This is the fix for the Vietnamese
// word-break bug seen earlier on cokhiapec.com; see lib/utils/text.ts.
function sanitizeArticleHtml(rawHtml: string): string {
  const cleaned = stripZeroWidth(rawHtml);
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                   'strong','em','a','code','pre','img','table','thead','tbody',
                   'tr','td','th','br','hr','figure','figcaption'],
    ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
  });
}

// ── Create Article ────────────────────────────────────────────────────────────
export async function createArticleAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const title = stripZeroWidth((formData.get('title') as string) ?? '');
  const slug = stripZeroWidth((formData.get('slug') as string) ?? '');
  const categoryId = formData.get('category_id') as string | null;
  const metaDescription = stripZeroWidth((formData.get('meta_description') as string) ?? '') || null;
  const keywordsRaw = stripZeroWidth((formData.get('keywords') as string) ?? '') || null;
  const coverImageUrl = (formData.get('cover_image_url') as string) || null;
  const rawHtml = formData.get('content_html') as string;
  const status = (formData.get('status') as 'draft' | 'published') ?? 'draft';

  if (!title || !slug || !rawHtml) {
    return { error: 'Thiếu thông tin bắt buộc: title, slug, content' };
  }

  const safeHtml = sanitizeArticleHtml(rawHtml);

  // Upload sanitized HTML to R2
  const r2Key = makeArticleKey(slug);
  try {
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8', {
      'article-slug': slug,
      'author-id': user.id,
    });
  } catch (err) {
    return { error: `Lỗi upload R2: ${String(err)}` };
  }

  // Insert metadata into Supabase (NOT the HTML content)
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
    .select('id, slug, categories(slug)')
    .single();

  if (dbError) {
    return { error: `Lỗi database: ${dbError.message}` };
  }

  // Audit log
  await logAdminAction({
    adminId: user.id,
    action: 'create',
    targetTable: 'articles',
    targetId: article.id,
    metadata: { slug, status },
  });

  // Revalidate relevant paths
  if (status === 'published') {
    const categorySlug = (article as any).categories?.slug ?? 'chung';
    await Promise.all([
      triggerRevalidate(`/kien-thuc/${categorySlug}/${slug}`),
      triggerRevalidate('/kien-thuc', 'layout'),
      triggerRevalidate('/', 'layout'),
    ]);
  }

  revalidatePath('/admin/kien-thuc');
  return { success: true, id: article.id };
}

// ── Update Article ────────────────────────────────────────────────────────────
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

  if (!id || !title || !slug) {
    return { error: 'Thiếu thông tin bắt buộc' };
  }

  // Get current article to find existing r2_key
  const { data: existing } = await supabase
    .from('articles')
    .select('r2_key, slug, status, categories(slug)')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài viết không tồn tại' };

  let r2Key = existing.r2_key;

  // If content changed, upload new version to R2
  if (rawHtml) {
    const safeHtml = sanitizeArticleHtml(rawHtml);
    r2Key = makeArticleKey(slug);
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8');

    // Delete old R2 object if key changed
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
      published_at: isPublishing && !wasPublished ? new Date().toISOString() : undefined,
    })
    .eq('id', id);

  if (dbError) return { error: `Lỗi database: ${dbError.message}` };

  // Audit
  await logAdminAction({
    adminId: user.id,
    action: 'update',
    targetTable: 'articles',
    targetId: id,
    metadata: { slug, status },
  });

  // Revalidate
  const categorySlug = (existing as any).categories?.slug ?? 'chung';
  await Promise.all([
    triggerRevalidate(`/kien-thuc/${categorySlug}/${slug}`),
    triggerRevalidate('/kien-thuc', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/kien-thuc');
  return { success: true };
}

// ── Delete Article ────────────────────────────────────────────────────────────
export async function deleteArticleAction(id: string) {
  const { user, supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from('articles')
    .select('r2_key, slug, categories(slug)')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài viết không tồn tại' };

  // Delete from Supabase
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) return { error: error.message };

  // Delete HTML from R2
  await deleteFromR2(existing.r2_key).catch(console.error);

  // Audit
  await logAdminAction({
    adminId: user.id,
    action: 'delete',
    targetTable: 'articles',
    targetId: id,
    metadata: { slug: existing.slug },
  });

  // Revalidate
  const categorySlug = (existing as any).categories?.slug ?? 'chung';
  await Promise.all([
    triggerRevalidate(`/kien-thuc/${categorySlug}/${existing.slug}`),
    triggerRevalidate('/kien-thuc', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/kien-thuc');
  return { success: true };
}
