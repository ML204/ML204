'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';

export function VectorMatrixFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 350 });

  // Vector v (blue) and Vector u (orange)
  const [v, setV] = useState<{ x: number; y: number }>({ x: 3, y: 2 });
  const [u, setU] = useState<{ x: number; y: number }>({ x: 1, y: 3 });

  // Sum = v + u (green)
  const sum = useMemo(() => ({ x: v.x + u.x, y: v.y + u.y }), [v.x, v.y, u.x, u.y]);

  const magV = Math.sqrt(v.x * v.x + v.y * v.y);
  const magU = Math.sqrt(u.x * u.x + u.y * u.y);
  const magSum = Math.sqrt(sum.x * sum.x + sum.y * sum.y);

  // String buffers for smooth coordinate input editing
  const [inputVx, setInputVx] = useState('3.0');
  const [inputVy, setInputVy] = useState('2.0');
  const [inputUx, setInputUx] = useState('1.0');
  const [inputUy, setInputUy] = useState('3.0');
  const [inputSumX, setInputSumX] = useState('4.0');
  const [inputSumY, setInputSumY] = useState('5.0');
  const [inputMagSum, setInputMagSum] = useState('6.40');

  // Synchronize input strings when v or u change via drag or presets
  useEffect(() => {
    setInputVx(v.x.toFixed(1));
    setInputVy(v.y.toFixed(1));
  }, [v.x, v.y]);

  useEffect(() => {
    setInputUx(u.x.toFixed(1));
    setInputUy(u.y.toFixed(1));
  }, [u.x, u.y]);

  useEffect(() => {
    setInputSumX(sum.x.toFixed(1));
    setInputSumY(sum.y.toFixed(1));
    setInputMagSum(magSum.toFixed(2));
  }, [sum.x, sum.y, magSum]);

  // Responsive size observer
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 620;
      // Responsive height maintaining balanced display across devices
      const h = w < 480 ? 320 : Math.round(Math.min(400, Math.max(300, w * 0.60)));
      setDimensions({ width: w, height: h });
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Draw D3 Visual Canvas with 1:1 Isotropic Scaling (Equal X & Y Units)
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    const isMobile = width < 500;
    const margin = isMobile
      ? { top: 16, right: 16, bottom: 16, left: 16 }
      : { top: 22, right: 22, bottom: 22, left: 22 };

    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    // Guaranteed 1:1 Aspect Ratio (1 unit on X = 1 unit on Y in pixels)
    const yHalf = 5.5; // visible vertical range [-5.5, +5.5]
    const pixelsPerUnit = iH / (2 * yHalf);
    const xHalf = (iW / 2) / pixelsPerUnit; // horizontal range scales isotropically

    const xDomain: [number, number] = [-xHalf, xHalf];
    const yDomain: [number, number] = [-yHalf, yHalf];

    const xs = d3.scaleLinear().domain(xDomain).range([0, iW]);
    const ys = d3.scaleLinear().domain(yDomain).range([iH, 0]);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 1. Grid Lines (Every integer unit is a perfect geometric square)
    const xMinInt = Math.floor(xDomain[0]);
    const xMaxInt = Math.ceil(xDomain[1]);
    const yMinInt = Math.floor(yDomain[0]);
    const yMaxInt = Math.ceil(yDomain[1]);

    const gridGroup = g.append('g').attr('class', 'grid');

    // Vertical grid lines (every 1.0 unit)
    for (let x = xMinInt; x <= xMaxInt; x++) {
      if (x === 0) continue;
      gridGroup.append('line')
        .attr('x1', xs(x)).attr('x2', xs(x))
        .attr('y1', 0).attr('y2', iH)
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1);
    }

    // Horizontal grid lines (every 1.0 unit)
    for (let y = yMinInt; y <= yMaxInt; y++) {
      if (y === 0) continue;
      gridGroup.append('line')
        .attr('x1', 0).attr('x2', iW)
        .attr('y1', ys(y)).attr('y2', ys(y))
        .attr('stroke', '#f1f5f9')
        .attr('stroke-width', 1);
    }

    // 2. Main Axes (x=0, y=0)
    g.append('line')
      .attr('x1', 0).attr('x2', iW)
      .attr('y1', ys(0)).attr('y2', ys(0))
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    g.append('line')
      .attr('x1', xs(0)).attr('x2', xs(0))
      .attr('y1', 0).attr('y2', iH)
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);

    // Subtle coordinate tick marks and labels on axes
    const tickValues = [-4, -2, 2, 4];
    tickValues.forEach((t) => {
      // X-axis tick
      if (t >= xDomain[0] + 0.6 && t <= xDomain[1] - 0.6) {
        g.append('line')
          .attr('x1', xs(t)).attr('x2', xs(t))
          .attr('y1', ys(0) - 3).attr('y2', ys(0) + 3)
          .attr('stroke', '#cbd5e1').attr('stroke-width', 1);
        g.append('text')
          .attr('x', xs(t)).attr('y', ys(0) + 13)
          .attr('fill', '#94a3b8').attr('font-size', 9).attr('font-family', 'monospace')
          .attr('text-anchor', 'middle')
          .text(t);
      }
      // Y-axis tick
      if (t >= yDomain[0] + 0.6 && t <= yDomain[1] - 0.6) {
        g.append('line')
          .attr('x1', xs(0) - 3).attr('x2', xs(0) + 3)
          .attr('y1', ys(t)).attr('y2', ys(t))
          .attr('stroke', '#cbd5e1').attr('stroke-width', 1);
        g.append('text')
          .attr('x', xs(0) - 6).attr('y', ys(t) + 3)
          .attr('fill', '#94a3b8').attr('font-size', 9).attr('font-family', 'monospace')
          .attr('text-anchor', 'end')
          .text(t);
      }
    });

    // Axis name labels
    g.append('text')
      .attr('x', iW - 4).attr('y', ys(0) - 6)
      .attr('fill', '#94a3b8').attr('font-size', isMobile ? 10 : 11).attr('font-weight', 600).attr('text-anchor', 'end')
      .text('x₁');
    g.append('text')
      .attr('x', xs(0) + 6).attr('y', 12)
      .attr('fill', '#94a3b8').attr('font-size', isMobile ? 10 : 11).attr('font-weight', 600)
      .text('x₂');

    // Origin marker (0, 0)
    g.append('circle')
      .attr('cx', xs(0)).attr('cy', ys(0))
      .attr('r', 3).attr('fill', '#94a3b8');

    // Helper to draw clean geometric arrowheads without SVG marker clipping
    const drawArrow = (
      fromX: number,
      fromY: number,
      toX: number,
      toY: number,
      color: string,
      strokeWidth = 2.5
    ) => {
      const dx = toX - fromX;
      const dy = toY - fromY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 2) return;

      const angle = Math.atan2(dy, dx);
      const headLength = isMobile ? 10 : 12;
      const headAngle = Math.PI / 7; // 25.7 degrees

      // Line stops right at arrowhead base so it doesn't poke out
      const shortenBy = headLength * 0.7;
      const endLineX = toX - (dx / len) * shortenBy;
      const endLineY = toY - (dy / len) * shortenBy;

      // Shaft
      g.append('line')
        .attr('x1', fromX).attr('y1', fromY)
        .attr('x2', endLineX).attr('y2', endLineY)
        .attr('stroke', color).attr('stroke-width', strokeWidth);

      // Arrowhead polygon
      const p1X = toX - headLength * Math.cos(angle - headAngle);
      const p1Y = toY - headLength * Math.sin(angle - headAngle);
      const p2X = toX - headLength * Math.cos(angle + headAngle);
      const p2Y = toY - headLength * Math.sin(angle + headAngle);

      g.append('polygon')
        .attr('points', `${toX},${toY} ${p1X},${p1Y} ${endLineX},${endLineY} ${p2X},${p2Y}`)
        .attr('fill', color);
    };

    // 3. Parallelogram helper dashed lines for vector addition
    // From tip of v to tip of sum
    g.append('line')
      .attr('x1', xs(v.x)).attr('y1', ys(v.y))
      .attr('x2', xs(sum.x)).attr('y2', ys(sum.y))
      .attr('stroke', '#3b82f6').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 3').attr('opacity', 0.5);

    // From tip of u to tip of sum
    g.append('line')
      .attr('x1', xs(u.x)).attr('y1', ys(u.y))
      .attr('x2', xs(sum.x)).attr('y2', ys(sum.y))
      .attr('stroke', '#f97316').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4 3').attr('opacity', 0.5);

    // Sum Vector Arrow (green)
    drawArrow(xs(0), ys(0), xs(sum.x), ys(sum.y), '#16a34a', isMobile ? 2.5 : 3);
    g.append('text')
      .attr('x', xs(sum.x) + 8).attr('y', ys(sum.y) - 6)
      .attr('fill', '#16a34a').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
      .text('v + u');

    // 4. Vector u (Orange)
    drawArrow(xs(0), ys(0), xs(u.x), ys(u.y), '#f97316', isMobile ? 2 : 2.5);
    g.append('text')
      .attr('x', xs(u.x) + 8).attr('y', ys(u.y) - 6)
      .attr('fill', '#f97316').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
      .text('u');

    // 5. Vector v (Blue)
    drawArrow(xs(0), ys(0), xs(v.x), ys(v.y), '#2563eb', isMobile ? 2 : 2.5);
    g.append('text')
      .attr('x', xs(v.x) + 8).attr('y', ys(v.y) - 6)
      .attr('fill', '#2563eb').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
      .text('v');

    // 6. Interactive Draggable Handle for Vector v (Blue dot)
    const dragV = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const roundedX = Math.round(Math.max(-5, Math.min(5, rawX)) * 2) / 2;
        const roundedY = Math.round(Math.max(-5, Math.min(5, rawY)) * 2) / 2;
        setV({ x: roundedX, y: roundedY });
      });

    const vHandleGroup = g.append('g')
      .attr('transform', `translate(${xs(v.x)},${ys(v.y)})`)
      .style('cursor', 'grab')
      .call(dragV);

    vHandleGroup.append('circle')
      .attr('r', 26)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    vHandleGroup.append('circle')
      .attr('r', isMobile ? 9 : 8)
      .attr('fill', '#2563eb')
      .attr('stroke', 'white')
      .attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))');

    // 7. Interactive Draggable Handle for Vector u (Orange dot)
    const dragU = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const roundedX = Math.round(Math.max(-5, Math.min(5, rawX)) * 2) / 2;
        const roundedY = Math.round(Math.max(-5, Math.min(5, rawY)) * 2) / 2;
        setU({ x: roundedX, y: roundedY });
      });

    const uHandleGroup = g.append('g')
      .attr('transform', `translate(${xs(u.x)},${ys(u.y)})`)
      .style('cursor', 'grab')
      .call(dragU);

    uHandleGroup.append('circle')
      .attr('r', 26)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    uHandleGroup.append('circle')
      .attr('r', isMobile ? 9 : 8)
      .attr('fill', '#f97316')
      .attr('stroke', 'white')
      .attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))');

    // 8. Interactive Draggable Handle for Sum Vector (Green dot)
    const dragSum = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const clampedX = Math.max(-5.5, Math.min(5.5, rawX));
        const clampedY = Math.max(-5.5, Math.min(5.5, rawY));
        const roundedX = Math.round(clampedX * 2) / 2;
        const roundedY = Math.round(clampedY * 2) / 2;
        // Dynamically shift u to maintain v + u = target
        setU({
          x: Math.round((roundedX - v.x) * 2) / 2,
          y: Math.round((roundedY - v.y) * 2) / 2,
        });
      });

    const sumHandleGroup = g.append('g')
      .attr('transform', `translate(${xs(sum.x)},${ys(sum.y)})`)
      .style('cursor', 'grab')
      .call(dragSum);

    sumHandleGroup.append('circle')
      .attr('r', 26)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    sumHandleGroup.append('circle')
      .attr('r', isMobile ? 9 : 8)
      .attr('fill', '#16a34a')
      .attr('stroke', 'white')
      .attr('stroke-width', 2.5)
      .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.2))');

  }, [v, u, sum, dimensions]);

  return (
    <FigureBox
      title="Interactive 2D Vectors & Vector Addition"
      caption="Drag any dot on the canvas (blue v, orange u, or green v + u), or click any coordinate / magnitude box in the instrument panel to edit values dynamically."
      controls={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
          {/* Mobile top bar: Presets label on left, Reset button on right */}
          <div className="flex items-center justify-between sm:hidden w-full">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Presets
            </span>
            <button
              onClick={() => { setV({ x: 3, y: 2 }); setU({ x: 1, y: 3 }); }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors active:scale-95"
            >
              ↺ Reset
            </button>
          </div>

          {/* Preset buttons: 2x2 grid on mobile, inline wrap on desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-1.5 w-full sm:w-auto">
            <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
              Presets:
            </span>
            {[
              { label: 'Standard (i, j)', onApply: () => { setV({ x: 1, y: 0 }); setU({ x: 0, y: 1 }); } },
              { label: 'Orthogonal (90°)', onApply: () => { setV({ x: 3, y: 1 }); setU({ x: -1, y: 3 }); } },
              { label: 'Collinear', onApply: () => { setV({ x: 2, y: 1 }); setU({ x: 2, y: 1 }); } },
              { label: 'Opposite', onApply: () => { setV({ x: 3, y: 2 }); setU({ x: -3, y: -2 }); } },
            ].map((p) => (
              <button
                key={p.label}
                onClick={p.onApply}
                className="px-2.5 py-1.5 sm:py-1 text-[11px] font-medium rounded-lg border border-slate-300 bg-white hover:bg-brand-50 hover:border-brand-400 text-slate-700 transition-colors active:scale-95 text-center truncate"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Desktop Reset button */}
          <button
            onClick={() => { setV({ x: 3, y: 2 }); setU({ x: 1, y: 3 }); }}
            className="hidden sm:inline-flex px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors active:scale-95"
          >
            ↺ Reset
          </button>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 gap-2">
            {/* Row 1 Left: Vector v (editable coordinates) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-blue-500/50 transition-colors">
              <span className="text-slate-400 text-xs font-semibold">v:</span>
              <div className="flex items-center gap-0.5">
                <span className="text-blue-400 font-bold text-xs">[</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputVx}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputVx(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) setV((prev) => ({ ...prev, x: Math.max(-5, Math.min(5, val)) }));
                  }}
                  onBlur={() => setInputVx(v.x.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-blue-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-blue-400/80 focus:border-blue-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit x₁ of vector v"
                />
                <span className="text-slate-500 text-[11px]">,</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputVy}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputVy(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) setV((prev) => ({ ...prev, y: Math.max(-5, Math.min(5, val)) }));
                  }}
                  onBlur={() => setInputVy(v.y.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-blue-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-blue-400/80 focus:border-blue-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit x₂ of vector v"
                />
                <span className="text-blue-400 font-bold text-xs">]ᵀ</span>
              </div>
            </div>

            {/* Row 1 Right: ||v|| (Magnitude) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">‖v‖:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs sm:text-[13px]">{magV.toFixed(2)}</span>
            </div>

            {/* Row 2 Left: Vector u (editable coordinates) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-orange-500/50 transition-colors">
              <span className="text-slate-400 text-xs font-semibold">u:</span>
              <div className="flex items-center gap-0.5">
                <span className="text-orange-400 font-bold text-xs">[</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputUx}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputUx(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) setU((prev) => ({ ...prev, x: Math.max(-5, Math.min(5, val)) }));
                  }}
                  onBlur={() => setInputUx(u.x.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-orange-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-orange-400/80 focus:border-orange-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit y₁ of vector u"
                />
                <span className="text-slate-500 text-[11px]">,</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputUy}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputUy(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) setU((prev) => ({ ...prev, y: Math.max(-5, Math.min(5, val)) }));
                  }}
                  onBlur={() => setInputUy(u.y.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-orange-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-orange-400/80 focus:border-orange-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit y₂ of vector u"
                />
                <span className="text-orange-400 font-bold text-xs">]ᵀ</span>
              </div>
            </div>

            {/* Row 2 Right: ||u|| (Magnitude) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">‖u‖:</span>
              <span className="text-orange-400 font-bold tabular-nums text-xs sm:text-[13px]">{magU.toFixed(2)}</span>
            </div>

            {/* Row 3 Left: Vector v + u (editable coordinates - dynamically changes u) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/50 transition-colors">
              <span className="text-slate-400 text-xs font-semibold">v + u:</span>
              <div className="flex items-center gap-0.5">
                <span className="text-emerald-400 font-bold text-xs">[</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputSumX}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputSumX(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) {
                      setU((prev) => ({ ...prev, x: Math.max(-5, Math.min(5, val - v.x)) }));
                    }
                  }}
                  onBlur={() => setInputSumX(sum.x.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-emerald-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-emerald-400/80 focus:border-emerald-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit x-coordinate of sum (dynamically shifts u)"
                />
                <span className="text-slate-500 text-[11px]">,</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={inputSumY}
                  onChange={(e) => {
                    const text = e.target.value;
                    setInputSumY(text);
                    const val = parseFloat(text);
                    if (!isNaN(val)) {
                      setU((prev) => ({ ...prev, y: Math.max(-5, Math.min(5, val - v.y)) }));
                    }
                  }}
                  onBlur={() => setInputSumY(sum.y.toFixed(1))}
                  className="w-8 sm:w-9 h-5 sm:h-5.5 bg-slate-950 text-emerald-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-emerald-400/80 focus:border-emerald-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                  title="Click to edit y-coordinate of sum (dynamically shifts u)"
                />
                <span className="text-emerald-400 font-bold text-xs">]ᵀ</span>
              </div>
            </div>

            {/* Row 3 Right: ||v + u|| (editable magnitude - dynamically scales sum and shifts u) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 hover:border-emerald-500/50 transition-colors">
              <span className="text-slate-400 text-xs">‖v + u‖:</span>
              <input
                type="text"
                inputMode="decimal"
                value={inputMagSum}
                onChange={(e) => {
                  const text = e.target.value;
                  setInputMagSum(text);
                  const val = parseFloat(text);
                  if (!isNaN(val) && val >= 0) {
                    const currentMag = Math.sqrt(sum.x * sum.x + sum.y * sum.y);
                    const theta = currentMag > 0.001 ? Math.atan2(sum.y, sum.x) : Math.PI / 4;
                    const newSumX = val * Math.cos(theta);
                    const newSumY = val * Math.sin(theta);
                    setU({
                      x: Math.round((newSumX - v.x) * 2) / 2,
                      y: Math.round((newSumY - v.y) * 2) / 2,
                    });
                  }
                }}
                onBlur={() => setInputMagSum(magSum.toFixed(2))}
                className="w-11 sm:w-12 h-5 sm:h-5.5 bg-slate-950 text-emerald-400 font-mono text-center font-bold px-0.5 rounded border border-slate-700/80 hover:border-emerald-400/80 focus:border-emerald-400 focus:outline-none text-[11px] sm:text-xs transition-colors"
                title="Click to edit magnitude of sum vector (dynamically shifts u)"
              />
            </div>
          </div>
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        {/* Touch instruction badge */}
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag dot tips
        </div>
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full block touch-none"
        />
      </div>
    </FigureBox>
  );
}
