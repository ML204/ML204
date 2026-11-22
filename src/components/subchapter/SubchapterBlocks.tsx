'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Section wrapper ──────────────────────────────────────────────────────────

interface SectionProps {
  id?: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ id, label, className, children }: SectionProps) {
  return (
    <section id={id} className={cn('mb-10', className)}>
      {label && (
        <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-3">
          {label}
        </p>
      )}
      {children}
    </section>
  );
}

// ─── Callout / Info box ────────────────────────────────────────────────────────

type CalloutKind = 'info' | 'tip' | 'warning' | 'formula';

const calloutStyles: Record<CalloutKind, string> = {
  info:    'bg-blue-50   border-blue-300  text-blue-900',
  tip:     'bg-green-50  border-green-300 text-green-900',
  warning: 'bg-amber-50  border-amber-300 text-amber-900',
  formula: 'bg-slate-50  border-slate-300 text-slate-900 font-mono',
};
const calloutIcons: Record<CalloutKind, string> = {
  info:    'ℹ️',
  tip:     '💡',
  warning: '⚠️',
  formula: '📐',
};

export function Callout({ kind = 'info', children }: { kind?: CalloutKind; children: React.ReactNode }) {
  return (
    <div className={cn('flex gap-3 rounded-xl border px-4 py-3 my-4 text-sm', calloutStyles[kind])}>
      <span className="text-base flex-shrink-0 mt-0.5">{calloutIcons[kind]}</span>
      <div>{children}</div>
    </div>
  );
}

// ─── Analogy block ─────────────────────────────────────────────────────────────

export function Analogy({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative pl-5 my-5">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-brand-300" />
      <div className="text-slate-600 italic text-sm leading-relaxed [&>p]:mb-0 [&>p]:inline">
        {children}
      </div>
    </div>
  );
}

// ─── Formula display ───────────────────────────────────────────────────────────

export function Formula({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div className="my-6 rounded-xl bg-slate-50 border border-slate-200 overflow-x-auto">
      {label && (
        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200">
          {label}
        </div>
      )}
      <div className="px-6 py-4 text-center text-lg">{children}</div>
    </div>
  );
}

// ─── Symbol table (formula explanation) ───────────────────────────────────────

export function SymbolTable({ rows }: { rows: { symbol: string; meaning: string }[] }) {
  return (
    <div className="w-full overflow-x-auto my-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-3.5 py-2.5 font-semibold text-slate-700 w-24">Symbol</th>
            <th className="text-left px-3.5 py-2.5 font-semibold text-slate-700">Meaning</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ symbol, meaning }) => (
            <tr key={symbol} className="border-b border-slate-100 last:border-b-0">
              <td className="px-3.5 py-2 font-mono text-brand-700">{symbol}</td>
              <td className="px-3.5 py-2 text-slate-700">{meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────

export function Divider() {
  return <hr className="section-divider" />;
}
