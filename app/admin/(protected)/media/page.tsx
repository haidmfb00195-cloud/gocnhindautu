'use client';

import { useState, useRef } from 'react';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface UploadedFile {
  url: string;
  key: string;
  name: string;
}

export default function AdminMediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadedFile[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Client-side validation (server also validates)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Chỉ chấp nhận: JPEG, PNG, WebP. File của bạn: ${file.type}`);
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

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Upload thất bại');
        return;
      }

      setUploaded((prev) => [
        { url: data.url, key: data.key, name: file.name },
        ...prev,
      ]);
    } catch (err) {
      setError('Lỗi kết nối — vui lòng thử lại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Media</h1>

      {/* Upload zone */}
      <div className="rounded-xl border-2 border-dashed border-gray-700 bg-gray-900 p-8 text-center mb-8 hover:border-emerald-500 transition-colors">
        <input
          ref={fileInputRef}
          id="media-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <button
          id="media-upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Đang upload...' : 'Chọn ảnh để upload'}
        </button>
        <p className="mt-3 text-sm text-gray-500">
          JPEG, PNG, WebP — tối đa {MAX_SIZE_MB}MB
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Uploaded files */}
      {uploaded.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Vừa upload</h2>
          <div className="space-y-3">
            {uploaded.map((file, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{file.url}</p>
                </div>
                <button
                  id={`copy-url-${i}`}
                  onClick={() => navigator.clipboard.writeText(file.url)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-colors flex-shrink-0"
                >
                  Copy URL
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
