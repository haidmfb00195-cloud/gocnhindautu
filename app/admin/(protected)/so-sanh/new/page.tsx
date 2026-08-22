import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { createComparisonAction } from '@/lib/actions/comparisons';

export const metadata: Metadata = { title: 'Tạo so sánh mới | Admin' };

async function getPublishedBrokers() {
  const supabase = createClient();
  const { data } = await supabase
    .from('brokers')
    .select('id, name')
    .eq('status', 'published')
    .order('name');
  return data ?? [];
}

export default async function NewComparisonPage() {
  const brokers = await getPublishedBrokers();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/so-sanh" className="text-sm text-gray-400 hover:text-white">← Danh sách so sánh</a>
        <h1 className="text-2xl font-bold text-white mt-2">Tạo so sánh mới</h1>
      </div>

      <form action={createComparisonAction as any} className="space-y-6">
        <div>
          <label htmlFor="comparison-slug" className="block text-sm font-medium text-gray-300 mb-1">
            Slug <span className="text-red-400">*</span>
          </label>
          <input
            id="comparison-slug"
            name="slug"
            type="text"
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="vi-du-exness-vs-xm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="broker-a" className="block text-sm font-medium text-gray-300 mb-1">
              Sàn A <span className="text-red-400">*</span>
            </label>
            <select
              id="broker-a"
              name="broker_a_id"
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="">-- Chọn sàn A --</option>
              {brokers.map((broker) => (
                <option key={broker.id} value={broker.id}>{broker.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="broker-b" className="block text-sm font-medium text-gray-300 mb-1">
              Sàn B <span className="text-red-400">*</span>
            </label>
            <select
              id="broker-b"
              name="broker_b_id"
              required
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
          <label htmlFor="comparison-status" className="block text-sm font-medium text-gray-300 mb-1">
            Trạng thái
          </label>
          <select
            id="comparison-status"
            name="status"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Xuất bản ngay</option>
          </select>
        </div>

        <div>
          <label htmlFor="comparison-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung so sánh (HTML) <span className="text-red-400">*</span>
            <span className="text-xs text-gray-500 ml-2">(HTML sẽ được sanitize tự động trước khi lưu)</span>
          </label>
          <textarea
            id="comparison-content"
            name="content_html"
            rows={20}
            required
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
            placeholder="<h2>So sánh phí giao dịch</h2>&#10;<table>...</table>"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="comparison-save"
            type="submit"
            name="status"
            value="draft"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Lưu nháp
          </button>
          <button
            id="comparison-publish"
            type="submit"
            name="status"
            value="published"
            className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
          >
            Xuất bản
          </button>
        </div>
      </form>
    </div>
  );
}
