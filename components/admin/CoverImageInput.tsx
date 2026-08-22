'use client';

import { useRef, useState } from 'react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface CoverImageInputProps {
  /** name of the hidden form field the Server Action reads on submit */
  name: string;
  defaultValue?: string;
}

export default function CoverImageInput({ name, defaultValue = '' }: CoverImageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Chỉ chấp nhận JPEG, PNG, WebP. File của bạn: ${file.type}`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File quá lớn: ${(file.size / 1024 / 1024).toFixed(1)}MB. Tối đa ${MAX_SIZE_MB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload thất bại');
        return;
      }
      setUrl(data.url);
    } catch {
      setError('Lỗi kết nối — vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input type="hidden" name={name} value={url} readOnly />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-gray-400 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-400 file:cursor-pointer disabled:opacity-50"
      />
      {uploading && <p className="text-xs text-gray-500 mt-2">Đang upload...</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      {url && !uploading && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Ảnh bìa" className="mt-3 w-full max-w-xs rounded-lg border border-gray-800" />
      )}
    </div>
  );
}
