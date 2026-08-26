'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Mail, Shield, ChevronDown, Menu, Moon, Sun } from 'lucide-react';

export default function Header() {
  const [theme, setTheme] = useState('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };


  return (
    <header className="sticky top-0 z-50 h-[72px] bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container h-full mx-auto flex max-w-content items-center justify-between">
        <Link href="/" className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className="text-primary w-6 h-6" />
            <span className="text-xl font-bold tracking-tight text-foreground hover:text-primary transition-colors">
              GÓC NHÌN ĐẦU TƯ</span>
            </span>
          </div>
          <span className="text-[10px] text-text-secondary hidden sm:block mt-0.5 ml-8">Góc nhìn đầu tư trước khi bạn hiểu rõ điều này.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-accent' : 'text-text-secondary hover:text-foreground'}`}>Trang chủ</Link>
          <div className="group relative cursor-pointer flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground">
            <Link href="/trade-quy" className={pathname.startsWith('/trade-quy') ? 'text-accent' : 'text-text-secondary'}>Trade quỹ</Link> <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="group relative cursor-pointer flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground">
            <Link href="/san-giao-dich" className={pathname.startsWith('/san-giao-dich') ? 'text-accent' : 'text-text-secondary'}>Sàn giao dịch</Link> <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="group relative cursor-pointer flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground">
            <Link href="/kien-thuc" className={pathname.startsWith('/kien-thuc') ? 'text-accent' : 'text-text-secondary'}>Kiến thức</Link> <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
          <Link href="/lien-he" className={`text-sm font-medium transition-colors ${pathname === '/lien-he' ? 'text-accent' : 'text-text-secondary hover:text-foreground'}`}>Liên hệ</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="text-text-secondary hover:text-foreground">
            <Search className="w-5 h-5" />
          </button>
          
          <button onClick={toggleTheme} className="text-text-secondary hover:text-foreground">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <Link href="/dang-ky" className="hidden md:inline-flex btn btn-primary btn-sm rounded-full gap-2 text-background font-semibold">
            <Mail className="w-4 h-4" /> ĐĂNG KÝ NGAY
          </Link>

          <button className="md:hidden text-text-secondary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background pt-[72px] md:hidden">
          <div className="flex flex-col p-4 gap-4">
            <Link href="/" className={`text-lg font-medium py-2 border-b border-border ${pathname === '/' ? 'text-accent' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>Trang chủ</Link>
            <Link href="/trade-quy" className={`text-lg font-medium py-2 border-b border-border ${pathname.startsWith('/trade-quy') ? 'text-accent' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>Trade quỹ</Link>
            <Link href="/san-giao-dich" className={`text-lg font-medium py-2 border-b border-border ${pathname.startsWith('/san-giao-dich') ? 'text-accent' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>Sàn giao dịch</Link>
            <Link href="/kien-thuc" className={`text-lg font-medium py-2 border-b border-border ${pathname.startsWith('/kien-thuc') ? 'text-accent' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>Kiến thức</Link>
            <Link href="/lien-he" className={`text-lg font-medium py-2 border-b border-border ${pathname === '/lien-he' ? 'text-accent' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>Liên hệ</Link>
            <Link href="/dang-ky" className="btn btn-primary w-full mt-4 justify-center gap-2">
              <Mail className="w-5 h-5" /> Đăng ký nhận tin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
