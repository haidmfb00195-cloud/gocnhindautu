import { createStaticClient as createClient } from '@/lib/supabase/static';
import HeroBanner from '@/components/home/HeroBanner';
import SidebarLatestPopular from '@/components/home/SidebarLatestPopular';
import AffiliateBannerHorizontal from '@/components/home/AffiliateBannerHorizontal';
import AffiliateGrid from '@/components/home/AffiliateGrid';
import ArticleCard from '@/components/ui/ArticleCard';
import { formatDateVN } from '@/lib/utils/date';

export const dynamic = 'force-static';

async function getLatestArticles() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, meta_description, cover_image_url, published_at, categories(slug)')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function Home() {
  const articles = await getLatestArticles();

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
          {articles.length === 0 ? (
            <p className="text-text-secondary text-center py-12">Chưa có bài viết nào được xuất bản.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {articles.map((article: any) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  excerpt={article.meta_description ?? ''}
                  date={formatDateVN(article.published_at)}
                  imageUrl={article.cover_image_url ?? ''}
                  slug={article.slug}
                  categorySlug={article.categories?.slug ?? 'kien-thuc'}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
