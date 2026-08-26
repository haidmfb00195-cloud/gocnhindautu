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
};

export function BannerSettings() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/banners')
      .then((r) => r.json())
      .then((d) => setBanners(d.banners ?? []));
  }, []);

  function update(id: string, patch: Partial<Banner>) {
    setBanners((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  async function save(b: Banner) {
    setSaving(b.id);
    await fetch('/api/admin/banners', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(b),
    });
    setSaving(null);
  }

  async function uploadQr(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    // Bỏ qua folder để dùng logic upload hiện tại của R2

    const res = await fetch('/api/admin/upload', { 
      method: 'POST', 
      body: formData 
    });
    const data = await res.json();
    return data.url; 
  }

  async function handleQrUpload(b: Banner, file: File) {
    try {
      const url = await uploadQr(file);
      update(b.id, { qr_image_url: url });
    } catch (error) {
      console.error('Lỗi upload ảnh QR:', error);
      alert('Không thể upload ảnh QR.');
    }
  }

  return (
    <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Banner Affiliate</h2>
      <p className="text-sm text-gray-400 mb-6">
        Quản lý các banner liên kết, mã khuyến mãi và QR code. Lưu thay đổi sẽ tự động xóa cache.
      </p>
      
      {banners.length === 0 && <p className="text-sm text-gray-500">Đang tải...</p>}
      
      {banners.map((b) => (
        <div key={b.id} className="mb-6 border-b border-gray-800 pb-6 last:border-0">
          <p className="text-sm text-gray-400 mb-2">Slug: <span className="text-emerald-400 font-mono">{b.slug}</span></p>

          <label className="block text-sm text-white mb-1">Link affiliate</label>
          <input
            className="w-full mb-3 rounded bg-black/30 border border-gray-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            value={b.affiliate_link}
            onChange={(e) => update(b.id, { affiliate_link: e.target.value })}
          />

          <label className="block text-sm text-white mb-1">Mã khuyến mãi (promo code)</label>
          <input
            className="w-full mb-3 rounded bg-black/30 border border-gray-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            value={b.promo_code ?? ''}
            onChange={(e) => update(b.id, { promo_code: e.target.value })}
          />

          <label className="block text-sm text-white mb-1">QR Code</label>
          <div className="flex items-center gap-4 mb-4">
            {b.qr_image_url && (
              <img src={b.qr_image_url} alt="QR" className="w-20 h-20 rounded bg-white object-contain" />
            )}
            <input
              type="file"
              accept="image/*"
              className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700"
              onChange={(e) => e.target.files?.[0] && handleQrUpload(b, e.target.files[0])}
            />
          </div>

          <button
            onClick={() => save(b)}
            disabled={saving === b.id}
            className="rounded bg-emerald-500 hover:bg-emerald-600 transition-colors px-4 py-2 text-black font-medium disabled:opacity-50"
          >
            {saving === b.id ? 'Đang lưu...' : 'Lưu banner'}
          </button>
        </div>
      ))}
    </div>
  );
}
