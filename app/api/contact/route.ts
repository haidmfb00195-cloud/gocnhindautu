import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate-limit đơn giản theo IP (in-memory, reset khi redeploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 giờ

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau.' },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
  }

  // Honeypot — bot thường điền field ẩn
  if (body.website) {
    return NextResponse.json({ success: true });
  }

  const name = String(body.name ?? '').trim();
  const email = body.email ? String(body.email).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;
  const message = String(body.message ?? '').trim();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Vui lòng nhập họ tên' }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json({ error: 'Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)' }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json(
      { error: 'Vui lòng nhập email hoặc số điện thoại để chúng tôi liên hệ lại' },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from('contact_messages').insert({
    name,
    email,
    phone,
    message,
  });

  if (error) {
    console.error('[contact] insert error:', error.message);
    return NextResponse.json({ error: 'Không thể gửi tin nhắn. Vui lòng thử lại.' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
