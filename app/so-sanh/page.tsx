import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'So sánh sàn Forex',
  description: 'So sánh chi tiết phí spread, hoa hồng, giấy phép và nạp rút giữa các sàn forex uy tín hàng đầu.',
};

async function getComparisons() {
  const supabase = createClient();
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('id, slug, broker_a_id, broker_b_id, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (!comparisons || comparisons.length === 0) return [];

  // Fetch unique broker IDs to get their metadata in one query
  const brokerIds = Array.from(
    new Set(comparisons.flatMap((c) => [c.broker_a_id, c.broker_b_id]))
  );

  const { data: brokers } = await supabase
    .from('brokers')
    .select('id, name, rating, slug')
    .in('id', brokerIds);

  const brokerMap = new Map(brokers?.map((b) => [b.id, b]) ?? []);

  return comparisons.map((c) => ({
    ...c,
    brokerA: brokerMap.get(c.broker_a_id),
    brokerB: brokerMap.get(c.broker_b_id),
  }));
}

export default async function SoSanhPage() {
  const comparisons = await getComparisons();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">So sánh sàn Forex</h1>
      <p className="text-gray-400 mb-10">
        Đối chiếu trực quan và chi tiết các cặp sàn giao dịch ngoại hối phổ biến nhất.
      </p>

      {comparisons.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Chưa có bài so sánh sàn nào.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((c) => (
            <Link
              key={c.id}
              href={`/so-sanh/${c.slug}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-emerald-500/50 transition-colors"
            >
              <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-4">
                So sánh {c.brokerA?.name ?? 'Sàn'} vs {c.brokerB?.name ?? 'Sàn'}
              </h2>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-950/50 rounded-lg p-3 text-center border border-gray-800/60">
                  <p className="text-xs text-gray-500 font-medium mb-1 truncate">{c.brokerA?.name}</p>
                  <p className="text-emerald-400 font-bold text-base">{c.brokerA?.rating ?? '—'}/10</p>
                </div>
                <div className="bg-gray-950/50 rounded-lg p-3 text-center border border-gray-800/60">
                  <p className="text-xs text-gray-500 font-medium mb-1 truncate">{c.brokerB?.name}</p>
                  <p className="text-emerald-400 font-bold text-base">{c.brokerB?.rating ?? '—'}/10</p>
                </div>
              </div>

              <p className="text-sm text-emerald-500 font-medium text-right">Xem chi tiết so sánh →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
