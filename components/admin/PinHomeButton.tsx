'use client';

import { useTransition } from 'react';
import { pinArticleHomeAction } from '@/lib/actions/articles';

export default function PinHomeButton({
  articleId,
  isPinned,
}: {
  articleId: string;
  isPinned: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handlePin() {
    if (isPinned) return;
    if (!confirm('Đặt bài viết này làm bài hiển thị đầu trang chủ? Bài đang ghim sẽ bị thay thế.')) return;

    startTransition(async () => {
      const result = await pinArticleHomeAction(articleId);
      if (result?.error) alert(result.error);
    });
  }

  if (isPinned) {
    return (
      <span className="text-xs text-amber-400 px-2 py-1 border border-amber-500/30 rounded-lg">
        ✓ Đầu trang chủ
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePin}
      disabled={pending}
      className="text-xs text-gray-400 hover:text-amber-400 transition-colors px-2 py-1 rounded hover:bg-gray-700 border border-gray-700 hover:border-amber-500/30 disabled:opacity-50 whitespace-nowrap"
    >
      {pending ? '...' : 'Đặt làm bài đầu trang'}
    </button>
  );
}
