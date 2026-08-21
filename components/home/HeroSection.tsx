import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Calculator, ShieldCheck } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 md:pt-12 md:pb-16 bg-gradient-to-b from-primary-lighter/50 to-background rounded-2xl">
      <div className="w-full px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <div className="w-full lg:w-3/5 text-center lg:text-left z-10 animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-6">
              <span className="badge badge-primary">KIẾN THỨC</span>
              <span className="badge badge-primary">CÔNG CỤ</span>
              <span className="badge badge-primary">PROP FIRM</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-foreground leading-tight mb-6 text-balance">
              Đừng đầu tư <span className="text-primary">Forex</span> nếu bạn chưa hiểu những điều này.
            </h1>
            
            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto lg:mx-0">
              Chúng tôi giúp bạn trang bị kiến thức, công cụ và chiến lược để đầu tư thông minh, quản lý rủi ro hiệu quả và chọn đúng prop firm phù hợp.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/kien-thuc" className="btn btn-primary btn-lg w-full sm:w-auto">
                Bắt đầu học ngay
              </Link>
              <Link href="/cong-cu" className="btn btn-secondary btn-lg w-full sm:w-auto group">
                Khám phá công cụ 
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-2/5 relative max-w-[400px] aspect-square animate-fade-in delay-200 mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-primary-light rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
            
            <Image 
              src="/images/mascot.png" 
              alt="Dungdautu Mascot" 
              width={500} 
              height={500}
              className="relative z-10 object-contain w-full h-full"
              unoptimized
            />

            {/* Decorative badges */}
            <div className="absolute top-10 right-0 bg-surface shadow-md rounded-xl p-3 flex items-center gap-2 animate-float delay-100 z-20 border border-border">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Knowledge</span>
            </div>
            
            <div className="absolute bottom-1/4 -left-4 bg-surface shadow-md rounded-xl p-3 flex items-center gap-2 animate-float delay-300 z-20 border border-border">
              <Calculator className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Tools</span>
            </div>
            
            <div className="absolute top-1/2 -right-6 bg-surface shadow-md rounded-xl p-3 flex items-center gap-2 animate-float delay-500 z-20 border border-border">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-foreground">Risk Control</span>
            </div>
            
            <div className="absolute bottom-10 right-10 bg-surface shadow-md rounded-full p-4 flex flex-col items-center justify-center aspect-square animate-float delay-200 z-20 border border-border">
              <div className="relative w-12 h-12 flex items-center justify-center mb-1">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-border" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-primary" strokeDasharray="78, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="text-sm font-bold text-foreground">78%</span>
              </div>
              <span className="text-[10px] font-medium text-text-secondary">Win Rate</span>
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="mt-20 border-t border-border pt-10 animate-fade-in-up delay-400">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-border">
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-foreground mb-1">150+</div>
              <div className="text-sm text-text-secondary">Bài viết chất lượng</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-foreground mb-1">20+</div>
              <div className="text-sm text-text-secondary">Công cụ miễn phí</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-foreground mb-1">30+</div>
              <div className="text-sm text-text-secondary">Prop firm review</div>
            </div>
            <div className="text-center px-4">
              <div className="text-3xl font-bold text-foreground mb-1">10K+</div>
              <div className="text-sm text-text-secondary">Thành viên cộng đồng</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
