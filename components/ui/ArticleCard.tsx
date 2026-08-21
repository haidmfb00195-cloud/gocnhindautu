import Image from 'next/image';
import Link from 'next/link';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  slug: string;
  categorySlug: string;
}

export default function ArticleCard({ title, excerpt, date, imageUrl, slug, categorySlug }: ArticleCardProps) {
  return (
    <Link href={`/${categorySlug}/${slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gradient-dark-card border border-border">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/10 font-bold text-xl">
            GOCNHINDAUTU
          </div>
        )}
        <div className="absolute top-3 left-3 bg-black text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow-md">
          {date}
        </div>
      </div>
      <div>
        <h3 className="font-bold text-foreground text-[16px] md:text-[18px] leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-text-secondary text-sm line-clamp-2">
          {excerpt}
        </p>
      </div>
    </Link>
  );
}
