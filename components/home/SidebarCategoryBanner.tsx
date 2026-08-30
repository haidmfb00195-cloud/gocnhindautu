import { createStaticClient } from '@/lib/supabase/static';

type SidebarBanner = {
  title: string;
  subtitle: string | null;
  affiliate_link: string;
  promo_code: string | null;
  qr_image_url: string | null;
  cta_text: string;
};

async function getSidebarBanner(): Promise<SidebarBanner | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('affiliate_banners')
    .select('title, subtitle, affiliate_link, promo_code, qr_image_url, cta_text')
    .eq('placement', 'sidebar_category')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

// Chưa cấu hình banner trong admin -> ẩn hẳn, không hiện dữ liệu giả.
export default async function SidebarCategoryBanner() {
  const banner = await getSidebarBanner();
  if (!banner) return null;

  return (
    <div className="rounded-xl bg-black p-4 text-center border border-border shadow-glow flex flex-col items-center">
      <div className="text-primary font-bold text-lg mb-1">{banner.title}</div>
      {banner.subtitle && <div className="text-white text-sm mb-4">{banner.subtitle}</div>}

      {banner.qr_image_url && (
        <div className="w-32 h-32 bg-white flex items-center justify-center rounded-lg mb-4 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={banner.qr_image_url} alt="QR Code" className="w-full h-full object-contain" />
        </div>
      )}

      {banner.promo_code && (
        <div className="bg-zinc-800 text-white rounded px-3 py-1 font-mono text-sm mb-4 border border-zinc-700">
          {banner.promo_code}
        </div>
      )}

      <a
        href={banner.affiliate_link}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="btn btn-primary w-full justify-center rounded-full text-black font-bold"
      >
        {banner.cta_text || 'ĐĂNG KÝ NGAY'}
      </a>
    </div>
  );
}
