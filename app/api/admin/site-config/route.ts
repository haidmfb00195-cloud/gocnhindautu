import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/site-config — trả về toàn bộ config dạng object key:value
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_config')
    .select('key, value')
    .order('key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Chuyển array [{key, value}] → object {key: value}
  const config = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
  return NextResponse.json({ config });
}

// PUT /api/admin/site-config — upsert nhiều key cùng lúc
// Body: { updates: { logo_url: '...', contact_phone: '...', ... } }
export async function PUT(req: Request) {
  const body = await req.json();
  const updates: Record<string, string> = body.updates ?? {};

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value: value ?? '',
    updated_at: new Date().toISOString(),
  }));

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Không có dữ liệu cần lưu' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('site_config')
    .upsert(rows, { onConflict: 'key' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Revalidate layout để Header/Footer/lien-he cập nhật ngay
  revalidatePath('/', 'layout');

  return NextResponse.json({ success: true });
}
