import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/home/MobileBottomNav';
import { getSiteConfig, getHeaderCta } from '@/lib/site-config';

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gocnhindautu.com'),
  title: {
    default: 'Góc Nhìn Đầu Tư — Kiến thức Trading & Phân tích Forex',
    template: '%s | Góc Nhìn Đầu Tư',
  },
  description:
    'Nền tảng kiến thức trading chuyên sâu: phân tích kỹ thuật, review sàn forex, so sánh broker uy tín và các khóa học đầu tư tài chính.',
  keywords: ['trading', 'forex', 'phân tích kỹ thuật', 'review sàn', 'đầu tư', 'prop firm', 'risk management'],
  authors: [{ name: 'gocnhindautu.com' }],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://gocnhindautu.com',
    siteName: 'Góc Nhìn Đầu Tư',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteConfig = await getSiteConfig();
  const headerCta = await getHeaderCta();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Inline script for dark mode to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${beVietnamPro.className} antialiased`}>
        <Header logoUrl={siteConfig.logo_url || undefined} ctaHref={headerCta.href} ctaText={headerCta.text} />
        <main id="main-content">{children}</main>
        <Footer
          logo_url={siteConfig.logo_url}
          facebook_url={siteConfig.facebook_url}
          zalo_url={siteConfig.zalo_url}
          contact_phone={siteConfig.contact_phone}
          contact_email={siteConfig.contact_email}
          contact_address={siteConfig.contact_address}
        />
        <MobileBottomNav />
      </body>
    </html>
  );
}
