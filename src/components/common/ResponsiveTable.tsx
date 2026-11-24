'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
}

export function ResponsiveTable({ children }: ResponsiveTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0); // 0 to 1
  const [thumbWidthPct, setThumbWidthPct] = useState(30);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const overflowing = el.scrollWidth > el.clientWidth + 2;
    setIsOverflowing(overflowing);
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 6);

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      const progress = Math.max(0, Math.min(1, el.scrollLeft / maxScroll));
      setScrollProgress(progress);
      const ratio = Math.max(0.2, Math.min(0.8, el.clientWidth / el.scrollWidth));
      setThumbWidthPct(ratio * 100);
    }
  }, []);

  useEffect(() => {
    checkScroll();

    // Re-check after layout settles (fonts/math/katex loading)
    const timer1 = setTimeout(checkScroll, 100);
    const timer2 = setTimeout(checkScroll, 500);

    window.addEventListener('resize', checkScroll);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', checkScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const handleScrollBy = (offset: number) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full my-6 rounded-xl border border-[#ded5bd] bg-[#fcfaf2]/95 shadow-2xs overflow-hidden">
      {/* Mobile & tablet visual hint banner shown when content overflows */}
      {isOverflowing && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#f6efe1] border-b border-[#ded5bd] text-[11px] text-stone-600 font-medium select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-brand-700 font-bold">📋</span>
            <span className="font-semibold text-stone-800">Table</span>
          </div>
          <div className="flex items-center gap-1 text-brand-800 font-semibold text-[11px]">
            <span>Scroll horizontally</span>
            <span className="inline-block animate-pulse font-bold text-xs">⟷</span>
          </div>
        </div>
      )}

      {/* Scrollable table container */}
      <div
        ref={containerRef}
        onScroll={checkScroll}
        className="w-full overflow-x-auto table-scrollbar relative"
      >
        {children}
      </div>

      {/* Permanently visible custom scroll bar & navigation controls */}
      {isOverflowing && (
        <div className="px-3 py-2 bg-[#f8f5eb] border-t border-[#ded5bd] flex items-center gap-2 select-none">
          <button
            type="button"
            aria-label="Scroll table left"
            onClick={() => handleScrollBy(-180)}
            disabled={!canScrollLeft}
            className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
              canScrollLeft
                ? 'text-stone-800 bg-stone-200/90 hover:bg-stone-300 active:scale-95'
                : 'text-stone-300 cursor-not-allowed opacity-30'
            }`}
          >
            ←
          </button>

          {/* Always visible visual scrollbar track & thumb */}
          <div className="flex-1 h-2.5 bg-[#ded5bd]/80 rounded-full overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-75"
              style={{
                width: `${thumbWidthPct}%`,
                marginLeft: `${scrollProgress * (100 - thumbWidthPct)}%`,
              }}
            />
          </div>

          <button
            type="button"
            aria-label="Scroll table right"
            onClick={() => handleScrollBy(180)}
            disabled={!canScrollRight}
            className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
              canScrollRight
                ? 'text-stone-800 bg-stone-200/90 hover:bg-stone-300 active:scale-95'
                : 'text-stone-300 cursor-not-allowed opacity-30'
            }`}
          >
            →
          </button>

          <span className="text-[10px] text-stone-600 font-medium font-mono whitespace-nowrap pl-0.5">
            {canScrollRight ? 'more →' : 'end ✓'}
          </span>
        </div>
      )}
    </div>
  );
}
