-- ============================================================
-- gocnhindautu.com — Migration 003: Admin Restructure
-- Chạy trong Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Bảng site_config (key-value linh hoạt)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_config (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_config: public read" ON public.site_config;
CREATE POLICY "site_config: public read"
  ON public.site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_config: service role write" ON public.site_config;
CREATE POLICY "site_config: service role write"
  ON public.site_config FOR ALL USING (auth.role() = 'service_role');

-- Seed default values
INSERT INTO public.site_config (key, value) VALUES
  ('logo_url',         ''),
  ('contact_phone',    '+84 123 456 789'),
  ('contact_email',    'admin@gocnhindautu.com'),
  ('contact_address',  'Hà Nội, Việt Nam'),
  ('facebook_url',     ''),
  ('zalo_url',         '')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. Thêm sort_order vào affiliate_banners
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_banners
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- 3. Thêm is_pinned_home và is_featured vào articles
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_pinned_home BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────
-- 4. RPC: pin_article_home — atomic, chỉ 1 bài true tại 1 lúc
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pin_article_home(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Unpin all
  UPDATE public.articles SET is_pinned_home = false;
  -- Pin selected
  UPDATE public.articles SET is_pinned_home = true WHERE id = article_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 5. Mở rộng constraint type của categories
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.categories
  DROP CONSTRAINT IF EXISTS categories_type_check;

ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('kien-thuc', 'danh-gia-san', 'so-sanh', 'trade-quy', 'san-giao-dich'));

-- Seed categories cho 2 chuyên mục mới
INSERT INTO public.categories (slug, name, type) VALUES
  ('trade-quy',       'Trade Quỹ',       'trade-quy'),
  ('san-giao-dich',   'Sàn Giao Dịch',   'san-giao-dich')
ON CONFLICT (slug) DO NOTHING;

-- Index mới cho is_pinned_home
CREATE INDEX IF NOT EXISTS idx_articles_pinned ON public.articles(is_pinned_home);
