import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Calendar, User } from 'lucide-react';

export default function ArticleDetailPage({ params }: { params: { category: string, slug: string } }) {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center text-sm text-text-secondary mb-6 gap-2">
        <Link href="/" className="hover:text-primary">Trang chủ</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/${params.category}`} className="hover:text-primary capitalize">{params.category.replace('-', ' ')}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground truncate">Tiêu đề bài viết</span>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
        Bí quyết vượt qua vòng thử thách của các quỹ cấp vốn lớn nhất
      </h1>

      <div className="flex items-center gap-6 text-text-secondary text-sm mb-8 border-b border-border pb-8">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span>Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>04 Tháng 08, 2026</span>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary-hover">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 bg-gradient-dark-card border border-border flex items-center justify-center">
          <span className="text-white/20 font-bold text-2xl">DUNGDAUTU.COM</span>
        </div>
        <p className="lead text-xl text-text-secondary mb-6 font-medium">
          Hướng dẫn chi tiết cách quản lý vốn, tâm lý giao dịch và chiến lược hiệu quả để nhận tài khoản cấp vốn lên đến $200,000 từ các Prop Firm uy tín.
        </p>
        <h2>1. Hiểu rõ luật chơi của các quỹ</h2>
        <p>Mỗi quỹ có những quy định riêng về Drawdown, Daily Loss và Profit Target. Việc đầu tiên là bạn phải đọc kỹ các quy định này. (Nội dung giả định tải từ Cloudflare R2)...</p>
        <h2>2. Quản lý rủi ro chặt chẽ</h2>
        <p>Không bao giờ rủi ro quá 1% cho mỗi lệnh giao dịch. Đây là quy tắc vàng để không vi phạm Daily Loss.</p>
        <blockquote>
          <p>Kỷ luật là cầu nối giữa mục tiêu và thành tựu.</p>
        </blockquote>
      </div>
    </div>
  );
}
