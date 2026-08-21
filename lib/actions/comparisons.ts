'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadToR2, deleteFromR2, makeComparisonKey } from '@/lib/r2';
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

// ── Create Comparison ─────────────────────────────────────────────────────────
export async function createComparisonAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const slug = formData.get('slug') as string;
  const brokerAId = formData.get('broker_a_id') as string;
  const brokerBId = formData.get('broker_b_id') as string;
  const rawHtml = formData.get('content_html') as string;
  const status = (formData.get('status') as 'draft' | 'published') ?? 'draft';

  if (!slug || !brokerAId || !brokerBId || !rawHtml) {
    return { error: 'Thiếu thông tin bắt buộc: slug, sàn A, sàn B, nội dung so sánh' };
  }

  // Application layer validation for unique brokers
  if (brokerAId === brokerBId) {
    return { error: 'Vui lòng chọn hai sàn khác nhau để so sánh' };
  }

  // Sanitize HTML before storing to R2 (XSS prevention)
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','table','thead','tbody',
                   'tr','td','th','strong','em','a','code','br','hr'],
    ALLOWED_ATTR: ['href','class','id','target','rel'],
  });

  // Upload sanitized HTML to R2
  const r2Key = makeComparisonKey(slug);
  try {
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8', {
      'comparison-slug': slug,
      'author-id': user.id,
    });
  } catch (err) {
    return { error: `Lỗi upload R2: ${String(err)}` };
  }

  // Insert metadata into Supabase
  const { data: comparison, error: dbError } = await supabase
    .from('comparisons')
    .insert({
      slug,
      broker_a_id: brokerAId,
      broker_b_id: brokerBId,
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
    targetTable: 'comparisons',
    targetId: comparison.id,
    metadata: { slug, status },
  });

  // Revalidate relevant paths
  if (status === 'published') {
    await Promise.all([
      triggerRevalidate(`/so-sanh/${slug}`),
      triggerRevalidate('/so-sanh', 'layout'),
      triggerRevalidate('/', 'layout'),
    ]);
  }

  revalidatePath('/admin/so-sanh');
  return { success: true, id: comparison.id };
}

// ── Update Comparison ─────────────────────────────────────────────────────────
export async function updateComparisonAction(formData: FormData) {
  const { user, supabase } = await requireAdmin();

  const id = formData.get('id') as string;
  const slug = formData.get('slug') as string;
  const brokerAId = formData.get('broker_a_id') as string;
  const brokerBId = formData.get('broker_b_id') as string;
  const rawHtml = formData.get('content_html') as string;
  const status = formData.get('status') as 'draft' | 'published';

  if (!id || !slug || !brokerAId || !brokerBId) {
    return { error: 'Thiếu thông tin bắt buộc' };
  }

  // Application layer validation for unique brokers
  if (brokerAId === brokerBId) {
    return { error: 'Vui lòng chọn hai sàn khác nhau để so sánh' };
  }

  // Get current comparison to find existing r2_key
  const { data: existing } = await supabase
    .from('comparisons')
    .select('r2_key, slug, status')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài so sánh không tồn tại' };

  let r2Key = existing.r2_key;

  // If content changed, upload new version to R2
  if (rawHtml) {
    const safeHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','table','thead','tbody',
                     'tr','td','th','strong','em','a','code','br','hr'],
      ALLOWED_ATTR: ['href','class','id','target','rel'],
    });
    r2Key = makeComparisonKey(slug);
    await uploadToR2(r2Key, safeHtml, 'text/html; charset=utf-8');

    // Delete old R2 object if key changed
    if (existing.r2_key !== r2Key) {
      await deleteFromR2(existing.r2_key).catch(console.error);
    }
  }

  const wasPublished = existing.status === 'published';
  const isPublishing = status === 'published';

  const { error: dbError } = await supabase
    .from('comparisons')
    .update({
      slug,
      broker_a_id: brokerAId,
      broker_b_id: brokerBId,
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
    targetTable: 'comparisons',
    targetId: id,
    metadata: { slug, status },
  });

  // Revalidate
  await Promise.all([
    triggerRevalidate(`/so-sanh/${slug}`),
    triggerRevalidate('/so-sanh', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/so-sanh');
  return { success: true };
}

// ── Delete Comparison ─────────────────────────────────────────────────────────
export async function deleteComparisonAction(id: string) {
  const { user, supabase } = await requireAdmin();

  const { data: existing } = await supabase
    .from('comparisons')
    .select('r2_key, slug')
    .eq('id', id)
    .single();

  if (!existing) return { error: 'Bài so sánh không tồn tại' };

  // Delete from Supabase
  const { error } = await supabase.from('comparisons').delete().eq('id', id);
  if (error) return { error: error.message };

  // Delete HTML from R2
  await deleteFromR2(existing.r2_key).catch(console.error);

  // Audit
  await logAdminAction({
    adminId: user.id,
    action: 'delete',
    targetTable: 'comparisons',
    targetId: id,
    metadata: { slug: existing.slug },
  });

  // Revalidate
  await Promise.all([
    triggerRevalidate(`/so-sanh/${existing.slug}`),
    triggerRevalidate('/so-sanh', 'layout'),
    triggerRevalidate('/', 'layout'),
  ]);

  revalidatePath('/admin/so-sanh');
  return { success: true };
}
