'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadToR2, deleteFromR2, makeBrokerKey } from '@/lib/r2';
import { triggerRevalidate, logAdminAction } from '@/lib/actions/revalidate';
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

// ── Create Broker ─────────────────────────────────────────────────────────────
export async function createBrokerAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const ratingStr = formData.get('rating') as string | null;
  const regulationInfo = formData.get('regulation_info') as string | null;
  const rawHtml = formData.get('content_html') as string;
  const status = (formData.get('status') as 'draft' | 'published') ?? 'draft';

  if (!name || !slug || !rawHtml) {
    return { error: 'Thiếu thông tin bắt buộc: tên sàn, slug, nội dung đánh giá' };
  }

  const rating = ratingStr ? parseFloat(ratingStr) : null;

  // Sanitize HTML before storing to R2 (XSS prevention)
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                   'strong','em','a','code','pre','img','table','thead','tbody',
                   'tr','td','th','br','hr','figure','figcaption'],
    ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
  });

  // Upload sanitized HTML to R2
  const r2Key = makeBrokerKey(slug);
  try {
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8', {
      'broker-slug': slug,
      'author-id': user.id,
    });
  } catch (err) {
    return { error: `Lỗi upload R2: ${String(err)}` };
  }

  // Insert metadata into Supabase
  const { data: broker, error: dbError } = await supabase
    .from('brokers')
    .insert({
      name,
      slug,
      rating,
      regulation_info: regulationInfo || null,
      r2_key: r2Key,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    })
    .select('id, slug')
    .single();

  if (dbError) {
    // Attempt to cleanup R2 file if DB insert fails
    await deleteFromR2(r2Key).catch(console.error);
    return { error: `Lỗi database: ${dbError.message}` };
  }

  // Audit log
  await logAdminAction({
    adminId: user.id,
    action: 'create',
    targetTable: 'brokers',
    targetId: broker.id,
    metadata: { slug, status },
  });

  // Revalidate relevant paths
  if (status === 'published') {
    await Promise.all([
      triggerRevalidate(`/danh-gia-san/${slug}`),
      triggerRevalidate('/danh-gia-san', 'layout'),
      triggerRevalidate('/', 'layout'),
    ]);
  }

  revalidatePath('/admin/danh-gia-san');
  return { success: true, id: broker.id };
}

// ── Update Broker ─────────────────────────────────────────────────────────────
export async function updateBrokerAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const ratingStr = formData.get('rating') as string | null;
  const regulationInfo = formData.get('regulation_info') as string | null;
  const rawHtml = formData.get('content_html') as string;
  const status = formData.get('status') as 'draft' | 'published';

  if (!id || !name || !slug) {
    return { error: 'Thiếu thông tin bắt buộc' };
  }

  const rating = ratingStr ? parseFloat(ratingStr) : null;

  // Get current broker to find existing r2_key
  const { data: existing } = await supabase
    .from('brokers')
    .select('r2_key, slug, status')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Sàn không tồn tại' };

  let r2Key = existing.r2_key;

  // If content changed, upload new version to R2
  if (rawHtml) {
    const safeHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                     'strong','em','a','code','pre','img','table','thead','tbody',
                     'tr','td','th','br','hr','figure','figcaption'],
      ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
    });
    r2Key = makeBrokerKey(slug);
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8');

    // Delete old R2 object if key changed
    if (existing.r2_key !== r2Key) {
      await deleteFromR2(existing.r2_key).catch(console.error);
    }
  }

  const wasPublished = existing.status === 'published';
  const isPublishing = status === 'published';

  const { error: dbError } = await supabase
    .from('brokers')
    .update({
      name,
      slug,
      rating,
      regulation_info: regulationInfo || null,
      r2_key: r2Key,
      status,
      published_at: isPublishing && !wasPublished ? new Date().toISOString() : undefined,
    })
    .eq('id', id);

  if (dbError) return { error: `Lỗi database: ${dbError.message}` };

  // Audit
  await logAdminAction({
    adminId: user.id,
    action: 'update',
    targetTable: 'brokers',
    targetId: id,
    metadata: { slug, status },
  });

  // Revalidate
  await Promise.all([
    triggerRevalidate(`/danh-gia-san/${slug}`),
    triggerRevalidate('/danh-gia-san', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/danh-gia-san');
  return { success: true };
}

// ── Delete Broker ─────────────────────────────────────────────────────────────
export async function deleteBrokerAction(id: string) {
  const { user, supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from('brokers')
    .select('r2_key, slug')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Sàn không tồn tại' };

  // Delete from Supabase
  const { error } = await supabase.from('brokers').delete().eq('id', id);
  if (error) return { error: error.message };

  // Delete HTML from R2
  await deleteFromR2(existing.r2_key).catch(console.error);

  // Audit
  await logAdminAction({
    adminId: user.id,
    action: 'delete',
    targetTable: 'brokers',
    targetId: id,
    metadata: { slug: existing.slug },
  });

  // Revalidate
  await Promise.all([
    triggerRevalidate(`/danh-gia-san/${existing.slug}`),
    triggerRevalidate('/danh-gia-san', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/danh-gia-san');
  return { success: true };
}
