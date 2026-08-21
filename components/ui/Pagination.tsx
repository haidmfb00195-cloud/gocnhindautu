import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {pages.map((page) => {
        const isActive = page === currentPage;
        return (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-primary text-black' 
                : 'bg-bg-secondary border border-border text-foreground hover:border-primary'
            }`}
          >
            {page}
          </Link>
        );
      })}
    </div>
  );
}
