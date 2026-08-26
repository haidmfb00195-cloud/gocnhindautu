import type { Metadata } from 'next';
import Link from 'next/link';
import RevalidateForm from '../RevalidateForm';

export const metadata: Metadata = { title: 'Cài đặt nâng cao | Admin' };

export default function AdminAdvancedSettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/settings" className="text-sm text-gray-400 hover:text-white">
          ← Cài đặt website
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Cài đặt nâng cao</h1>
        <p className="text-sm text-gray-500 mt-1">Biến môi trường và revalidate cache thủ công.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Biến môi trường</h2>
          <p className="text-sm text-gray-400 mb-4">
            Các biến môi trường được cấu hình trong{' '}
            <code className="text-emerald-400">.env.local</code> hoặc Vercel Dashboard.
          </p>
          {[
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY',
            'SUPABASE_SERVICE_ROLE_KEY',
            'R2_ACCOUNT_ID',
            'R2_ACCESS_KEY_ID',
            'R2_SECRET_ACCESS_KEY',
            'R2_BUCKET_NAME',
            'R2_PUBLIC_URL',
            'REVALIDATE_SECRET',
          ].map((key) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <code className="text-sm text-emerald-400">{key}</code>
              <span className="text-xs text-gray-600">
                {process.env[key] ? '✅ Set' : '❌ Missing'}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-2">Cache & Revalidate</h2>
          <p className="text-sm text-gray-400 mb-6">
            Cache được làm mới tự động sau mỗi lần publish/update/delete.
            Sử dụng form dưới đây để kích hoạt revalidate thủ công khi cần.
          </p>
          <RevalidateForm />
        </div>
      </div>
    </div>
  );
}
