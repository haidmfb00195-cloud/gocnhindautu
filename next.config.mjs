/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    let supabaseDomain = '*.supabase.co';
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        supabaseDomain = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname;
      }
    } catch (e) {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL for CSP:', e);
    }

    let r2Domain = '';
    try {
      if (process.env.R2_PUBLIC_URL) {
        r2Domain = new URL(process.env.R2_PUBLIC_URL).hostname;
      }
    } catch (e) {
      console.warn('Invalid R2_PUBLIC_URL for CSP:', e);
    }

    const connectSrc = [
      "'self'",
      `https://${supabaseDomain}`,
      `wss://${supabaseDomain}`,
      "https://*.supabase.co",
      "wss://*.supabase.co"
    ].join(' ');

    const imgSrc = [
      "'self'",
      "data:",
      "blob:",
      r2Domain ? `https://${r2Domain}` : '',
      "https:"
    ].filter(Boolean).join(' ');

    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src ${imgSrc}`,
      `connect-src ${connectSrc}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // ── Images ────────────────────────────────────────────────────────────────
  images: {
    unoptimized: true,
  },

  // Disable ESLint and TS errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
