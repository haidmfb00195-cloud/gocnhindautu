'use client';
import { useEffect, useState } from 'react';

type Banner = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  affiliate_link: string;
  promo_code: string | null;
  qr_image_url: string | null;
  cta_text: string;
  is_active: boolean;
  sort_order: number;
};

const emptyBanner: Omit<Banner, 'id'> = {
  slug: '',
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
    if (!newBanner.slug || !newBanner.title || !newBanner.affiliate_link) {
      alert('Vui lòng điền Slug, Tiêu đề và Link affiliate');
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
          <p className="text-sm text-gray-500 mt-0.5">Quản lý các banner quảng cáo — thay đổi sẽ tự cập nhật trên site.</p>
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
            isNew
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
              <p className="text-xs text-emerald-400 font-mono mt-0.5">{b.slug}</p>
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
  isNew = false,
}: {
  data: any;
  onChange: (patch: Partial<BannerData>) => void;
  onQrUpload: (file: File) => void;
  isNew?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {isNew && (
        <div>
          <label className="block text-xs text-gray-400 mb-1">Slug <span className="text-red-400">*</span></label>
          <input
            className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            value={data.slug ?? ''}
            onChange={(e) => onChange({ slug: e.target.value })}
            placeholder="ftmo-sidebar"
          />
        </div>
      )}
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
      <div>
        <label className="block text-xs text-gray-400 mb-1">Thứ tự hiển thị</label>
        <input
          type="number"
          className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
          value={data.sort_order ?? 0}
          onChange={(e) => onChange({ sort_order: parseInt(e.target.value, 10) || 0 })}
        />
      </div>
      <div className="flex items-center gap-3 pt-5">
        <input
          id={`active-${data.slug}`}
          type="checkbox"
          checked={data.is_active ?? true}
          onChange={(e) => onChange({ is_active: e.target.checked })}
          className="w-4 h-4 rounded accent-emerald-500"
        />
        <label htmlFor={`active-${data.slug}`} className="text-sm text-gray-300 cursor-pointer">
          Hiển thị trên site
        </label>
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs text-gray-400 mb-1">QR Code</label>
        <div className="flex items-center gap-4">
          {data.qr_image_url && (
            <img src={data.qr_image_url} alt="QR" className="w-16 h-16 rounded bg-white object-contain border border-gray-600" />
          )}
          <input
            type="file"
            accept="image/*"
            className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            onChange={(e) => e.target.files?.[0] && onQrUpload(e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}
