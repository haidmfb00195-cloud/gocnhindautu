import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getVerticalArticlesPage } from '@/lib/data/vertical-articles';
import SidebarCategoryBanner from '@/components/home/SidebarCategoryBanner';

export const metadata: Metadata = {
  title: 'Trade quỹ',
  description: 'Kinh nghiệm, đánh giá và tin tức về các quỹ cấp vốn (prop firm) cho trader.',
};

interface Props {
  searchParams: { page?: string };
}

export default async function TradeQuyPage({ searchParams }: Props) {
  const currentPage = Math.max(1, Number(searchParams.page) || 1);
  const { articles, totalPages } = await getVerticalArticlesPage('trade-quy', currentPage);

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col md:flex-row gap-8">
      <div className="flex-1 order-2 md:order-1">
        <h1 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3 uppercase">
          <span className="w-1 h-8 bg-primary rounded-full inline-block"></span>
          Trade quỹ
        </h1>

        {articles.length === 0 ? (
          <p className="text-text-secondary text-center py-20">
            {currentPage > 1 ? 'Không còn bài viết ở trang này.' : 'Chưa có bài viết nào được xuất bản.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link
                key={article.id}
                href={`/trade-quy/${article.slug}`}
                className="group block overflow-hidden rounded-xl border border-border bg-bg-secondary hover:border-primary/50 transition-colors"
              >
                <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-gray-800 to-gray-900">
                  {article.cover_image_url && (
                    <Image
                      src={article.cover_image_url}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                </div>
                <div className="p-6">
                  <h2 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  {article.meta_description && (
                    <p className="mt-2 text-sm text-text-secondary line-clamp-3">{article.meta_description}</p>
                  )}
                  {article.published_at && (
                    <p className="mt-4 text-xs text-text-secondary/70">
                      {new Date(article.published_at).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/trade-quy?page=${p}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-primary text-black'
                    : 'bg-bg-secondary border border-border text-foreground hover:border-primary'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>

      <aside className="w-full md:w-[280px] flex-shrink-0 order-1 md:order-2">
        <SidebarCategoryBanner />
      </aside>
    </div>
  );
}
