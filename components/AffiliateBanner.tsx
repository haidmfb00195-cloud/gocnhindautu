import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function AffiliateBanner({ slug }: { slug: string }) {
  const { data: banner, error } = await supabase
    .from('affiliate_banners')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !banner) return null;

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-4 text-center shadow-lg mb-6">
      <p className="text-emerald-400 font-bold text-lg mb-1">{banner.title}</p>
      
      {banner.subtitle && (
        <p className="text-sm text-gray-400 mb-4">{banner.subtitle}</p>
      )}
      
      {banner.qr_image_url && (
        <div className="flex justify-center mb-4">
          <div className="bg-white p-2 rounded-lg inline-block">
            <img 
              src={banner.qr_image_url} 
              alt="QR Code" 
              className="w-32 h-32 object-contain" 
            />
          </div>
        </div>
      )}
      
      {banner.promo_code && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Mã khuyến mãi:</p>
          <span className="inline-block bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 px-3 py-1.5 rounded font-mono text-sm tracking-wider font-semibold">
            {banner.promo_code}
          </span>
        </div>
      )}
      
      <a
        href={banner.affiliate_link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors py-2.5 font-bold text-black"
      >
        {banner.cta_text || 'ĐĂNG KÝ NGAY'}
      </a>
    </div>
  );
}
