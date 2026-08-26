import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient as createClient } from '@/lib/supabase/static';
import { getFromR2 } from '@/lib/r2';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-static';

interface Props {
  params: { category: string; slug: string };
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('slug, categories(slug)')
    .eq('status', 'published');
  return (data ?? [])
    .filter((a: any) => a.categories?.slug)
    .map((a: any) => ({ category: a.categories.slug, slug: a.slug }));
}

async function getArticle(category: string, slug: string) {
  const supabase = createClient();
  
  // Lần 1: Cố gắng lấy bài viết match chính xác cả slug và category
  const { data } = await supabase
    .from('articles')
    .select(
      'id, title, slug, r2_key, meta_description, keywords, cover_image_url, published_at, updated_at, categories!inner(slug, name)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('categories.slug', category)
    .maybeSingle();

  if (data) return data;

  // Lần 2 (Fallback): Nếu không tìm thấy (do sai category trên URL, ví dụ: 'chung' hoặc 'kien-thuc'),
  // ta chỉ tìm theo slug bài viết. Điều này giúp link không bị 404 dù DB có gán category lỗi.
  const { data: fallbackData } = await supabase
    .from('articles')
    .select(
      'id, title, slug, r2_key, meta_description, keywords, cover_image_url, published_at, updated_at, categories(slug, name)'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  return fallbackData;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.category, params.slug);
  if (!article) return { title: 'Bài viết không tồn tại' };

  return {
    title: article.title,
    description: article.meta_description ?? undefined,
    keywords: article.keywords
      ? article.keywords.split(',').map((k: string) => k.trim())
      : undefined,
    openGraph: {
      title: article.title,
      description: article.meta_description ?? undefined,
      images: article.cover_image_url ? [article.cover_image_url] : undefined,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.category, params.slug);
  if (!article) notFound();

  let htmlContent = '';
  try {
    const raw = await getFromR2(article.r2_key);
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                     'strong','em','a','code','pre','img','table','thead','tbody',
                     'tr','td','th','br','hr','figure','figcaption'],
      ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
    });
  } catch (err) {
    console.error('[ArticlePage] R2 fetch error:', err);
  }

  const categoryName = (article as any).categories?.name;

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      {categoryName && (
        <nav className="text-sm text-text-secondary mb-6">
          <span>{categoryName}</span>
        </nav>
      )}

      {article.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt={article.title}
          className="w-full rounded-xl mb-8 aspect-[16/9] object-cover"
        />
      )}

      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-6">
        {article.title}
      </h1>

      {htmlContent ? (
        <div
          className="prose prose-invert prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-text-secondary">Không tải được nội dung bài viết.</p>
      )}
    </article>
  );
}
