import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Admin Dashboard' };

async function getDashboardStats() {
  const supabase = createClient();

  const [
    { count: totalArticles },
    { count: publishedArticles },
    { count: totalBrokers },
    { count: totalComparisons },
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('brokers').select('id', { count: 'exact', head: true }),
    supabase.from('comparisons').select('id', { count: 'exact', head: true }),
  ]);

  return { totalArticles, publishedArticles, totalBrokers, totalComparisons };
}

async function getRecentActions() {
  const supabase = createClient();
  const { data } = await supabase
    .from('admin_actions')
    .select('id, action, target_table, target_id, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

export default async function AdminDashboard() {
  const [stats, recentActions] = await Promise.all([
    getDashboardStats(),
    getRecentActions(),
  ]);

  const statCards = [
    { label: 'Tổng bài viết', value: stats.totalArticles ?? 0, href: '/admin/kien-thuc' },
    { label: 'Đã xuất bản', value: stats.publishedArticles ?? 0, href: '/admin/kien-thuc' },
        { label: 'So sánh', value: stats.totalComparisons ?? 0, href: '/admin/so-sanh' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link
          href="/admin/kien-thuc/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors"
        >
          + Bài viết mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="block rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-emerald-500/50 transition-colors"
          >
            <p className="text-sm text-gray-400">{card.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{card.value}</p>
          </Link>
        ))}
      </div>

      {/* Recent Actions */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Hoạt động gần đây</h2>
        {recentActions.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có hoạt động nào.</p>
        ) : (
          <div className="space-y-3">
            {recentActions.map((action) => (
              <div key={action.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-white font-medium">{action.action}</span>
                  <span className="text-gray-500"> trên </span>
                  <span className="text-emerald-400">{action.target_table}</span>
                </div>
                <span className="text-gray-600 text-xs">
                  {new Date(action.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
