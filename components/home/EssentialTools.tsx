import Link from 'next/link';
import { Calculator, ShieldAlert, TrendingDown, PieChart, Activity, BarChart2, Clock, Scale } from 'lucide-react';

const tools = [
  {
    name: 'Lot Size Calculator',
    icon: Calculator,
    href: '/cong-cu/lot-calculator',
    color: 'text-primary bg-primary/10',
  },
  {
    name: 'Risk Calculator',
    icon: ShieldAlert,
    href: '/cong-cu/risk-calculator',
    color: 'text-danger bg-danger/10',
  },
  {
    name: 'Drawdown Calculator',
    icon: TrendingDown,
    href: '/cong-cu/drawdown-calculator',
    color: 'text-warning bg-warning/10',
  },
  {
    name: 'Position Size',
    icon: PieChart,
    href: '/cong-cu/position-size',
    color: 'text-info bg-info/10',
  },
  {
    name: 'Pip Calculator',
    icon: Activity,
    href: '/cong-cu/pip-calculator',
    color: 'text-success bg-success/10',
  },
  {
    name: 'RR Calculator',
    icon: BarChart2,
    href: '/cong-cu/rr-calculator',
    color: 'text-purple-500 bg-purple-500/10',
  },
  {
    name: 'Session Clock',
    icon: Clock,
    href: '/cong-cu/session-clock',
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    name: 'Prop Firm Compare',
    icon: Scale,
    href: '/prop-firm/so-sanh',
    color: 'text-blue-500 bg-blue-500/10',
  },
];

export default function EssentialTools() {
  return (
    <section className="mt-16 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Công cụ giao dịch miễn phí</h2>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link 
            key={tool.name} 
            href={tool.href}
            className="group flex flex-col items-start p-5 rounded-2xl border border-border bg-surface hover:border-primary/30 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${tool.color}`}>
              <tool.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-foreground text-sm mb-2">{tool.name}</h3>
            <span className="text-[11px] font-medium text-primary mt-auto flex items-center gap-1 group-hover:underline">
              Dùng ngay <span className="text-lg leading-none transition-transform group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
