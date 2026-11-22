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
    <div className="figure-box my-8">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
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
        <div className="figure-controls">
          {controls}
        </div>
      )}

      {/* Caption */}
      {caption && (
        <p className="px-4 pb-3 text-xs text-slate-500 italic leading-relaxed">{caption}</p>
      )}
    </div>
  );
}
