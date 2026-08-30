import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Công cụ Trading',
  description: 'Các công cụ hỗ trợ tính toán miễn phí dành cho trader: Pip Calculator, Lot Calculator, Risk/Reward Calculator.',
};

const TOOLS = [
  { slug: 'pip-calculator', title: 'Pip Calculator', description: 'Tính giá trị pip theo cặp tiền và lot size' },
  { slug: 'lot-calculator', title: 'Lot Calculator', description: 'Tính lot size dựa trên % risk vốn và stop loss' },
  { slug: 'risk-reward', title: 'Risk/Reward Calculator', description: 'Tính tỷ lệ R:R và breakeven win rate' },
];

export default function CongCuPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">Công cụ Trading</h1>
      <p className="text-gray-400 mb-10">Các công cụ tính toán miễn phí hỗ trợ giao dịch.</p>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            href={`/cong-cu/${tool.slug}`}
            className="group block rounded-xl border border-gray-800 bg-gray-900 p-6 hover:border-emerald-500/50 transition-colors"
          >
            <Calculator className="w-8 h-8 text-emerald-400 mb-4" />
            <h2 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm text-gray-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
