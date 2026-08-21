'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: '🏠' },
    { name: 'Kiến thức', href: '/kien-thuc', icon: '📚' },
    { name: 'Công cụ', href: '/cong-cu/lot-calculator', icon: '🧮' },
    { name: 'Prop Firm', href: '/prop-firm', icon: '🏆' },
  ];

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-background border-t border-border z-50 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-foreground'
                }`}
              >
                <span className="text-xl leading-none" style={{ filter: isActive ? 'none' : 'grayscale(1)' }}>{item.icon}</span>
                <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{item.name}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
              menuOpen ? 'text-primary' : 'text-text-secondary'
            }`}
          >
            <span className="text-xl leading-none">☰</span>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm">
          <div className="flex flex-col h-full pt-16 px-6 overflow-y-auto pb-[100px]">
            <h3 className="font-bold text-foreground mb-6 uppercase text-sm tracking-wider">Tất cả danh mục</h3>
            <div className="space-y-4">
              <Link href="/tin-tuc" className="block text-xl font-medium text-text-secondary hover:text-primary py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Tin tức</Link>
              <Link href="/kien-thuc/phan-tich-ky-thuat" className="block text-xl font-medium text-text-secondary hover:text-primary py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Phân tích kỹ thuật</Link>
              
              <Link href="/so-sanh" className="block text-xl font-medium text-text-secondary hover:text-primary py-2 border-b border-border" onClick={() => setMenuOpen(false)}>So sánh sàn</Link>
              <Link href="/khoa-hoc" className="block text-xl font-medium text-text-secondary hover:text-primary py-2 border-b border-border" onClick={() => setMenuOpen(false)}>Khóa học</Link>
              <Link href="/lien-he" className="block text-xl font-medium text-text-secondary hover:text-primary py-2" onClick={() => setMenuOpen(false)}>Liên hệ</Link>
            </div>
            
            <div className="mt-8">
              <Link href="/dang-ky" className="btn btn-primary w-full justify-center py-4" onClick={() => setMenuOpen(false)}>
                Đăng ký nhận bản tin
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
