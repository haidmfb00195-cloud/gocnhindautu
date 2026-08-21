// Database types generated from Supabase schema
// Run: npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
// For now this is a manual type definition matching our migration schema.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = any;
