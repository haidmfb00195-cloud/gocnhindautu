import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getFromR2 } from '@/lib/r2';
import { updateBrokerAction, deleteBrokerAction } from '@/lib/actions/brokers';

export const metadata: Metadata = { title: 'Chỉnh sửa sàn | Admin' };

interface Props {
  params: { id: string };
}

async function getBrokerForEdit(id: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, name, slug, rating, regulation_info, status, r2_key')
    .eq('id', id)
    .single();
  return data;
}

export default async function EditBrokerPage({ params }: Props) {
  const broker = await getBrokerForEdit(params.id);
  if (!broker) notFound();

  // Load current HTML content from R2 for editing
  let currentHtml = '';
  try {
    currentHtml = await getFromR2(broker.r2_key);
  } catch (err) {
    console.error('[EditBroker] Cannot load R2 content:', err);
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <a href="/admin/danh-gia-san" className="text-sm text-gray-400 hover:text-white">← Danh sách sàn</a>
          <h1 className="text-2xl font-bold text-white mt-2">Chỉnh sửa sàn</h1>
        </div>
        
        <form action={deleteBrokerAction.bind(null, broker.id) as any}>
          <button
            type="submit"
            className="rounded-lg bg-red-950/40 border border-red-900/50 hover:bg-red-900/30 text-red-400 px-4 py-2 text-sm font-semibold transition-colors"
            onClick={(e) => {
              if (!confirm(`Bạn chắc chắn muốn xóa sàn "${broker.name}"?`)) e.preventDefault();
            }}
          >
            Xóa sàn
          </button>
        </form>
      </div>

      <form action={updateBrokerAction as any} className="space-y-6">
        <input type="hidden" name="id" value={broker.id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">Tên sàn</label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              defaultValue={broker.name}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
            <input
              id="edit-slug"
              name="slug"
              type="text"
              required
              defaultValue={broker.slug}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-rating" className="block text-sm font-medium text-gray-300 mb-1">Điểm đánh giá (0-10)</label>
            <input
              id="edit-rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              defaultValue={broker.rating ?? ''}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-300 mb-1">Trạng thái</label>
            <select
              id="edit-status"
              name="status"
              defaultValue={broker.status}
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="edit-regulation" className="block text-sm font-medium text-gray-300 mb-1">Thông tin pháp lý / Giấy phép</label>
          <textarea
            id="edit-regulation"
            name="regulation_info"
            rows={3}
            defaultValue={broker.regulation_info ?? ''}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="edit-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung đánh giá (HTML)
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
            id="broker-update"
            type="submit"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Lưu thay đổi
          </button>
          <a
            href="/admin/danh-gia-san"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Hủy
          </a>
        </div>
      </form>
    </div>
  );
}
