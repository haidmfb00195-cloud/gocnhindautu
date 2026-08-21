'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client for use in Client Components.
 * Uses @supabase/ssr createBrowserClient which handles session
 * persistence in browser cookies automatically.
 *
 * Call this inside a Client Component — do NOT call at module level
 * to avoid issues with SSR.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
