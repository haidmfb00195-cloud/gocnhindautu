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

export type HeaderCta = {
  href: string;
  text: string;
};

// Nút "ĐĂNG KÝ NGAY" ở góc phải header — trước đây bị hard-code sang /dang-ky
// (route không tồn tại, rơi vào trang danh mục demo cũ). Giờ lấy trực tiếp từ
// affiliate_banners theo slug 'header-cta', tạo/sửa banner này trong
// /admin/banners để đổi link mà không cần deploy lại.
export async function getHeaderCta(): Promise<HeaderCta> {
  const supabase = createClient();
  const { data } = await supabase
    .from('affiliate_banners')
    .select('affiliate_link, cta_text')
    .eq('placement', 'header_cta')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    href: data?.affiliate_link || '/lien-he',
    text: data?.cta_text || 'ĐĂNG KÝ NGAY',
  };
}
