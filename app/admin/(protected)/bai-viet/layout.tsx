import { ArticleVerticalNav } from '@/components/admin/ArticleVerticalNav';

export default function BaiVietLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-8">
      <ArticleVerticalNav />
      {children}
    </div>
  );
}
