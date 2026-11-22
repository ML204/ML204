'use client';

import React from 'react';
import { cn } from '@/lib/utils';

// ─── Slider ────────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
}

export function Slider({
  label, value, min, max, step = 0.01, unit = '',
  onChange, formatValue,
}: SliderProps) {
  const display = formatValue ? formatValue(value) : value.toFixed(2);
  return (
    <div className="flex flex-col gap-1 min-w-[140px] flex-1">
      <div className="flex justify-between items-center">
        <span className="control-label">{label}</span>
        <span className="text-xs font-mono font-semibold text-brand-700 tabular-nums">
          {display}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full accent-brand-600 cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Toggle ────────────────────────────────────────────────────────────────────

interface ToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
        value
          ? 'bg-brand-600 border-brand-600 text-white'
          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', value ? 'bg-white' : 'bg-slate-400')} />
      {label}
    </button>
  );
}

// ─── Dropdown ──────────────────────────────────────────────────────────────────

interface DropdownProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function Dropdown<T extends string>({ label, value, options, onChange }: DropdownProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <span className="control-label">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="px-2 py-1.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-700
                   focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Preset buttons ────────────────────────────────────────────────────────────

interface PresetsProps {
  presets: { label: string; onApply: () => void }[];
  onReset: () => void;
  onBreakIt?: () => void;
}

export function Presets({ presets, onReset, onBreakIt }: PresetsProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="control-label">Presets:</span>
      {presets.map((p) => (
        <button key={p.label} onClick={p.onApply} className="preset-btn">
          {p.label}
        </button>
      ))}
      <button onClick={onReset} className="preset-btn text-slate-500">↺ Reset</button>
      {onBreakIt && (
        <button onClick={onBreakIt} className="preset-btn text-red-600 border-red-200 hover:bg-red-50">
          💥 Break it
        </button>
      )}
    </div>
  );
}

// ─── Live values panel ─────────────────────────────────────────────────────────

interface LiveValuesPanelProps {
  values: { label: string; value: string | number; color?: string }[];
}

export function LiveValuesPanel({ values }: LiveValuesPanelProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 px-3 sm:px-4 py-2 bg-slate-900 text-xs sm:text-sm font-mono rounded-b-xl">
      {values.map(({ label, value, color = '#a5b4fc' }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[10px] sm:text-xs">{label}:</span>
          <span className="font-semibold tabular-nums" style={{ color }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Play / Pause / Step buttons ───────────────────────────────────────────────

interface PlayControlsProps {
  playing: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function PlayControls({ playing, onPlay, onPause, onStep, onReset }: PlayControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {playing ? (
        <button onClick={onPause} className="preset-btn">⏸ Pause</button>
      ) : (
        <button onClick={onPlay} className="preset-btn bg-brand-50 border-brand-300 text-brand-700">
          ▶ Play
        </button>
      )}
      <button onClick={onStep} disabled={playing} className="preset-btn disabled:opacity-40">
        ⏭ Step
      </button>
      <button onClick={onReset} className="preset-btn">↺ Reset</button>
    </div>
  );
}
