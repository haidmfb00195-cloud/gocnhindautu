import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient } from '@/lib/supabase/static';
import { getVerticalArticleBySlug } from '@/lib/data/vertical-articles';
import { getFromR2 } from '@/lib/r2';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-static';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('articles')
    .select('slug, categories!inner(type)')
    .eq('status', 'published')
    .eq('categories.type', 'trade-quy');
  return (data ?? []).map((a: any) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getVerticalArticleBySlug('trade-quy', params.slug);
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

export default async function TradeQuyArticlePage({ params }: Props) {
  const article = await getVerticalArticleBySlug('trade-quy', params.slug);
  if (!article) notFound();

  let htmlContent = '';
  try {
    const raw = await getFromR2((article as any).r2_key);
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                     'strong','em','a','code','pre','img','table','thead','tbody',
                     'tr','td','th','br','hr','figure','figcaption'],
      ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
    });
  } catch (err) {
    console.error('[TradeQuyArticlePage] R2 fetch error:', err);
  }

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-sm text-text-secondary mb-6">
        <span>Trade quỹ</span>
      </nav>

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
