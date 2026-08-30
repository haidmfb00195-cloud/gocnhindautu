-- Migration: 006_fix_pin_home_and_placement_label.sql
-- 1. Sửa hàm pin_article_home: thêm WHERE clause rõ ràng để tránh lỗi safe-update
CREATE OR REPLACE FUNCTION public.pin_article_home(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bước 1: Unpin tất cả bài đang ghim (WHERE clause bắt buộc để PostgreSQL không chặn)
  UPDATE public.articles
  SET is_pinned_home = false
  WHERE is_pinned_home = true;

  -- Bước 2: Pin bài được chọn
  UPDATE public.articles
  SET is_pinned_home = true
  WHERE id = article_id;
END;
$$;

-- 2. Thêm cột placement_label vào affiliate_banners (nullable, không bắt buộc)
ALTER TABLE public.affiliate_banners
  ADD COLUMN IF NOT EXISTS placement_label TEXT;

-- 3. Cập nhật placement_label cho banner ftmo-sidebar hiện có
UPDATE public.affiliate_banners
  SET placement_label = 'Sidebar - trang Kiến thức / Trade quỹ'
  WHERE slug = 'ftmo-sidebar';
