'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface SidebarArticle {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  imageUrl: string;
}

export default function SidebarLatestPopular() {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');
  const [articles, setArticles] = useState<SidebarArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const supabase = createClient();
      // NOTE: "Xem nhiều" hiện tạm dùng chung thứ tự với "Mới nhất" vì
      // chưa có bảng tracking lượt xem. Khi có analytics/view_count thật,
      // đổi query của tab 'popular' để order theo đó thay vì published_at.
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, cover_image_url, categories(slug)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(4);

      if (!cancelled) {
        setArticles(
          (data ?? []).map((a: any) => ({
            id: a.id,
            title: a.title,
            slug: a.slug,
            categorySlug: a.categories?.slug ?? 'kien-thuc',
            imageUrl: a.cover_image_url ?? '',
          }))
        );
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4 border-b border-border">
        <button
          className={`pb-2 font-bold text-sm uppercase transition-colors ${activeTab === 'latest' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-foreground'}`}
          onClick={() => setActiveTab('latest')}
        >
          Mới nhất
        </button>
        <button
          className={`pb-2 font-bold text-sm uppercase transition-colors ${activeTab === 'popular' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-foreground'}`}
          onClick={() => setActiveTab('popular')}
        >
          Xem nhiều
        </button>
      </div>
      <div className="flex flex-col gap-4 pt-2">
        {loading && <p className="text-xs text-text-tertiary">Đang tải...</p>}
        {!loading && articles.length === 0 && (
          <p className="text-xs text-text-tertiary">Chưa có bài viết nào.</p>
        )}
        {articles.map((article) => (
          <Link key={article.id} href={`/kien-thuc/${article.categorySlug}/${article.slug}`} className="flex gap-3 group">
            <div className="w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-background-secondary border border-border">
              {article.imageUrl ? (
                <Image src={article.imageUrl} alt={article.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-tertiary text-xs font-bold bg-gradient-dark-card text-white/20">
                  IMG
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
