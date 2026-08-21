'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function FeaturedArticles() {
  const [activeTab, setActiveTab] = useState('Tất cả');
  
  const tabs = ['Tất cả', 'Prop Firm', 'Kiến thức', 'Công cụ', 'Chiến lược'];
  
  const articles = [
    {
      id: 1,
      category: 'Prop Firm',
      title: 'Đánh giá FTMO mới bạn cần biết 7 điều này',
      date: '20/05/2024',
      readTime: '8 phút đọc',
      color: 'from-blue-600 to-blue-900'
    },
    {
      id: 2,
      category: 'Kiến thức',
      title: 'Risk Management là gì? Hướng dẫn chi tiết cho trader',
      date: '18/03/2024',
      readTime: '10 phút đọc',
      color: 'from-emerald-500 to-emerald-800'
    },
    {
      id: 3,
      category: 'Prop Firm',
      title: 'FundingPips Review 2024: Ưu điểm, nhược điểm, rules',
      date: '15/03/2024',
      readTime: '8 phút đọc',
      color: 'from-indigo-500 to-indigo-800'
    },
    {
      id: 4,
      category: 'Kiến thức',
      title: 'Spread là gì? Tại sao nó ảnh hưởng đến lợi nhuận?',
      date: '11/03/2024',
      readTime: '6 phút đọc',
      color: 'from-amber-500 to-amber-800'
    }
  ];

  const filteredArticles = activeTab === 'Tất cả' 
    ? articles 
    : articles.filter(a => a.category === activeTab);

  return (
    <section className="section bg-background">
      <div className="container mx-auto max-w-content">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <h2 className="section-title">Bài viết nổi bật</h2>
          
          <div className="flex items-center justify-between w-full md:w-auto overflow-hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto pr-4 md:pr-0">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === tab 
                      ? 'bg-foreground text-background' 
                      : 'bg-background-secondary text-text-secondary hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Link href="/kien-thuc" className="hidden lg:inline-flex whitespace-nowrap ml-4 text-sm font-semibold text-primary hover:text-primary-hover">
              Xem tất cả →
            </Link>
          </div>
        </div>

        <div className="scroll-container md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible">
          {filteredArticles.map((article) => (
            <Link key={article.id} href="#" className="card p-0 overflow-hidden flex flex-col min-w-[280px] md:min-w-0 group">
              <div className={`h-[180px] w-full bg-gradient-to-br ${article.color} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                  <span className="text-6xl font-bold text-white leading-none tracking-tighter">DDT</span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <span className="badge badge-neutral text-[10px]">{article.category}</span>
                </div>
                <h3 className="font-bold text-foreground text-lg leading-tight mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="mt-auto flex items-center justify-between text-xs text-text-tertiary font-medium">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {article.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                    {article.readTime}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
