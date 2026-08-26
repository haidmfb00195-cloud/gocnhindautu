import Image from 'next/image';
import Link from 'next/link';
import { createStaticClient as createClient } from '@/lib/supabase/static';
import { getArticlePublicPath } from '@/lib/constants/article-verticals';

async function getPinnedArticle() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, slug, meta_description, cover_image_url, categories(slug, type)')
    .eq('status', 'published')
    .eq('is_pinned_home', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export default async function HeroBanner() {
  const article = await getPinnedArticle();

  if (!article) {
    return (
      <div className="relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden border border-border bg-background-secondary flex items-center justify-center">
        <p className="text-text-secondary text-sm px-6 text-center">
          Chưa có bài viết được ghim đầu trang. Vào Admin → Bài viết → chọn &quot;Đặt làm bài đầu trang&quot;.
        </p>
      </div>
    );
  }

  const vertical = article.categories?.type ?? 'kien-thuc';
  const href = getArticlePublicPath(
    vertical as 'kien-thuc' | 'trade-quy' | 'san-giao-dich',
    article.slug,
    article.categories?.slug
  );

  const imageUrl = article.cover_image_url
    ?? 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200';

  return (
    <Link href={href} className="group block relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden border border-border">
      <Image
        src={imageUrl}
        alt={article.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        unoptimized={imageUrl.startsWith('http')}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
        <div className="bg-primary text-black font-bold text-xs uppercase px-3 py-1 rounded-full w-max mb-3">
          TIN TỨC NỔI BẬT
        </div>
        <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        {article.meta_description && (
          <p className="text-gray-300 line-clamp-2 md:text-lg">
            {article.meta_description}
          </p>
        )}
      </div>
    </Link>
  );
}
