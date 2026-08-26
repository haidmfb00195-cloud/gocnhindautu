import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function requireAdminApi() {
  const supabase = createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') return null;
  return user;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Không tìm thấy tin nhắn' }, { status: 404 });
  }

  if (!data.is_read) {
    await supabaseAdmin
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', params.id);
    data.is_read = true;
  }

  return NextResponse.json({ message: data });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from('contact_messages')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
