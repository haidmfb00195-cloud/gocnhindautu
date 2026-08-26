-- ============================================================
-- gocnhindautu.com — Migration 004: Schema drift fix + seeds
-- Idempotent — an toàn chạy lại nhiều lần
-- Chạy sau 002 và 003 (hoặc thay thế nếu 003 chưa chạy)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Cột thiếu trên articles (code đã dùng nhưng chưa có migration)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS keywords TEXT;

-- Đảm bảo cột từ migration 003 tồn tại (nếu 003 chưa chạy)
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_pinned_home BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- ─────────────────────────────────────────────────────────────
-- 2. site_config (nếu 003 chưa chạy)
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

INSERT INTO public.site_config (key, value) VALUES
  ('logo_url',         ''),
  ('contact_phone',    '+84 123 456 789'),
  ('contact_email',    'admin@gocnhindautu.com'),
  ('contact_address',  'Hà Nội, Việt Nam'),
  ('facebook_url',     ''),
  ('zalo_url',         '')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. affiliate_banners sort_order (nếu 003 chưa chạy)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.affiliate_banners
  ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- ─────────────────────────────────────────────────────────────
-- 4. Mở rộng categories.type + seed verticals
--    (DROP mọi CHECK constraint cũ trên bảng categories, rồi ADD lại)
--    CHÚ Ý: Phải chạy cả khối DO $$ ... $$ + ALTER TABLE — không chạy
--    riêng dòng CHECK (sẽ báo syntax error 42601).
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'categories'
      AND c.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('kien-thuc', 'danh-gia-san', 'so-sanh', 'trade-quy', 'san-giao-dich'));

-- Vertical chính (1 category = 1 menu frontend)
INSERT INTO public.categories (slug, name, type) VALUES
  ('trade-quy',     'Trade Quỹ',     'trade-quy'),
  ('san-giao-dich', 'Sàn Giao Dịch', 'san-giao-dich'),
  ('kien-thuc',     'Kiến thức',     'kien-thuc')
ON CONFLICT (slug) DO NOTHING;

-- Sub-categories cho Kiến thức (URL /kien-thuc/[slug]/...)
INSERT INTO public.categories (slug, name, type) VALUES
  ('forex-co-ban',       'Forex cơ bản',       'kien-thuc'),
  ('phan-tich-ky-thuat', 'Phân tích kỹ thuật', 'kien-thuc'),
  ('phan-tich-co-ban',   'Phân tích cơ bản',   'kien-thuc'),
  ('quan-ly-rui-ro',     'Quản lý rủi ro',     'kien-thuc'),
  ('chung',              'Chung',              'kien-thuc')
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 5. RPC pin_article_home (nếu 003 chưa chạy)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.pin_article_home(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.articles SET is_pinned_home = false;
  UPDATE public.articles SET is_pinned_home = true WHERE id = article_id;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_articles_pinned ON public.articles(is_pinned_home);

-- ─────────────────────────────────────────────────────────────
-- 6. Data migration: gán category mặc định cho bài viết thiếu category_id
--    Bài thiếu category → gán sub-category "chung" (type kien-thuc)
-- ─────────────────────────────────────────────────────────────
UPDATE public.articles a
SET category_id = c.id
FROM public.categories c
WHERE a.category_id IS NULL
  AND c.slug = 'chung';

-- ─────────────────────────────────────────────────────────────
-- 7. Báo cáo bài viết không map được vào 3 vertical frontend
--    Chạy query này sau migration để xử lý tay nếu cần:
--
--    SELECT a.id, a.slug, a.title, c.slug AS cat_slug, c.type AS cat_type
--    FROM public.articles a
--    LEFT JOIN public.categories c ON c.id = a.category_id
--    WHERE c.type IS NULL
--       OR c.type NOT IN ('kien-thuc', 'trade-quy', 'san-giao-dich');
-- ─────────────────────────────────────────────────────────────
