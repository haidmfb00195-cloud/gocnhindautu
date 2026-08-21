import Link from 'next/link';
import { Star, ShieldCheck, ExternalLink, MessageCircle, Send } from 'lucide-react';

const propFirms = [
  {
    name: 'FTMO',
    desc: 'Prop firm uy tín số 1 thế giới',
    rating: 4.9,
    logo: 'F',
    color: 'bg-[#FFC107]/20 text-[#FFC107]',
  },
  {
    name: 'The5ers',
    desc: 'Phù hợp cho Swing Trader',
    rating: 4.8,
    logo: '5',
    color: 'bg-primary/20 text-primary',
  },
  {
    name: 'Funding Pips',
    desc: 'Giá rẻ, thanh toán nhanh',
    rating: 4.7,
    logo: 'FP',
    color: 'bg-[#4CAF50]/20 text-[#4CAF50]',
  },
  {
    name: 'FundedNext',
    desc: 'Chia sẻ lợi nhuận từ vòng test',
    rating: 4.6,
    logo: 'FN',
    color: 'bg-[#2196F3]/20 text-[#2196F3]',
  },
  {
    name: 'Blue Guardian',
    desc: 'Không giới hạn thời gian',
    rating: 4.6,
    logo: 'BG',
    color: 'bg-[#9C27B0]/20 text-[#9C27B0]',
  },
];

export default function PropFirmSidebar() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Prop Firm Đề Xuất
          </h3>
          <Link href="/prop-firm" className="text-sm text-primary font-medium hover:underline">
            Xem tất cả →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {propFirms.map((firm) => (
            <div key={firm.name} className="flex flex-col gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition-colors bg-background">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0 ${firm.color}`}>
                  {firm.logo}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{firm.name}</h4>
                  <p className="text-xs text-text-secondary truncate">{firm.desc}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3.5 h-3.5 fill-[#FFC107] text-[#FFC107]" />
                    <span className="text-xs font-medium text-foreground">{firm.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link href="#" className="btn btn-primary btn-sm w-full gap-1">
                  Tạo tài khoản <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <span className="text-[10px] text-text-tertiary text-center">
                  Nhận hoa hồng qua Gocnhindautu
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <h3 className="font-bold text-foreground mb-2">Tham gia cộng đồng</h3>
        <p className="text-xs text-text-secondary mb-4">Kết nối với hơn 10,000+ trader khác</p>
        
        <div className="flex flex-col gap-3">
          <Link href="#" className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-[#5865F2] hover:text-[#5865F2] transition-colors group">
            <MessageCircle className="w-5 h-5 group-hover:text-[#5865F2]" />
            <div className="text-left">
              <div className="text-sm font-semibold">Discord</div>
              <div className="text-[10px] text-text-tertiary">Tham gia ngay</div>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-[#0088cc] hover:text-[#0088cc] transition-colors group">
            <Send className="w-5 h-5 group-hover:text-[#0088cc]" />
            <div className="text-left">
              <div className="text-sm font-semibold">Telegram</div>
              <div className="text-[10px] text-text-tertiary">Tham gia ngay</div>
            </div>
          </Link>
          <Link href="#" className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-[#FF0000] hover:text-[#FF0000] transition-colors group">
            <svg className="w-5 h-5 group-hover:text-[#FF0000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
            <div className="text-left">
              <div className="text-sm font-semibold">YouTube</div>
              <div className="text-[10px] text-text-tertiary">Đăng ký kênh</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
