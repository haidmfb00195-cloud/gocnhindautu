'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MOCK_ARTICLES = [
  { id: 1, title: 'Review chi tiết quỹ FTMO mới nhất', image: '', slug: 'review-ftmo', category: 'trade-quy' },
  { id: 2, title: 'Tại sao Price Action là chân ái?', image: '', slug: 'price-action', category: 'kien-thuc' },
  { id: 3, title: 'Top 5 sàn Forex uy tín cho trader Việt', image: '', slug: 'top-san-forex', category: 'san-giao-dich' },
  { id: 4, title: 'Quản lý rủi ro 1% hay 2%?', image: '', slug: 'quan-ly-rui-ro', category: 'kien-thuc' },
];

export default function SidebarLatestPopular() {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex gap-4 border-b border-border">
        <button 
          className={`pb-2 font-bold text-sm uppercase transition-colors ${activeTab === 'latest' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-foreground'}`}
          onClick={() => setActiveTab('latest')}
        >
          Mới nhất
        </button>
        <button 
          className={`pb-2 font-bold text-sm uppercase transition-colors ${activeTab === 'popular' ? 'text-accent border-b-2 border-accent' : 'text-text-secondary hover:text-foreground'}`}
          onClick={() => setActiveTab('popular')}
        >
          Xem nhiều
        </button>
      </div>
      <div className="flex flex-col gap-4 pt-2">
        {MOCK_ARTICLES.map(article => (
          <Link key={article.id} href={`/${article.category}/${article.slug}`} className="flex gap-3 group">
            <div className="w-20 h-20 shrink-0 relative rounded-lg overflow-hidden bg-background-secondary border border-border">
              {article.image ? (
                <Image src={article.image} alt={article.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-tertiary text-xs font-bold bg-gradient-dark-card text-white/20">
                  IMG
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
