import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { deleteComparisonAction } from '@/lib/actions/comparisons';

export const metadata: Metadata = { title: 'Quản lý so sánh | Admin' };

async function getComparisons() {
  const supabase = createClient();
  const { data } = await supabase
    .from('comparisons')
    .select('id, slug, status, updated_at, broker_a_id, broker_b_id')
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export default async function AdminComparisonsPage() {
  const comparisons = await getComparisons();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">So sánh sàn</h1>
        <Link href="/admin/so-sanh/new" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
          + Tạo so sánh mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {comparisons.length === 0 ? (
          <p className="p-8 text-center text-gray-500">Chưa có bài so sánh nào.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Slug</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Trạng thái</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Cập nhật</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {comparisons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'published' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {c.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(c.updated_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/so-sanh/${c.slug}`}
                        target="_blank"
                        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Xem
                      </Link>
                      <Link
                        href={`/admin/so-sanh/${c.id}`}
                        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
                      >
                        Sửa
                      </Link>
                      <form action={deleteComparisonAction.bind(null, c.id) as any}>
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                          onClick={(e) => {
                            if (!confirm(`Xóa bài so sánh này?`)) e.preventDefault();
                          }}
                        >
                          Xóa
                        </button>
                      </form>
                    </div>
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
