import { createStaticClient } from '@/lib/supabase/static';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  affiliate_link: string;
  cta_text: string;
};

async function getHomeBanner(): Promise<Banner | null> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('affiliate_banners')
    .select('id, title, subtitle, affiliate_link, cta_text')
    .eq('placement', 'home_horizontal')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}

export default async function AffiliateBannerHorizontal() {
  const banner = await getHomeBanner();

  const title = banner?.title ?? 'MỞ TÀI KHOẢN GIAO DỊCH NGAY';
  const subtitle = banner?.subtitle ?? 'Nhận ngay ưu đãi khi đăng ký qua link của Góc Nhìn Đầu Tư';
  const affiliateLink = banner?.affiliate_link ?? '#';
  const ctaText = banner?.cta_text ?? 'ĐĂNG KÝ NGAY';

  return (
    <div className="w-full bg-black py-6 my-8">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-black text-xs shrink-0">
            LOGO
          </div>
          <div>
            <h3 className="text-white text-xl font-bold mb-1">{title}</h3>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
        <a
          href={affiliateLink}
          target="_blank"
          rel="nofollow sponsored noopener"
          className="btn bg-[#B6F500] hover:bg-[#9ED400] text-black font-bold whitespace-nowrap rounded-full px-8 py-3"
        >
          {ctaText}
        </a>
      </div>
    </div>
  );
}
