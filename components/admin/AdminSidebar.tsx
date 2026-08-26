'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
  badgeKey?: 'messages';
};

const adminNav: NavItem[] = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/bai-viet/kien-thuc', label: '📝 Bài viết' },
  { href: '/admin/settings', label: '⚙️ Cài đặt' },
  { href: '/admin/banners', label: '🔗 Banner & Affiliate' },
  { href: '/admin/tin-nhan', label: '✉️ Quản lý tin nhắn', badgeKey: 'messages' },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const res = await fetch('/api/admin/messages/unread-count');
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch {
      // ignore polling errors
    }
  }

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Refresh badge ngay khi vào trang tin nhắn
  useEffect(() => {
    if (pathname.startsWith('/admin/tin-nhan')) {
      fetchUnreadCount();
    }
  }, [pathname]);

  return (
    <nav className="flex-1 p-4 space-y-1">
      {adminNav.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const showBadge = item.badgeKey === 'messages' && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
              active
                ? 'bg-gray-800 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{item.label}</span>
            {showBadge && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
