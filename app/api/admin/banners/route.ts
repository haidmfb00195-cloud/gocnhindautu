import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('affiliate_banners')
    .select('*')
    .order('slug');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, affiliate_link, promo_code, qr_image_url, title, subtitle, cta_text, is_active } = body;

  const { error } = await supabaseAdmin
    .from('affiliate_banners')
    .update({ 
      affiliate_link, 
      promo_code, 
      qr_image_url, 
      title, 
      subtitle, 
      cta_text, 
      is_active, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tự động revalidate toàn bộ trang layout chứa banner
  revalidatePath('/', 'layout');

  return NextResponse.json({ success: true });
}
