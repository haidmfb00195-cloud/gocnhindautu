import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Về chúng tôi',
  description: 'Tìm hiểu về dungdautu.com — nền tảng kiến thức trading và phân tích forex.',
};

export default function VeChungToiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-6">Về chúng tôi</h1>
      <div className="prose prose-invert prose-emerald max-w-none">
        <p>
          <strong className="text-white">dungdautu.com</strong> là nền tảng cung cấp kiến thức
          trading và phân tích tài chính độc lập, được xây dựng bởi cộng đồng trader Việt Nam.
        </p>
        <h2>Sứ mệnh</h2>
        <p>
          Cung cấp thông tin khách quan, chính xác về thị trường forex và các sàn giao dịch —
          giúp trader Việt Nam đưa ra quyết định đầu tư có căn cứ.
        </p>
        <h2>Chúng tôi làm gì</h2>
        <ul>
          <li>Phân tích kỹ thuật chuyên sâu</li>
          <li>Review và đánh giá sàn forex uy tín</li>
          <li>So sánh điều kiện giao dịch giữa các broker</li>
          <li>Cung cấp công cụ hỗ trợ tính toán cho trader</li>
          <li>Khóa học trading từ cơ bản đến nâng cao</li>
        </ul>
        <h2>Tuyên bố miễn trách</h2>
        <p>
          Toàn bộ nội dung trên dungdautu.com chỉ mang tính chất tham khảo và giáo dục.
          Không có nội dung nào được xem là lời khuyên đầu tư tài chính.
          Giao dịch ngoại hối có rủi ro cao, bạn có thể mất toàn bộ vốn đầu tư.
        </p>
      </div>
    </div>
  );
}
