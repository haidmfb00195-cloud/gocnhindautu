import { createClient } from '@/lib/supabase/server';

export type SiteConfig = {
  logo_url: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  facebook_url: string;
  zalo_url: string;
};

const DEFAULTS: SiteConfig = {
  logo_url: '',
  contact_phone: '+84 123 456 789',
  contact_email: 'admin@gocnhindautu.com',
  contact_address: 'Hà Nội, Việt Nam',
  facebook_url: '',
  zalo_url: '',
};

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = createClient();
  const { data } = await supabase.from('site_config').select('key, value');

  const config = { ...DEFAULTS };
  for (const row of data ?? []) {
    if (row.key in config) {
      (config as Record<string, string>)[row.key] = row.value ?? '';
    }
  }
  return config;
}
