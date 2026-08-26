-- ============================================================
-- FIX NHANH: Chạy TOÀN BỘ file này trong Supabase SQL Editor
-- (New query → paste all → Run)
-- Lỗi "syntax error at or near CHECK" = bạn đã chạy thiếu dòng ALTER TABLE
-- ============================================================

-- Bước 1: Xóa mọi CHECK constraint cũ trên bảng categories
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

-- Bước 2: Thêm constraint mới (PHẢI là 1 dòng đầy đủ, không tách riêng CHECK)
ALTER TABLE public.categories ADD CONSTRAINT categories_type_check CHECK (type IN ('kien-thuc', 'danh-gia-san', 'so-sanh', 'trade-quy', 'san-giao-dich'));

-- Bước 3: Seed categories (an toàn chạy lại)
INSERT INTO public.categories (slug, name, type) VALUES
  ('trade-quy',     'Trade Quỹ',     'trade-quy'),
  ('san-giao-dich', 'Sàn Giao Dịch', 'san-giao-dich'),
  ('kien-thuc',     'Kiến thức',     'kien-thuc'),
  ('forex-co-ban',       'Forex cơ bản',       'kien-thuc'),
  ('phan-tich-ky-thuat', 'Phân tích kỹ thuật', 'kien-thuc'),
  ('phan-tich-co-ban',   'Phân tích cơ bản',   'kien-thuc'),
  ('quan-ly-rui-ro',     'Quản lý rủi ro',     'kien-thuc'),
  ('chung',              'Chung',              'kien-thuc')
ON CONFLICT (slug) DO NOTHING;
