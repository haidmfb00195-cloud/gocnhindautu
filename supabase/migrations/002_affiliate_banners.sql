create table if not exists affiliate_banners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  affiliate_link text not null,
  promo_code text,
  qr_image_url text,
  cta_text text default 'ĐĂNG KÝ NGAY',
  is_active boolean default true,
  updated_at timestamptz default now()
);

-- RLS: chỉ service role (admin) được ghi, ai cũng đọc được (banner public)
alter table affiliate_banners enable row level security;

drop policy if exists "public read active banners" on affiliate_banners;
create policy "public read active banners"
  on affiliate_banners for select
  using (is_active = true);

drop policy if exists "service role full access" on affiliate_banners;
create policy "service role full access"
  on affiliate_banners for all
  using (auth.role() = 'service_role');

-- Seed 1 dòng cho banner FTMO hiện tại:
insert into affiliate_banners (slug, title, subtitle, affiliate_link, promo_code, qr_image_url)
values (
  'ftmo-sidebar',
  'MỞ TÀI KHOẢN FTMO',
  'Nhận ngay chiết khấu 10%',
  'https://ftmo.com/?affiliate=xxxx',
  'GOCNHINDAUTU10',
  'https://pub-your-r2-url.r2.dev/banners/ftmo-qr.png' -- Thay bằng URL thực tế sau
) on conflict (slug) do nothing;
