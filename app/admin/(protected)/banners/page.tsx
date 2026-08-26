import type { Metadata } from 'next';
import { BannerSettings } from '../settings/BannerSettings';

export const metadata: Metadata = { title: 'Banner & Affiliate | Admin' };

export default function AdminBannersPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Banner & Affiliate</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quản lý banner quảng cáo, link affiliate, mã giới thiệu và QR code.
        </p>
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <BannerSettings />
      </div>
    </div>
  );
}
