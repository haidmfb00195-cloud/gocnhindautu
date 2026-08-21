'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const categories = [
  {
    title: 'Trade quỹ',
    href: '/trade-quy',
    subItems: [
      { title: 'Tin tức', href: '/trade-quy/tin-tuc' },
      { title: 'Kinh nghiệm', href: '/trade-quy/kinh-nghiem' },
      { title: 'Đánh giá', href: '/trade-quy/danh-gia' },
    ]
  },
  {
    title: 'Sàn giao dịch',
    href: '/san-giao-dich',
    subItems: [
      { title: 'Forex', href: '/san-giao-dich/forex' },
      { title: 'Crypto', href: '/san-giao-dich/crypto' },
    ]
  },
  {
    title: 'Kiến thức',
    href: '/kien-thuc',
    subItems: [
      { title: 'Phân tích kỹ thuật', href: '/kien-thuc/phan-tich-ky-thuat' },
      { title: 'Price Action', href: '/kien-thuc/price-action' },
    ]
  },
  {
    title: 'Liên hệ',
    href: '/lien-he',
  }
];

export default function CategorySidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (href: string) => {
    setExpanded(prev => ({ ...prev, [href]: !prev[href] }));
  };

  return (
    <aside className="w-full md:w-[280px] flex-shrink-0 flex flex-col gap-6">
      <div className="card">
        <h2 className="text-lg font-bold mb-4 border-b border-border pb-2 uppercase text-foreground">
          DANH MỤC
        </h2>
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => {
            const isActive = pathname.startsWith(cat.href);
            const isExpanded = expanded[cat.href] || isActive;
            
            return (
              <div key={cat.href} className="flex flex-col">
                <div className="flex items-center justify-between py-2">
                  <Link 
                    href={cat.href} 
                    className={`font-medium transition-colors ${isActive ? 'text-accent' : 'text-text-secondary hover:text-foreground'}`}
                  >
                    {cat.title}
                  </Link>
                  {cat.subItems && (
                    <button onClick={() => toggleExpand(cat.href)} className="p-1 text-text-secondary hover:text-foreground">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                
                {cat.subItems && isExpanded && (
                  <div className="flex flex-col ml-4 pl-4 border-l border-border gap-2 my-1">
                    {cat.subItems.map((sub) => (
                      <Link 
                        key={sub.href} 
                        href={sub.href}
                        className={`text-sm transition-colors ${pathname === sub.href ? 'text-accent' : 'text-text-secondary hover:text-foreground'}`}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl bg-black p-4 text-center border border-border shadow-glow flex flex-col items-center">
        <div className="text-primary font-bold text-lg mb-1">MỞ TÀI KHOẢN FTMO</div>
        <div className="text-white text-sm mb-4">Nhận ngay chiết khấu 10%</div>
        <div className="w-32 h-32 bg-white flex items-center justify-center rounded-lg mb-4">
          <div className="text-black text-xs font-mono">QR CODE</div>
        </div>
        <div className="bg-zinc-800 text-white rounded px-3 py-1 font-mono text-sm mb-4 border border-zinc-700">
          DUNGDAUTU10
        </div>
        <Link href="#" className="btn btn-primary w-full justify-center rounded-full text-black font-bold">
          ĐĂNG KÝ NGAY
        </Link>
      </div>
    </aside>
  );
}
