'use client';

import { useState } from 'react';

interface TeachThisCardProps {
  topic: string;
  oneLiner: string;
  takeaways: string[];
  commonTrap: string;
}

export function TeachThisCard({ topic, oneLiner, takeaways, commonTrap }: TeachThisCardProps) {
  const [copied, setCopied] = useState(false);

  function copyCard() {
    const text = `📚 Teach This: ${topic}\n\n💡 Core Idea:\n${oneLiner}\n\n🔑 Key Takeaways:\n${takeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n⚠️ Common Trap:\n${commonTrap}\n\n— via MLens (mlens.dev)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-8 rounded-2xl border-2 border-brand-200 bg-gradient-to-br from-brand-50/60 to-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
              Feynman Teaching Card
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Teach This: {topic}
            </h3>
          </div>
        </div>

        <button
          onClick={copyCard}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-300 bg-white text-brand-700 hover:bg-brand-50 transition-colors shadow-2xs"
        >
          {copied ? '✓ Copied' : '📋 Copy Summary'}
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Core Intuition
          </p>
          <p className="text-slate-800 font-medium leading-relaxed bg-white/80 p-3 rounded-xl border border-brand-100">
            {oneLiner}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Key Concepts to Explain
          </p>
          <ul className="space-y-1.5">
            {takeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-slate-700 leading-snug">
                <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-brand-100">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            ⚠️ What Most Students Get Confused About
          </p>
          <p className="text-xs text-slate-600 italic">
            {commonTrap}
          </p>
        </div>
      </div>
    </div>
  );
}
