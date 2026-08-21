import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Đánh giá sàn Forex',
  description: 'Review và đánh giá chi tiết các sàn forex uy tín: Exness, XM, IC Markets, Pepperstone và nhiều sàn khác.',
};

async function getBrokers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, slug, name, rating, regulation_info')
    .eq('status', 'published')
    .order('rating', { ascending: false });
  return data ?? [];
}

export default async function DanhGiaSanPage() {
  const brokers = await getBrokers();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Đánh giá sàn Forex</h1>
      <p className="text-gray-400 mb-10">
        Review chi tiết, khách quan về các sàn forex — cập nhật thường xuyên.
      </p>

      {brokers.length === 0 ? (
        <p className="text-gray-500 text-center py-20">Chưa có đánh giá sàn nào.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {brokers.map((broker) => (
            <Link
              key={broker.id}
              href={`/danh-gia-san/${broker.slug}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-emerald-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {broker.name}
                </h2>
                {broker.rating !== null && (
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-emerald-400">{broker.rating}</span>
                    <span className="text-xs text-gray-500">/10</span>
                  </div>
                )}
              </div>
              {broker.regulation_info && (
                <p className="text-sm text-gray-400 line-clamp-2">{broker.regulation_info}</p>
              )}
              <p className="mt-4 text-sm text-emerald-500 font-medium">Xem đánh giá đầy đủ →</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
