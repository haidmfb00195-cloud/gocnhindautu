import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import { updateComparisonAction, deleteComparisonAction } from '@/lib/actions/comparisons';
import DeleteButton from '@/components/admin/DeleteButton';

export const metadata: Metadata = { title: 'Chỉnh sửa so sánh | Admin' };

interface Props {
  params: { id: string };
}

async function getComparisonForEdit(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('comparisons')
    .select('id, slug, broker_a_id, broker_b_id, status, r2_key')
    .eq('id', id)
    .single();
  return data;
}

async function getPublishedBrokers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, name')
    .eq('status', 'published')
    .order('name');
  return data ?? [];
}

export default async function EditComparisonPage({ params }: Props) {
  const [comparison, brokers] = await Promise.all([
    getComparisonForEdit(params.id),
    getPublishedBrokers(),
  ]);

  if (!comparison) notFound();

  // Load current HTML content from R2 for editing
  let currentHtml = '';
  try {
    currentHtml = await getFromR2(comparison.r2_key);
  } catch (err) {
    console.error('[EditComparison] Cannot load R2 content:', err);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <a href="/admin/so-sanh" className="text-sm text-gray-400 hover:text-white">← Danh sách so sánh</a>
          <h1 className="text-2xl font-bold text-white mt-2">Chỉnh sửa so sánh</h1>
        </div>

        <DeleteButton
          action={deleteComparisonAction.bind(null, comparison.id) as any}
          confirmMessage="Bạn chắc chắn muốn xóa bài so sánh này?"
          label="Xóa so sánh"
        />
      </div>

      <form action={updateComparisonAction as any} className="space-y-6">
        <input type="hidden" name="id" value={comparison.id} />

        <div>
          <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
          <input
            id="edit-slug"
            name="slug"
            type="text"
            required
            defaultValue={comparison.slug}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-broker-a" className="block text-sm font-medium text-gray-300 mb-1">Sàn A</label>
            <select
              id="edit-broker-a"
              name="broker_a_id"
              required
              defaultValue={comparison.broker_a_id}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn sàn A --</option>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>{broker.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="edit-broker-b" className="block text-sm font-medium text-gray-300 mb-1">Sàn B</label>
            <select
              id="edit-broker-b"
              name="broker_b_id"
              required
              defaultValue={comparison.broker_b_id}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn sàn B --</option>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>{broker.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
          <select
            id="edit-status"
            name="status"
            defaultValue={comparison.status}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
          </select>
        </div>

        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung so sánh (HTML)
            <span className="text-xs text-gray-500 ml-2">(HTML sẽ được sanitize tự động)</span>
          </label>
          <textarea
            id="edit-content"
            name="content_html"
            rows={20}
            defaultValue={currentHtml}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="comparison-update"
            type="submit"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Lưu thay đổi
          </button>
          <a
            href="/admin/so-sanh"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Hủy
          </a>
        </div>
      </form>
    </div>
  );
}
