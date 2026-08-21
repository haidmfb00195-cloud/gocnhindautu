import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Quản lý đánh giá sàn | Admin' };

async function getBrokers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, name, slug, rating, status, updated_at')
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export default async function AdminBrokersPage() {
  const brokers = await getBrokers();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Đánh giá sàn</h1>
        <Link href="/admin/danh-gia-san/new" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
          + Thêm sàn mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {brokers.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Chưa có sàn nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Tên sàn</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Rating</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Cập nhật</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {brokers.map((broker) => (
                <tr key={broker.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{broker.name}</span>
                    <span className="text-gray-500 text-xs block">{broker.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-semibold">
                    {broker.rating !== null ? `${broker.rating}/10` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      broker.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {broker.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(broker.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/danh-gia-san/${broker.id}`} className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors">
                      Sửa
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
