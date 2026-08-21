'use server';

import { triggerRevalidate } from '@/lib/actions/revalidate';
import { createClient } from '@/lib/supabase/server';

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

export async function manualRevalidateAction(prevState: any, formData: FormData) {
  try {
    await requireAdmin();
  } catch (err) {
    return { error: 'Không có quyền truy cập (Yêu cầu quyền admin).' };
  }

  const path = formData.get('path') as string;
  const type = (formData.get('type') as 'page' | 'layout') || 'page';

  if (!path) {
    return { error: 'Vui lòng nhập đường dẫn cần revalidate.' };
  }

  try {
    // triggerRevalidate doesn't throw, but log errors. We'll run it.
    await triggerRevalidate(path, type);
    return { success: `Yêu cầu revalidate đã được gửi cho "${path}" (${type})` };
  } catch (err) {
    return { error: `Gặp lỗi: ${String(err)}` };
  }
}
