import { createStaticClient } from '@/lib/supabase/static';
import AffiliateCard from './AffiliateCard';

type AffiliateBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  affiliate_link: string;
  qr_image_url: string | null;
  sort_order: number;
};

async function getGridBanners(): Promise<AffiliateBanner[]> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('affiliate_banners')
    .select('id, title, subtitle, affiliate_link, qr_image_url, sort_order')
    .eq('placement', 'homepage_grid')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export default async function AffiliateGrid() {
  const banners = await getGridBanners();

  // Chưa có banner thật nào được gán vào vị trí này trong admin
  // -> ẩn hẳn cả mục, không hiện dữ liệu giả/link chết nữa.
  if (banners.length === 0) return null;

  const partners = banners.map((b) => ({
    id: b.id,
    name: b.title,
    logoUrl: b.qr_image_url ?? '',
    offerText: b.subtitle ?? '',
    affiliateUrl: b.affiliate_link,
  }));

  return (
    <section className="section py-8">
      <div className="container">
        <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2 uppercase">
          <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
          Quỹ &amp; Sàn giao dịch nổi bật
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {partners.map((partner) => (
            <AffiliateCard key={partner.id} {...partner} />
          ))}
        </div>
      </div>
    </section>
  );
}
