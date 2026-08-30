-- Thêm cột "placement" (vị trí hiển thị cố định) cho affiliate_banners.
-- Mục tiêu: admin chỉ cần CHỌN vị trí từ danh sách có sẵn thay vì tự gõ slug,
-- tránh gõ sai/lệch khiến banner không hiển thị đúng chỗ.

ALTER TABLE affiliate_banners ADD COLUMN IF NOT EXISTS placement TEXT;

-- Map dữ liệu slug cũ (nếu có) sang placement mới, để không mất banner đã tạo trước đó.
UPDATE affiliate_banners SET placement = 'home_horizontal' WHERE slug = 'home-horizontal';
UPDATE affiliate_banners SET placement = 'header_cta' WHERE slug = 'header-cta';
UPDATE affiliate_banners SET placement = 'homepage_grid' WHERE slug LIKE 'grid-%';

-- Các banner còn lại (vd banner Exness bạn tạo tay với slug "Exness") sẽ có
-- placement = NULL sau migration này — vào /admin/banners sửa lại, chọn đúng
-- vị trí mong muốn ở dropdown mới rồi lưu lại là xong, không cần đụng SQL nữa.
