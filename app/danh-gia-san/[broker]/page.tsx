import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-static';

interface Props {
  params: { broker: string };
}

export async function generateStaticParams() {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('slug')
    .eq('status', 'published');
  return (data ?? []).map((b) => ({ broker: b.slug }));
}

async function getBroker(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, slug, name, rating, regulation_info, r2_key, published_at, updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const broker = await getBroker(params.broker);
  if (!broker) return { title: 'Sàn không tồn tại' };
  return {
    title: `Review ${broker.name} — Đánh giá chi tiết`,
    description: `Đánh giá chi tiết sàn ${broker.name}: ưu nhược điểm, điều kiện giao dịch, tính pháp lý và so sánh với các sàn khác.`,
  };
}

export default async function BrokerPage({ params }: Props) {
  const broker = await getBroker(params.broker);
  if (!broker) notFound();

  let htmlContent = '';
  try {
    const raw = await getFromR2(broker.r2_key);
    htmlContent = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['h2','h3','h4','p','ul','ol','li','blockquote','strong','em',
                     'a','code','pre','img','table','thead','tbody','tr','td','th','br','hr'],
      ALLOWED_ATTR: ['href','src','alt','class','id','target','rel'],
    });
  } catch (err) {
    console.error('[BrokerPage] R2 fetch error:', err);
  }

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <nav className="text-sm text-gray-500 mb-6">
        <a href="/danh-gia-san" className="hover:text-white">Đánh giá sàn</a>
        <span className="mx-2">/</span>
        <span className="text-gray-400">{broker.name}</span>
      </nav>

      <header className="mb-10">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{broker.name}</h1>
          {broker.rating !== null && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-4 py-2">
              <span className="text-3xl font-bold text-emerald-400">{broker.rating}</span>
              <span className="text-sm text-gray-400">/10</span>
            </div>
          )}
        </div>
        {broker.regulation_info && (
          <p className="mt-3 text-sm text-gray-400">🏛 {broker.regulation_info}</p>
        )}
        {broker.published_at && (
          <p className="mt-2 text-xs text-gray-600">
            Cập nhật: {new Date(broker.updated_at).toLocaleDateString('vi-VN')}
          </p>
        )}
      </header>

      {htmlContent ? (
        <div
          className="prose prose-invert prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      ) : (
        <p className="text-gray-500">Đang tải nội dung đánh giá...</p>
      )}
    </article>
  );
}
