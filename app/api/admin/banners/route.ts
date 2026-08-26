import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — danh sách tất cả banner (kể cả inactive, dành cho admin)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('affiliate_banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('slug');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data });
}

// POST — tạo banner mới
export async function POST(req: Request) {
  const body = await req.json();
  const { slug, title, subtitle, affiliate_link, promo_code, qr_image_url, cta_text, is_active, sort_order } = body;

  if (!slug || !title || !affiliate_link) {
    return NextResponse.json({ error: 'Thiếu slug, title hoặc affiliate_link' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('affiliate_banners')
    .insert({
      slug,
      title,
      subtitle: subtitle || null,
      affiliate_link,
      promo_code: promo_code || null,
      qr_image_url: qr_image_url || null,
      cta_text: cta_text || 'ĐĂNG KÝ NGAY',
      is_active: is_active ?? true,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ banner: data }, { status: 201 });
}

// PUT — cập nhật banner theo id
export async function PUT(req: Request) {
  const body = await req.json();
  const { id, affiliate_link, promo_code, qr_image_url, title, subtitle, cta_text, is_active, sort_order } = body;

  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('affiliate_banners')
    .update({
      affiliate_link,
      promo_code: promo_code || null,
      qr_image_url: qr_image_url || null,
      title,
      subtitle: subtitle || null,
      cta_text: cta_text || 'ĐĂNG KÝ NGAY',
      is_active,
      sort_order: sort_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}

// DELETE — xóa banner theo id
export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('affiliate_banners')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath('/', 'layout');
  return NextResponse.json({ success: true });
}
