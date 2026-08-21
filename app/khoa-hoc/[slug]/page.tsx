import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createStaticClient as createClient } from '@/lib/supabase/static';
import { getFromR2 } from '@/lib/r2';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-static';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published');
  return (data ?? []).map((a) => ({ slug: a.slug }));
}

async function getCourse(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('id, slug, title, meta_description, r2_key, published_at, updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourse(params.slug);
  if (!course) return { title: 'Khóa học không tồn tại' };
  return {
    title: course.title,
    description: course.meta_description ?? undefined,
  };
}

export default async function KhoaHocSlugPage({ params }: Props) {
  const course = await getCourse(params.slug);
  if (!course) notFound();

  let htmlContent = '';
  try {
    const raw = await getFromR2(course.r2_key);
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','strong','em','a','code','pre','br','hr'],
      ALLOWED_ATTR: ['href','class','id','target','rel'],
    });
  } catch (err) {
    console.error('[KhoaHocPage] R2 error:', err);
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/khoa-hoc" className="hover:text-white">Khóa học</a>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{course.title}</span>
      </nav>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">{course.title}</h1>
      {htmlContent ? (
        <div
          className="prose prose-invert prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-gray-500">Không tải được nội dung.</p>
      )}
    </article>
  );
}
