import HeroBanner from '@/components/home/HeroBanner';
import SidebarLatestPopular from '@/components/home/SidebarLatestPopular';
import AffiliateBannerHorizontal from '@/components/home/AffiliateBannerHorizontal';
import AffiliateGrid from '@/components/home/AffiliateGrid';
import ArticleCard from '@/components/ui/ArticleCard';

const MOCK_ARTICLES = [
  { id: 1, title: 'Hướng dẫn Price Action cơ bản', excerpt: 'Tất tần tật về Price Action giúp bạn nắm bắt cơ hội giao dịch.', date: '04 Th08 2026', imageUrl: '', slug: 'price-action-co-ban', categorySlug: 'kien-thuc' },
  { id: 2, title: 'So sánh FTMO và The5ers', excerpt: 'Quỹ nào phù hợp với phong cách giao dịch của bạn nhất?', date: '01 Th08 2026', imageUrl: '', slug: 'so-sanh-ftmo-the5ers', categorySlug: 'trade-quy' },
  { id: 3, title: 'Top 3 sàn Forex phí thấp nhất', excerpt: 'Đánh giá các sàn Forex có spread và commission thấp nhất.', date: '28 Th07 2026', imageUrl: '', slug: 'top-3-san-forex', categorySlug: 'san-giao-dich' },
  { id: 4, title: 'Quản lý vốn Kelly Criterion', excerpt: 'Công thức toán học áp dụng vào trading để tối đa hoá lợi nhuận.', date: '25 Th07 2026', imageUrl: '', slug: 'quan-ly-von-kelly', categorySlug: 'kien-thuc' },
];

export default function Home() {
  return (
    <>
      <section className="section py-8">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[68%]">
              <HeroBanner />
            </div>
            <div className="w-full lg:w-[32%]">
              <SidebarLatestPopular />
            </div>
          </div>
        </div>
      </section>

      <AffiliateBannerHorizontal />

      <AffiliateGrid />

      <section className="section py-8">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2 uppercase">
            <span className="w-1 h-6 bg-primary rounded-full inline-block"></span>
            Bài viết mới nhất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_ARTICLES.map(article => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
