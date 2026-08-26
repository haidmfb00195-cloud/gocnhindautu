'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ARTICLE_VERTICALS } from '@/lib/constants/article-verticals';

export function ArticleVerticalNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4 mb-6">
      {ARTICLE_VERTICALS.map((v) => {
        const active = pathname.startsWith(v.listPath);
        return (
          <Link
            key={v.slug}
            href={v.listPath}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'
            }`}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
