'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteMessageButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Xóa tin nhắn từ "${name}"? Hành động này không thể hoàn tác.`)) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
    setDeleting(false);

    if (res.ok) {
      router.push('/admin/tin-nhan');
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error ?? 'Xóa thất bại');
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-800/50 hover:border-red-600/50 text-red-400 hover:text-red-300 px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
    >
      {deleting ? 'Đang xóa...' : 'Xóa tin nhắn'}
    </button>
  );
}
