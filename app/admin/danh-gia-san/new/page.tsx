import type { Metadata } from 'next';
import { createBrokerAction } from '@/lib/actions/brokers';

export const metadata: Metadata = { title: 'Thêm sàn mới | Admin' };

export default function NewBrokerPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <a href="/admin/danh-gia-san" className="text-sm text-gray-400 hover:text-white">← Danh sách sàn</a>
        <h1 className="text-2xl font-bold text-white mt-2">Thêm sàn mới</h1>
      </div>

      <form action={createBrokerAction as any} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="broker-name" className="block text-sm font-medium text-gray-300 mb-1">
              Tên sàn <span className="text-red-400">*</span>
            </label>
            <input
              id="broker-name"
              name="name"
              type="text"
              required
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Ví dụ: Exness"
            />
          </div>
          <div>
            <label htmlFor="broker-slug" className="block text-sm font-medium text-gray-300 mb-1">
              Slug <span className="text-red-400">*</span>
            </label>
            <input
              id="broker-slug"
              name="slug"
              type="text"
              required
              pattern="[a-z0-9-]+"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="exness"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="broker-rating" className="block text-sm font-medium text-gray-300 mb-1">
              Điểm đánh giá (0-10)
            </label>
            <input
              id="broker-rating"
              name="rating"
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Ví dụ: 8.5"
            />
          </div>
          <div>
            <label htmlFor="broker-status" className="block text-sm font-medium text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              id="broker-status"
              name="status"
              className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="draft">Bản nháp</option>
              <option value="published">Xuất bản ngay</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="broker-regulation" className="block text-sm font-medium text-gray-300 mb-1">
            Thông tin pháp lý / Giấy phép
          </label>
          <textarea
            id="broker-regulation"
            name="regulation_info"
            rows={3}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            placeholder="Ví dụ: Được cấp phép bởi FCA (Vương Quốc Anh), CySEC (Síp), FSC..."
          />
        </div>

        <div>
          <label htmlFor="broker-content" className="block text-sm font-medium text-gray-300 mb-1">
            Nội dung đánh giá (HTML) <span className="text-red-400">*</span>
            <span className="text-xs text-gray-500 ml-2">(HTML sẽ được sanitize tự động trước khi lưu)</span>
          </label>
          <textarea
            id="broker-content"
            name="content_html"
            rows={20}
            required
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none font-mono text-sm resize-y"
            placeholder="<h2>Giới thiệu sàn</h2>&#10;<p>Thông tin chi tiết về spread, commission...</p>"
          />
        </div>

        <div className="flex gap-3">
          <button
            id="broker-save"
            type="submit"
            name="status"
            value="draft"
            className="rounded-lg border border-gray-600 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-400 hover:text-white transition-colors"
          >
            Lưu nháp
          </button>
          <button
            id="broker-publish"
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
