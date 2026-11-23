'use client';

import React from 'react';

interface FigureBoxProps {
  title?: string;
  caption?: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  liveValues?: React.ReactNode;
}

/**
 * FigureBox — the standard wrapper for every interactive figure.
 * Accepts an SVG/canvas area, optional controls panel, and live values panel.
 */
export function FigureBox({ title, caption, children, controls, liveValues }: FigureBoxProps) {
  return (
    <div className="figure-box my-6 sm:my-8 rounded-xl sm:rounded-2xl border border-[#ded5bd] shadow-2xs overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#ded5bd] bg-[#f8f4e6]">
          <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">{title}</p>
        </div>
      )}

      {/* Main figure area */}
      <div className="relative w-full overflow-hidden bg-white">
        {children}
      </div>

      {/* Live values */}
      {liveValues}

      {/* Controls */}
      {controls && (
        <div className="figure-controls bg-[#fcfaf2]/90 border-t border-[#ded5bd]">
          {controls}
        </div>
      )}

      {/* Caption */}
      {caption && (
        <p className="px-4 py-3 text-xs text-stone-600 italic leading-relaxed bg-[#fcfaf2]/70 border-t border-[#eae2cc]">{caption}</p>
      )}
    </div>
  );
}
