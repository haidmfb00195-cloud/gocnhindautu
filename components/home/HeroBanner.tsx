import Image from 'next/image';
import Link from 'next/link';

export default function HeroBanner() {
  return (
    <Link href="/kien-thuc/bi-quyet-giao-dich-quy-thanh-cong" className="group block relative w-full aspect-[16/9] md:aspect-[2/1] rounded-2xl overflow-hidden border border-border">
      <Image 
        src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200"
        alt="Hero Banner"
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-10">
        <div className="bg-primary text-black font-bold text-xs uppercase px-3 py-1 rounded-full w-max mb-3">
          TIN TỨC NỔI BẬT
        </div>
        <h2 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
          Bí quyết vượt qua vòng thử thách của các quỹ cấp vốn lớn nhất
        </h2>
        <p className="text-gray-300 line-clamp-2 md:text-lg">
          Hướng dẫn chi tiết cách quản lý vốn, tâm lý giao dịch và chiến lược hiệu quả để nhận tài khoản cấp vốn lên đến $200,000 từ các Prop Firm uy tín.
        </p>
      </div>
    </Link>
  );
}
