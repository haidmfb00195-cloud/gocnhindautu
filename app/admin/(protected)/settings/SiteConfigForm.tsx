'use client';
import { useEffect, useState } from 'react';

type Config = Record<string, string>;

async function uploadLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Upload thất bại');
  return data.url;
}

export function SiteConfigForm() {
  const [config, setConfig] = useState<Config>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    fetch('/api/admin/site-config')
      .then((r) => r.json())
      .then((d) => setConfig(d.config ?? {}));
  }, []);

  function updateConfig(key: string, value: string) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  async function saveSection(keys: string[]) {
    setSaving(keys.join(','));
    const updates = Object.fromEntries(keys.map((k) => [k, config[k] ?? '']));
    const res = await fetch('/api/admin/site-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    setSaving(null);
    if (!res.ok) alert('Lưu thất bại — thử lại nhé');
  }

  async function handleLogoUpload(file: File) {
    setLogoUploading(true);
    try {
      const url = await uploadLogo(file);
      updateConfig('logo_url', url);
      // Tự động lưu ngay sau upload
      const res = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: { logo_url: url } }),
      });
      if (!res.ok) alert('Upload thành công nhưng lưu URL thất bại');
    } catch (e: any) {
      alert(e.message ?? 'Upload logo thất bại');
    } finally {
      setLogoUploading(false);
    }
  }

  const contactKeys = ['contact_phone', 'contact_email', 'contact_address', 'facebook_url', 'zalo_url'];
  const contactSaving = saving === contactKeys.join(',');

  return (
    <div className="space-y-8">
      {/* Logo & Thương hiệu */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Logo & Thương hiệu</h2>
        <p className="text-sm text-gray-500 mb-5">Logo hiển thị trên Header và Footer toàn site.</p>

        <div className="flex items-center gap-6 mb-4">
          {config.logo_url ? (
            <img
              src={config.logo_url}
              alt="Logo hiện tại"
              className="h-14 max-w-[160px] object-contain rounded bg-gray-800 p-2 border border-gray-700"
            />
          ) : (
            <div className="h-14 w-32 rounded bg-gray-800 border border-dashed border-gray-600 flex items-center justify-center text-xs text-gray-500">
              Chưa có logo
            </div>
          )}
          <div>
            <label className="block text-sm text-white mb-2">Tải logo mới (PNG / SVG khuyến nghị)</label>
            <input
              type="file"
              accept="image/*"
              disabled={logoUploading}
              className="text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600 disabled:opacity-50"
              onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
            />
            {logoUploading && <p className="text-xs text-emerald-400 mt-1">Đang upload...</p>}
          </div>
        </div>

        <div className="mt-2">
          <label className="block text-sm text-gray-400 mb-1">Hoặc nhập URL logo trực tiếp</label>
          <input
            className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            value={config.logo_url ?? ''}
            onChange={(e) => updateConfig('logo_url', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <button
          onClick={() => saveSection(['logo_url'])}
          disabled={saving === 'logo_url'}
          className="mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 transition-colors"
        >
          {saving === 'logo_url' ? 'Đang lưu...' : 'Lưu logo'}
        </button>
      </div>

      {/* Thông tin liên hệ */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Thông tin liên hệ</h2>
        <p className="text-sm text-gray-500 mb-5">Hiển thị trên trang Liên hệ và Footer.</p>

        <div className="grid grid-cols-1 gap-4">
          {[
            { key: 'contact_email',   label: 'Email',         placeholder: 'admin@gocnhindautu.com' },
            { key: 'contact_phone',   label: 'Số điện thoại', placeholder: '+84 123 456 789' },
            { key: 'contact_address', label: 'Địa chỉ',       placeholder: 'Hà Nội, Việt Nam' },
            { key: 'facebook_url',    label: 'Facebook URL',  placeholder: 'https://facebook.com/...' },
            { key: 'zalo_url',        label: 'Zalo URL',      placeholder: 'https://zalo.me/...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm text-gray-300 mb-1">{label}</label>
              <input
                className="w-full rounded-lg bg-black/30 border border-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                value={config[key] ?? ''}
                onChange={(e) => updateConfig(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => saveSection(contactKeys)}
          disabled={contactSaving}
          className="mt-5 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-5 py-2 text-sm font-medium text-black disabled:opacity-50 transition-colors"
        >
          {contactSaving ? 'Đang lưu...' : 'Lưu thông tin liên hệ'}
        </button>
      </div>
    </div>
  );
}
