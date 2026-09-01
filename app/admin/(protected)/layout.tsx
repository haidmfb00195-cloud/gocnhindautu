import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, display_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') redirect('/admin/login?error=forbidden');

  return (
    <div className="flex min-h-screen bg-gray-950">
      <aside className="w-60 flex-shrink-0 border-r border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link href="/" className="text-sm font-bold text-white hover:text-emerald-400 transition-colors">
            ← gocnhindautu.com
          </Link>
          <p className="mt-3 text-xs text-gray-500">Admin Panel</p>
          <p className="text-xs text-emerald-400 font-medium mt-1">
            {profile.display_name ?? user.email}
          </p>
        </div>

        <AdminSidebar />

        <div className="p-4 border-t border-gray-800">
          <form action="/api/admin/logout" method="POST">
            <button
              id="admin-logout"
              type="submit"
              className="w-full text-left text-sm text-gray-500 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
            >
              🚪 Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
