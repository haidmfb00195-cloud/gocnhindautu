import Link from 'next/link';
import Image from 'next/image';
import { Shield, Send } from 'lucide-react';
import type { SiteConfig } from '@/lib/site-config';

type FooterProps = Pick<SiteConfig, 'logo_url' | 'facebook_url' | 'zalo_url'>;

export default function Footer({ logo_url, facebook_url, zalo_url }: FooterProps) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background-secondary py-12 text-sm">
      <div className="container mx-auto max-w-content">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              {logo_url ? (
                <Image
                  src={logo_url}
                  alt="Góc Nhìn Đầu Tư"
                  width={160}
                  height={40}
                  className="h-8 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <>
                  <Shield className="text-primary w-6 h-6" />
                  <span className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
                    GÓC NHÌN ĐẦU TƯ
                  </span>
                </>
              )}
            </Link>
            <p className="text-text-secondary leading-relaxed mb-6">
              Trang kiến thức đầu tư trước khi bạn hiểu rõ điều này.
            </p>
            <div className="flex gap-4">
              {facebook_url ? (
                <Link href={facebook_url} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </Link>
              ) : null}
              {zalo_url ? (
                <Link href={zalo_url} target="_blank" rel="noopener noreferrer" className="text-text-tertiary hover:text-primary transition-colors">
                  <Send className="w-5 h-5" />
                </Link>
              ) : null}
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground uppercase tracking-wider mb-4 text-xs">Về chúng tôi</h3>
            <ul className="space-y-3">
              <li><Link href="/gioi-thieu" className="text-text-secondary hover:text-primary transition-colors">Giới thiệu</Link></li>
              <li><Link href="/tam-nhin" className="text-text-secondary hover:text-primary transition-colors">Tầm nhìn & Sứ mệnh</Link></li>
              <li><Link href="/chinh-sach" className="text-text-secondary hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
              <li><Link href="/lien-he" className="text-text-secondary hover:text-primary transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground uppercase tracking-wider mb-4 text-xs">Kiến thức</h3>
            <ul className="space-y-3">
              <li><Link href="/kien-thuc/forex-co-ban" className="text-text-secondary hover:text-primary transition-colors">Forex cơ bản</Link></li>
              <li><Link href="/kien-thuc/phan-tich-ky-thuat" className="text-text-secondary hover:text-primary transition-colors">Phân tích kỹ thuật</Link></li>
              <li><Link href="/kien-thuc/phan-tich-co-ban" className="text-text-secondary hover:text-primary transition-colors">Phân tích cơ bản</Link></li>
              <li><Link href="/kien-thuc/quan-ly-rui-ro" className="text-text-secondary hover:text-primary transition-colors">Quản lý rủi ro</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground uppercase tracking-wider mb-4 text-xs">Công cụ</h3>
            <ul className="space-y-3">
              <li><Link href="/cong-cu" className="text-text-secondary hover:text-primary transition-colors">Tất cả công cụ</Link></li>
              <li><Link href="/cong-cu/calculator" className="text-text-secondary hover:text-primary transition-colors">Calculator</Link></li>
              <li><Link href="/cong-cu/compare" className="text-text-secondary hover:text-primary transition-colors">Compare Tool</Link></li>
              <li><Link href="/cong-cu/economic-calendar" className="text-text-secondary hover:text-primary transition-colors">Economic Calendar</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground uppercase tracking-wider mb-4 text-xs">Prop Firm</h3>
            <ul className="space-y-3">
              <li><Link href="/prop-firm/review" className="text-text-secondary hover:text-primary transition-colors">Review Prop Firm</Link></li>
              <li><Link href="/prop-firm/compare" className="text-text-secondary hover:text-primary transition-colors">Compare & Lựa chọn</Link></li>
              <li><Link href="/prop-firm/so-sanh" className="text-text-secondary hover:text-primary transition-colors">So sánh Prop Firm</Link></li>
              <li><Link href="/prop-firm/huong-dan" className="text-text-secondary hover:text-primary transition-colors">Hướng dẫn pass challenge</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-text-secondary text-xs">
            © {year} Gocnhindautu. All rights reserved.
          </div>
        </div>

        <div className="text-[10px] text-text-tertiary text-center leading-relaxed max-w-4xl mx-auto">
          <span className="font-semibold text-text-secondary">Tuyên bố miễn trừ rủi ro:</span> Giao dịch ngoại hối (Forex), CFD và các sản phẩm tài chính có sử dụng đòn bẩy chứa đựng rủi ro cao và có thể không phù hợp với tất cả các nhà đầu tư. Bạn có thể mất một phần hoặc toàn bộ số vốn ban đầu của mình, vì vậy bạn không nên đầu tư số tiền mà bạn không thể chấp nhận mất. Nội dung trên website này chỉ mang tính chất cung cấp thông tin và kiến thức, không cấu thành lời khuyên đầu tư. Góc Nhìn Đầu Tư sẽ không chịu trách nhiệm pháp lý đối với bất kỳ tổn thất hoặc thiệt hại nào, bao gồm nhưng không giới hạn ở bất kỳ tổn thất lợi nhuận nào có thể phát sinh trực tiếp hoặc gián tiếp từ việc sử dụng hoặc phụ thuộc vào thông tin trên website này.
        </div>
      </div>
    </footer>
  );
}
