'use client';
import { useEffect, useState } from 'react';

type Banner = {
  id: string;
  placement: string | null;
  title: string;
  subtitle: string | null;
  affiliate_link: string;
  promo_code: string | null;
  qr_image_url: string | null;
  cta_text: string;
  is_active: boolean;
  sort_order: number;
};

// 3 vị trí cố định trên site. Chọn 1 vị trí ở đây, banner sẽ tự hiện đúng chỗ đó
// trên website — không cần biết slug/code kỹ thuật gì cả.
const PLACEMENTS: { value: string; label: string; hint: string; singleton: boolean }[] = [
  {
    value: 'header_cta',
    label: 'Nút CTA góc phải Header',
    hint: 'Nút "ĐĂNG KÝ NGAY" luôn hiện trên mọi trang, góc trên bên phải.',
    singleton: true,
  },
  {
    value: 'home_horizontal',
    label: 'Thanh ngang giữa trang chủ',
    hint: 'Thanh đen nằm ngang bên dưới bài viết nổi bật ở trang chủ.',
    singleton: true,
  },
  {
    value: 'homepage_grid',
    label: 'Lưới "Quỹ & Sàn giao dịch nổi bật"',
    hint: 'Có thể thêm nhiều banner cùng lúc ở đây (mỗi banner 1 card trong lưới), dùng "Thứ tự hiển thị" để sắp xếp.',
    singleton: false,
  },
  {
    value: 'sidebar_category',
    label: 'Sidebar trang Trade quỹ / Sàn giao dịch',
    hint: 'Card banner bên phải danh sách bài viết ở trang Trade quỹ và Sàn giao dịch.',
    singleton: true,
  },
];

function placementLabel(value: string | null) {
  return PLACEMENTS.find((p) => p.value === value)?.label ?? 'Chưa gán vị trí';
}

const emptyBanner: Omit<Banner, 'id'> = {
  placement: '',
  title: '',
  subtitle: '',
  affiliate_link: '',
  promo_code: '',
  qr_image_url: null,
  cta_text: 'ĐĂNG KÝ NGAY',
  is_active: true,
  sort_order: 0,
};

async function uploadQr(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload QR thất bại');
  return data.url;
}

export function BannerSettings() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBanner, setNewBanner] = useState({ ...emptyBanner });
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    const res = await fetch('/api/admin/banners');
    const data = await res.json();
    setBanners(data.banners ?? []);
  }

  function updateBanner(id: string, patch: Partial<Banner>) {
    setBanners((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function saveBanner(b: Banner) {
    setSaving(b.id);
    const res = await fetch('/api/admin/banners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    setSaving(null);
    if (!res.ok) {
      const d = await res.json();
      alert(d.error ?? 'Lưu thất bại');
    } else {
      setEditingId(null);
      await loadBanners(); // tải lại để thấy banner cũ cùng vị trí đã tự tắt (nếu có)
    }
  }

  async function deleteBanner(id: string, title: string) {
    if (!confirm(`Xóa banner "${title}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(id);
    const res = await fetch('/api/admin/banners', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setDeleting(null);
    if (res.ok) {
      setBanners((bs) => bs.filter((b) => b.id !== id));
    } else {
      const d = await res.json();
      alert(d.error ?? 'Xóa thất bại');
    }
  }

  async function handleQrUpload(id: string, file: File) {
    try {
      const url = await uploadQr(file);
      updateBanner(id, { qr_image_url: url });
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function handleNewQrUpload(file: File) {
    try {
      const url = await uploadQr(file);
      setNewBanner((b) => ({ ...b, qr_image_url: url }));
    } catch (e: any) {
      alert(e.message);
    }
  }

  async function createBanner() {
    if (!newBanner.placement || !newBanner.title || !newBanner.affiliate_link) {
      alert('Vui lòng chọn Vị trí hiển thị, và điền Tiêu đề, Link affiliate');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBanner),
    });
    setCreating(false);
    if (res.ok) {
      await loadBanners();
      setNewBanner({ ...emptyBanner });
      setShowNewForm(false);
    } else {
      const d = await res.json();
      alert(d.error ?? 'Tạo banner thất bại');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Banner Affiliate</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Chọn vị trí hiển thị cho từng banner — thay đổi sẽ tự cập nhật trên site.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm((v) => !v)}
          className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-black transition-colors"
        >
          {showNewForm ? '✕ Hủy' : '+ Thêm mới'}
        </button>
      </div>

      {/* Form tạo mới */}
      {showNewForm && (
        <div className="rounded-xl border border-emerald-500/30 bg-gray-900 p-5">
          <h3 className="text-sm font-semibold text-emerald-400 mb-4">Banner mới</h3>
          <BannerForm
            data={newBanner}
            onChange={(patch) => setNewBanner((b) => ({ ...b, ...patch }))}
            onQrUpload={handleNewQrUpload}
          />
          <button
            onClick={createBanner}
            disabled={creating}
            className="mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 transition-colors"
          >
            {creating ? 'Đang tạo...' : 'Tạo banner'}
          </button>
        </div>
      )}

      {/* Danh sách banner */}
      {banners.length === 0 && !showNewForm && (
        <p className="text-center text-gray-500 py-10 text-sm">Chưa có banner nào. Bấm "+ Thêm mới" để tạo.</p>
      )}

      {banners.map((b) => (
        <div key={b.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-white">{b.title}</p>
              <p className="text-xs text-emerald-400 mt-0.5">{placementLabel(b.placement)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-700 text-gray-400'}`}>
                {b.is_active ? 'Đang hiện' : 'Đã ẩn'}
              </span>
              <button
                onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1 rounded-lg transition-colors"
              >
                {editingId === b.id ? 'Thu gọn' : 'Sửa'}
              </button>
              <button
                onClick={() => deleteBanner(b.id, b.title)}
                disabled={deleting === b.id}
                className="text-xs text-red-400 hover:text-red-300 border border-red-800/50 hover:border-red-600/50 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                {deleting === b.id ? '...' : 'Xóa'}
              </button>
            </div>
          </div>

          {editingId === b.id && (
            <>
              <BannerForm
                data={b}
                onChange={(patch) => updateBanner(b.id, patch)}
                onQrUpload={(file) => handleQrUpload(b.id, file)}
              />
              <button
                onClick={() => saveBanner(b)}
                disabled={saving === b.id}
                className="mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 transition-colors"
              >
                {saving === b.id ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// Sub-component form field dùng chung cho tạo mới và chỉnh sửa
type BannerData = Omit<Banner, 'id'> | Banner;

function BannerForm({
  data,
  onChange,
  onQrUpload,
}: {
  data: any;
  onChange: (patch: Partial<BannerData>) => void;
  onQrUpload: (file: File) => void;
}) {
  const selected = PLACEMENTS.find((p) => p.value === data.placement);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Vị trí hiển thị <span className="text-red-400">*</span></label>
        <select
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.placement ?? ''}
          onChange={(e) => onChange({ placement: e.target.value })}
        >
          <option value="" disabled>— Chọn vị trí —</option>
          {PLACEMENTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        {selected && (
          <p className="text-xs text-gray-500 mt-1">
            {selected.hint}
            {selected.singleton && ' Bật banner này sẽ tự động tắt banner khác đang ở cùng vị trí.'}
          </p>
        )}
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Tiêu đề <span className="text-red-400">*</span></label>
        <input
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.title ?? ''}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="MỞ TÀI KHOẢN FTMO"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Mô tả ngắn</label>
        <input
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.subtitle ?? ''}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Nhận ngay chiết khấu 10%"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-400 mb-1">Link Affiliate <span className="text-red-400">*</span></label>
        <input
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.affiliate_link ?? ''}
          onChange={(e) => onChange({ affiliate_link: e.target.value })}
          placeholder="https://ftmo.com/?affiliate=xxxx"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Mã khuyến mãi</label>
        <input
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.promo_code ?? ''}
          onChange={(e) => onChange({ promo_code: e.target.value })}
          placeholder="GOCNHINDAUTU10"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-400 mb-1">Text nút CTA</label>
        <input
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.cta_text ?? ''}
          onChange={(e) => onChange({ cta_text: e.target.value })}
          placeholder="ĐĂNG KÝ NGAY"
        />
      </div>
      {data.placement === 'homepage_grid' && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Thứ tự hiển thị</label>
          <input
            type="number"
            className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            value={data.sort_order ?? 0}
            onChange={(e) => onChange({ sort_order: parseInt(e.target.value, 10) || 0 })}
          />
          <p className="text-xs text-gray-500 mt-1">Số nhỏ hơn hiện trước. Chỉ áp dụng cho lưới nhiều banner.</p>
        </div>
      )}
      <div className="flex items-center gap-3 pt-5">
        <input
          id={`active-${data.id ?? 'new'}`}
          type="checkbox"
          checked={data.is_active ?? true}
          onChange={(e) => onChange({ is_active: e.target.checked })}
          className="w-4 h-4 rounded accent-emerald-500"
        />
        <label htmlFor={`active-${data.id ?? 'new'}`} className="text-sm text-gray-300 cursor-pointer">
          Hiển thị trên site
        </label>
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-400 mb-1">
          {data.placement === 'homepage_grid' ? 'Logo' : 'QR Code'}
        </label>
        <div className="flex items-center gap-4">
          {data.qr_image_url && (
            <img src={data.qr_image_url} alt={data.placement === 'homepage_grid' ? 'Logo' : 'QR'} className="w-16 h-16 rounded bg-white object-contain border border-gray-600" />
          )}
          <input
            type="file"
            accept="image/*"
            className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            onChange={(e) => e.target.files?.[0] && onQrUpload(e.target.files[0])}
          />
        </div>
        {data.placement === 'homepage_grid' && (
          <p className="text-xs text-gray-500 mt-1">Nên dùng ảnh logo nền trong suốt (PNG) để hiển thị đẹp trong lưới.</p>
        )}
      </div>
    </div>
  );
}
