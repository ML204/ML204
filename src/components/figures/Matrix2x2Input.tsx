'use client';

import { useEffect, useState } from 'react';
import type { Mat2 } from './linearAlgebraMath';

interface Matrix2x2InputProps {
  label: string;
  matrix: Mat2;
  min?: number;
  max?: number;
  accent?: 'blue' | 'indigo' | 'emerald' | 'purple';
  onChange: (next: Mat2) => void;
}

const ACCENT_CLASSES: Record<NonNullable<Matrix2x2InputProps['accent']>, string> = {
  blue: 'text-blue-400 border-blue-500/40 focus:border-blue-400',
  indigo: 'text-indigo-300 border-indigo-500/40 focus:border-indigo-400',
  emerald: 'text-emerald-400 border-emerald-500/40 focus:border-emerald-400',
  purple: 'text-purple-300 border-purple-500/40 focus:border-purple-400',
};

/**
 * Compact dark-panel 2x2 matrix editor with bracket visuals and smooth typing buffers.
 */
export function Matrix2x2Input({
  label,
  matrix,
  min = -3.5,
  max = 3.5,
  accent = 'blue',
  onChange,
}: Matrix2x2InputProps) {
  const [cells, setCells] = useState<[[string, string], [string, string]]>([
    [matrix[0][0].toFixed(1), matrix[0][1].toFixed(1)],
    [matrix[1][0].toFixed(1), matrix[1][1].toFixed(1)],
  ]);

  useEffect(() => {
    setCells([
      [matrix[0][0].toFixed(1), matrix[0][1].toFixed(1)],
      [matrix[1][0].toFixed(1), matrix[1][1].toFixed(1)],
    ]);
  }, [matrix]);

  function handleCellChange(r: 0 | 1, c: 0 | 1, raw: string) {
    setCells((prev) => {
      const next: [[string, string], [string, string]] = [
        [prev[0][0], prev[0][1]],
        [prev[1][0], prev[1][1]],
      ];
      next[r][c] = raw;
      return next;
    });

    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, parsed));
      const updated: Mat2 = [
        [matrix[0][0], matrix[0][1]],
        [matrix[1][0], matrix[1][1]],
      ];
      updated[r][c] = clamped;
      onChange(updated);
    }
  }

  function handleBlur(r: 0 | 1, c: 0 | 1) {
    setCells((prev) => {
      const next: [[string, string], [string, string]] = [
        [prev[0][0], prev[0][1]],
        [prev[1][0], prev[1][1]],
      ];
      next[r][c] = matrix[r][c].toFixed(1);
      return next;
    });
  }

  const accentCls = ACCENT_CLASSES[accent];

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
      <span className="text-slate-300 text-xs font-semibold whitespace-nowrap">{label} =</span>
      <div className="flex items-center gap-1">
        <span className="text-slate-400 text-xl font-light leading-none select-none">[</span>
        <div className="grid grid-cols-2 gap-1">
          {([0, 1] as const).map((r) =>
            ([0, 1] as const).map((c) => (
              <input
                key={`${r}-${c}`}
                type="text"
                inputMode="decimal"
                aria-label={`${label} row ${r + 1} col ${c + 1}`}
                value={cells[r][c]}
                onChange={(e) => handleCellChange(r, c, e.target.value)}
                onBlur={() => handleBlur(r, c)}
                className={`w-10 h-6 bg-slate-950 font-mono text-center font-bold rounded border focus:outline-none text-[11px] transition-colors ${accentCls}`}
              />
            ))
          )}
        </div>
        <span className="text-slate-400 text-xl font-light leading-none select-none">]</span>
      </div>
    </div>
  );
}
