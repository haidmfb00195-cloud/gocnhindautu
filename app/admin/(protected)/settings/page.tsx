import type { Metadata } from 'next';
import { SiteConfigForm } from './SiteConfigForm';
import { BannerSettings } from './BannerSettings';

export const metadata: Metadata = { title: 'Cài đặt website | Admin' };

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Cài đặt website</h1>
          <p className="text-sm text-gray-500 mt-1">Logo, thông tin liên hệ và banner affiliate.</p>
        </div>
        <a
          href="/admin/settings/advanced"
          className="text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors"
        >
          Nâng cao →
        </a>
      </div>

      <div className="space-y-8">
        <SiteConfigForm />
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <BannerSettings />
        </div>
      </div>
    </div>
  );
}
