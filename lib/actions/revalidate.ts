'use server';

import { createServiceClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

/**
 * Trigger on-demand cache revalidation for a given path.
 * Called from Server Actions after publish/update/delete in admin.
 * Uses internal fetch to /api/revalidate with REVALIDATE_SECRET.
 */
export async function triggerRevalidate(
  path: string,
  type: 'layout' | 'page' = 'page'
): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!secret) {
    console.warn('[revalidate] REVALIDATE_SECRET not set — skipping revalidation');
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, secret, type }),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error('[revalidate] Failed:', error);
    }
  } catch (err) {
    // Do not throw — revalidation failure should not block admin operations
    console.error('[revalidate] Error calling revalidate endpoint:', err);
  }
}

/**
 * Write an audit log entry to admin_actions table.
 * Uses service_role client to bypass RLS (required since RLS blocks INSERT for all roles).
 */
export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetTable: string;
  targetId: string;
  metadata?: Json;
}): Promise<void> {
  const supabase = createServiceClient();

  const { error } = await supabase.from('admin_actions').insert({
    admin_id: params.adminId,
    action: params.action,
    target_table: params.targetTable,
    target_id: params.targetId,
    metadata: params.metadata ?? null,
  });

  if (error) {
    // Log but don't throw — audit failure should not block the main operation
    console.error('[audit] Failed to write admin_action:', error);
  }
}
