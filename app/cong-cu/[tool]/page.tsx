'use client';

import { useState } from 'react';

// Tool configurations
const TOOLS = {
  'pip-calculator': {
    title: 'Pip Calculator',
    description: 'Tính giá trị pip theo cặp tiền và lot size',
  },
  'lot-calculator': {
    title: 'Lot Calculator',
    description: 'Tính lot size dựa trên % risk vốn và stop loss',
  },
  'risk-reward': {
    title: 'Risk/Reward Calculator',
    description: 'Tính tỷ lệ R:R và breakeven win rate',
  },
};

// ── Pip Calculator ────────────────────────────────────────────────────────────
function PipCalculator() {
  const [pipSize, setPipSize] = useState('0.0001');
  const [lotSize, setLotSize] = useState('1');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const pip = parseFloat(pipSize);
    const lot = parseFloat(lotSize);
    if (isNaN(pip) || isNaN(lot) || lot <= 0) return;
    // Standard formula: pip value = pip size × lot × 100,000
    setResult(pip * lot * 100_000);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Pip Size (e.g. 0.0001 for EUR/USD)</label>
        <input
          id="pip-size"
          type="number"
          step="0.00001"
          value={pipSize}
          onChange={(e) => setPipSize(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">Lot Size</label>
        <input
          id="lot-size-pip"
          type="number"
          step="0.01"
          value={lotSize}
          onChange={(e) => setLotSize(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
        />
      </div>
      <button
        id="calculate-pip"
        onClick={calculate}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400 transition-colors"
      >
        Tính
      </button>
      {result !== null && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
          <p className="text-sm text-gray-400">Giá trị 1 pip</p>
          <p className="text-3xl font-bold text-emerald-400">${result.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// ── Lot Calculator ────────────────────────────────────────────────────────────
function LotCalculator() {
  const [balance, setBalance] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1');
  const [stopLossPips, setStopLossPips] = useState('50');
  const [pipValue, setPipValue] = useState('10');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const bal = parseFloat(balance);
    const risk = parseFloat(riskPercent) / 100;
    const sl = parseFloat(stopLossPips);
    const pv = parseFloat(pipValue);
    if ([bal, risk, sl, pv].some(isNaN) || sl <= 0 || pv <= 0) return;
    const riskAmount = bal * risk;
    const lotSize = riskAmount / (sl * pv);
    setResult(lotSize);
  };

  return (
    <div className="space-y-4">
      {[
        { id: 'balance', label: 'Số vốn ($)', value: balance, setter: setBalance, step: '100' },
        { id: 'risk-pct', label: 'Risk (%)', value: riskPercent, setter: setRiskPercent, step: '0.1' },
        { id: 'sl-pips', label: 'Stop Loss (pips)', value: stopLossPips, setter: setStopLossPips, step: '1' },
        { id: 'pip-val', label: 'Pip Value ($) per standard lot', value: pipValue, setter: setPipValue, step: '0.1' },
      ].map(({ id, label, value, setter, step }) => (
        <div key={id}>
          <label htmlFor={id} className="block text-sm text-gray-400 mb-1">{label}</label>
          <input
            id={id}
            type="number"
            step={step}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      ))}
      <button
        id="calculate-lot"
        onClick={calculate}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400 transition-colors"
      >
        Tính Lot Size
      </button>
      {result !== null && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-center">
          <p className="text-sm text-gray-400">Lot Size khuyến nghị</p>
          <p className="text-3xl font-bold text-emerald-400">{result.toFixed(2)} lots</p>
          <p className="text-sm text-gray-500 mt-1">
            Risk amount: ${(parseFloat(balance) * parseFloat(riskPercent) / 100).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Risk/Reward Calculator ─────────────────────────────────────────────────────
function RiskRewardCalculator() {
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [result, setResult] = useState<{ rr: number; breakeven: number } | null>(null);

  const calculate = () => {
    const e = parseFloat(entry), s = parseFloat(sl), t = parseFloat(tp);
    if ([e, s, t].some(isNaN)) return;
    const risk = Math.abs(e - s);
    const reward = Math.abs(t - e);
    if (risk === 0) return;
    const rr = reward / risk;
    const breakeven = (1 / (1 + rr)) * 100;
    setResult({ rr, breakeven });
  };

  return (
    <div className="space-y-4">
      {[
        { id: 'rr-entry', label: 'Entry Price', value: entry, setter: setEntry },
        { id: 'rr-sl', label: 'Stop Loss', value: sl, setter: setSl },
        { id: 'rr-tp', label: 'Take Profit', value: tp, setter: setTp },
      ].map(({ id, label, value, setter }) => (
        <div key={id}>
          <label htmlFor={id} className="block text-sm text-gray-400 mb-1">{label}</label>
          <input
            id={id}
            type="number"
            step="any"
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      ))}
      <button
        id="calculate-rr"
        onClick={calculate}
        className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white hover:bg-emerald-400 transition-colors"
      >
        Tính R:R
      </button>
      {result !== null && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2 text-center">
          <div>
            <p className="text-sm text-gray-400">Tỷ lệ Risk:Reward</p>
            <p className="text-3xl font-bold text-emerald-400">1:{result.rr.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Breakeven Win Rate</p>
            <p className="text-xl font-bold text-yellow-400">{result.breakeven.toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface Props {
  params: { tool: string };
}

export default function ToolPage({ params }: Props) {
  const toolConfig = TOOLS[params.tool as keyof typeof TOOLS];

  if (!toolConfig) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white">Công cụ không tồn tại</h1>
        <a href="/cong-cu/pip-calculator" className="mt-4 text-emerald-400 hover:underline inline-block">
          ← Về Pip Calculator
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">{toolConfig.title}</h1>
      <p className="text-gray-400 mb-8">{toolConfig.description}</p>

      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        {params.tool === 'pip-calculator' && <PipCalculator />}
        {params.tool === 'lot-calculator' && <LotCalculator />}
        {params.tool === 'risk-reward' && <RiskRewardCalculator />}
      </div>

      {/* Navigation to other tools */}
      <div className="mt-8 flex gap-3 flex-wrap">
        {Object.entries(TOOLS)
          .filter(([key]) => key !== params.tool)
          .map(([key, cfg]) => (
            <a
              key={key}
              href={`/cong-cu/${key}`}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:border-emerald-500 hover:text-white transition-colors"
            >
              {cfg.title}
            </a>
          ))}
      </div>
    </div>
  );
}
