import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Các vị trí chỉ cho phép 1 banner đang bật cùng lúc.
// "homepage_grid" KHÔNG nằm trong danh sách này vì cho phép nhiều banner cùng lúc (dạng lưới).
const SINGLETON_PLACEMENTS = ['header_cta', 'home_horizontal', 'sidebar_category'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

// GET — danh sách tất cả banner (kể cả inactive, dành cho admin)
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('affiliate_banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data });
}

// Nếu banner này thuộc vị trí "độc quyền" (chỉ 1 banner hiển thị) và đang được bật,
// tự động tắt mọi banner khác cùng vị trí đó — admin không cần tự tắt cái cũ.
async function enforceSingleton(currentId: string, placement: string | null, isActive: boolean) {
  if (isActive && placement && SINGLETON_PLACEMENTS.includes(placement)) {
    await supabaseAdmin
      .from('affiliate_banners')
      .update({ is_active: false })
      .eq('placement', placement)
      .neq('id', currentId);
  }
}

// POST — tạo banner mới
export async function POST(req: Request) {
  const body = await req.json();
  const {
    title, subtitle, affiliate_link, promo_code,
    qr_image_url, cta_text, is_active, sort_order, placement,
  } = body;

  if (!title || !affiliate_link || !placement) {
    return NextResponse.json({ error: 'Thiếu Tiêu đề, Link affiliate hoặc Vị trí hiển thị' }, { status: 400 });
  }

  // Slug chỉ dùng nội bộ để định danh duy nhất, không còn ảnh hưởng tới vị trí hiển thị nữa.
  const slug = `${slugify(title)}-${Date.now().toString(36)}`;

  const { data, error } = await supabaseAdmin
    .from('affiliate_banners')
    .insert({
      slug,
      placement,
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

  await enforceSingleton(data.id, placement, data.is_active);
  revalidatePath('/', 'layout');
  return NextResponse.json({ banner: data }, { status: 201 });
}

// PUT — cập nhật banner theo id
export async function PUT(req: Request) {
  const body = await req.json();
  const {
    id, affiliate_link, promo_code, qr_image_url, title,
    subtitle, cta_text, is_active, sort_order, placement,
  } = body;

  if (!id) return NextResponse.json({ error: 'Thiếu id' }, { status: 400 });
  if (!placement) return NextResponse.json({ error: 'Vui lòng chọn Vị trí hiển thị' }, { status: 400 });

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
      placement,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await enforceSingleton(id, placement, is_active);
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
