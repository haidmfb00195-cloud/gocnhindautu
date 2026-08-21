import CategorySidebar from '@/components/layout/CategorySidebar';
import ArticleCard from '@/components/ui/ArticleCard';
import Pagination from '@/components/ui/Pagination';

const MOCK_ARTICLES = Array.from({ length: 9 }).map((_, i) => ({
  id: i,
  title: `Bài viết phân tích chuyên sâu số ${i + 1}`,
  excerpt: 'Đây là mô tả ngắn của bài viết mẫu, mô phỏng nội dung hiển thị tối đa 2 dòng trên thẻ, giúp người đọc nắm bắt thông tin chính.',
  date: '04 Th08 2026',
  imageUrl: '',
  slug: `bai-viet-mau-${i + 1}`,
  categorySlug: 'trade-quy',
}));

export default function CategoryPage({ params, searchParams }: { params: { category: string }, searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const categoryNames: Record<string, string> = {
    'trade-quy': 'Trade quỹ',
    'san-giao-dich': 'Sàn giao dịch',
    'kien-thuc': 'Kiến thức',
  };

  const title = categoryNames[params.category] || 'Danh mục';

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col md:flex-row gap-8">
      <CategorySidebar />
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-8 text-foreground flex items-center gap-3 uppercase">
          <span className="w-1 h-8 bg-primary rounded-full inline-block"></span>
          {title}
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {MOCK_ARTICLES.map(article => (
            <ArticleCard key={article.id} {...article} categorySlug={params.category} />
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={5} basePath={`/${params.category}`} />
      </div>
    </div>
  );
}
