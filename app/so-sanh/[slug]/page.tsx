import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-static';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('comparisons')
    .select('slug')
    .eq('status', 'published');
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

async function getComparison(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('comparisons')
    .select('id, slug, r2_key, published_at, updated_at, broker_a_id, broker_b_id')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  if (!data) return null;

  // Fetch broker names separately (avoid *, only pick needed columns)
  const { data: brokerA } = await supabase
    .from('brokers')
    .select('name, slug, rating')
    .eq('id', data.broker_a_id)
    .single();
  const { data: brokerB } = await supabase
    .from('brokers')
    .select('name, slug, rating')
    .eq('id', data.broker_b_id)
    .single();

  return { ...data, brokerA, brokerB };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const comparison = await getComparison(params.slug);
  if (!comparison) return { title: 'So sánh không tồn tại' };
  const title = `So sánh ${comparison.brokerA?.name ?? ''} vs ${comparison.brokerB?.name ?? ''}`;
  return {
    title,
    description: `${title} — phân tích chi tiết điểm khác nhau về phí, spread, điều kiện giao dịch và uy tín.`,
  };
}

export default async function ComparisonPage({ params }: Props) {
  const comparison = await getComparison(params.slug);
  if (!comparison) notFound();

  let htmlContent = '';
  try {
    const raw = await getFromR2(comparison.r2_key);
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','table','thead','tbody',
                     'tr','td','th','strong','em','a','code','br','hr'],
      ALLOWED_ATTR: ['href','class','id','target','rel'],
    });
  } catch (err) {
    console.error('[ComparisonPage] R2 fetch error:', err);
  }

  return (
    <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-sm text-gray-500 mb-6">
        <span className="text-gray-400">So sánh sàn forex</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">
          So sánh {comparison.brokerA?.name} vs {comparison.brokerB?.name}
        </h1>

        {/* Quick comparison cards */}
        <div className="grid grid-cols-2 gap-4">
          {[comparison.brokerA, comparison.brokerB].map((broker, i) => broker && (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <p className="text-lg font-bold text-white">{broker.name}</p>
              {broker.rating !== null && (
                <p className="text-emerald-400 font-semibold mt-1">{broker.rating}/10</p>
              )}
              <a
                href={`/danh-gia-san/${broker.slug}`}
                className="mt-3 text-sm text-emerald-500 hover:text-emerald-400 block"
              >
                Xem đánh giá →
              </a>
            </div>
          ))}
        </div>
      </header>

      {htmlContent ? (
        <div
          className="prose prose-invert prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-gray-500">Không tải được nội dung so sánh.</p>
      )}
    </article>
  );
}
