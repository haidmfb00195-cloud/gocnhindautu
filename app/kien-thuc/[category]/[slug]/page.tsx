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

  return (data ?? []).map((a: any) => ({
    category: a.categories?.slug ?? 'chung',
    slug: a.slug,
  }));
}

async function getArticle(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, r2_key, published_at, updated_at, categories(slug, name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: 'Bài viết không tồn tại' };

  return {
    title: article.title,
    description: article.meta_description ?? undefined,
    openGraph: {
      title: article.title,
      description: article.meta_description ?? undefined,
      type: 'article',
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  // Fetch article HTML body from R2
  let htmlContent = '';
  try {
    const raw = await getFromR2(article.r2_key);
    // Sanitize HTML to prevent XSS — even though content was sanitized on write,
    // we also sanitize on read for defense in depth.
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h2','h3','h4','h5','h6','p','ul','ol','li','blockquote',
                     'strong','em','a','code','pre','img','table','thead','tbody',
                     'tr','td','th','br','hr','figure','figcaption'],
      ALLOWED_ATTR: ['href','src','alt','class','id','target','rel','title'],
    });
  } catch (err) {
    console.error('[ArticlePage] Failed to fetch content from R2:', err);
    htmlContent = '<p class="text-red-400">Không thể tải nội dung bài viết. Vui lòng thử lại sau.</p>';
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex gap-2">
        <a href="/kien-thuc" className="hover:text-white">Kiến thức</a>
        <span>/</span>
        {(article as any).categories?.name && (
          <>
            <a href={`/kien-thuc/${params.category}`} className="hover:text-white">
              {(article as any).categories.name}
            </a>
            <span>/</span>
          </>
        )}
        <span className="text-gray-400 truncate">{article.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
          {article.title}
        </h1>
        {article.published_at && (
          <time className="text-sm text-gray-500" dateTime={article.published_at}>
            Đăng ngày {new Date(article.published_at).toLocaleDateString('vi-VN', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            })}
          </time>
        )}
      </header>

      {/* Content from R2 */}
      <div
        className="prose prose-invert prose-emerald max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  );
}
