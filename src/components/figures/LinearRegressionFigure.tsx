'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, Toggle } from '@/components/figures/FigureControls';

interface Point {
  id: number;
  x: number;
  y: number;
}

// Exactly follows the motivating dataset from the lecture notes (Study Hours vs Exam Score)
const INITIAL_POINTS: Point[] = [
  { id: 1, x: 1, y: 20 },
  { id: 2, x: 2, y: 35 },
  { id: 3, x: 3, y: 45 },
  { id: 4, x: 4, y: 60 },
  { id: 5, x: 5, y: 75 },
  { id: 6, x: 6, y: 85 },
];

export function LinearRegressionFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 350 });

  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  // Initial parameters: beta_1 (slope) and beta_0 (intercept)
  const [beta1, setBeta1] = useState<number>(13.1);
  const [beta0, setBeta0] = useState<number>(7.6);
  const [showResiduals, setShowResiduals] = useState<boolean>(true);

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 620;
      const height = width < 480 ? 300 : Math.round(Math.min(380, Math.max(280, width * 0.56)));
      setDimensions({ width, height });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute OLS optimal parameters
  const olsParams = useMemo(() => {
    const n = points.length;
    if (n === 0) return { beta1: 0, beta0: 0 };
    const meanX = d3.mean(points, (p) => p.x) ?? 0;
    const meanY = d3.mean(points, (p) => p.y) ?? 0;

    let num = 0;
    let den = 0;
    for (const p of points) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) * (p.x - meanX);
    }
    const optB1 = den !== 0 ? num / den : 0;
    const optB0 = meanY - optB1 * meanX;
    return {
      beta1: Math.round(optB1 * 10) / 10,
      beta0: Math.round(optB0 * 10) / 10,
    };
  }, [points]);

  // Compute Loss (MSE, RSS) and R-squared
  const stats = useMemo(() => {
    const n = points.length;
    if (n === 0) return { mse: 0, r2: 0, rss: 0 };

    const meanY = d3.mean(points, (p) => p.y) ?? 0;
    let rss = 0;
    let sst = 0;

    for (const p of points) {
      const yPred = beta0 + beta1 * p.x;
      const err = p.y - yPred;
      rss += err * err;
      sst += (p.y - meanY) * (p.y - meanY);
    }

    const mse = rss / n;
    const r2 = sst !== 0 ? Math.max(-2, 1 - rss / sst) : 0;

    return { mse, r2, rss };
  }, [points, beta0, beta1]);

  // Render D3 Graphic
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    const isMobile = width < 500;
    const margin = isMobile
      ? { top: 16, right: 20, bottom: 26, left: 34 }
      : { top: 20, right: 30, bottom: 30, left: 42 };

    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const xDomain = [0, 7];
    const yDomain = [0, 100];

    const xs = d3.scaleLinear().domain(xDomain).range([0, iW]);
    const ys = d3.scaleLinear().domain(yDomain).range([iH, 0]);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // 1. Background Grid Lines
    const gridX = g.append('g')
      .call(d3.axisBottom(xs).ticks(7).tickSize(-iH).tickFormat(() => ''))
      .attr('transform', `translate(0,${iH})`);
    gridX.selectAll('line').attr('stroke', '#f1f5f9');
    gridX.select('.domain').remove();

    const gridY = g.append('g')
      .call(d3.axisLeft(ys).ticks(10).tickSize(-iW).tickFormat(() => ''));
    gridY.selectAll('line').attr('stroke', '#f1f5f9');
    gridY.select('.domain').remove();

    // 2. Axes
    const xAxis = d3.axisBottom(xs).ticks(isMobile ? 5 : 7).tickSize(4);
    const yAxis = d3.axisLeft(ys).ticks(isMobile ? 5 : 10).tickSize(4);

    g.append('g')
      .attr('transform', `translate(0,${iH})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .attr('font-size', isMobile ? 9 : 10);

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .attr('font-size', isMobile ? 9 : 10);

    // Axis Labels
    g.append('text')
      .attr('x', iW).attr('y', iH - 6)
      .attr('fill', '#64748b').attr('font-size', 10).attr('font-weight', 600)
      .attr('text-anchor', 'end')
      .text('Hours (X)');

    g.append('text')
      .attr('x', 6).attr('y', 12)
      .attr('fill', '#64748b').attr('font-size', 10).attr('font-weight', 600)
      .text('Score (Y)');

    // 3. Residual Error Lines (Dashed red lines from points to line: e_i = y_i - ŷ_i)
    if (showResiduals) {
      points.forEach((p) => {
        const yPred = beta0 + beta1 * p.x;
        g.append('line')
          .attr('x1', xs(p.x)).attr('y1', ys(p.y))
          .attr('x2', xs(p.x)).attr('y2', ys(yPred))
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3 2')
          .attr('opacity', 0.85);

        // Small indicator dot on the prediction line
        g.append('circle')
          .attr('cx', xs(p.x)).attr('cy', ys(yPred))
          .attr('r', 2.5)
          .attr('fill', '#ef4444');
      });
    }

    // 4. Regression Line (ŷ = beta_0 + beta_1 * x)
    const lineX0 = 0;
    const lineY0 = beta0 + beta1 * lineX0;
    const lineX1 = 7;
    const lineY1 = beta0 + beta1 * lineX1;

    g.append('line')
      .attr('x1', xs(lineX0)).attr('y1', ys(lineY0))
      .attr('x2', xs(lineX1)).attr('y2', ys(lineY1))
      .attr('stroke', '#2563eb')
      .attr('stroke-width', 2.5);

    // 5. Data Points (Draggable circles)
    const dragPoint = d3.drag<SVGGElement, Point>()
      .on('drag', (event, d) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const clampedX = Math.max(0.5, Math.min(6.5, Math.round(rawX * 2) / 2));
        const clampedY = Math.max(5, Math.min(95, Math.round(rawY)));

        setPoints((prev) =>
          prev.map((item) => (item.id === d.id ? { ...item, x: clampedX, y: clampedY } : item))
        );
      });

    const pointGroups = g.selectAll('.data-point')
      .data(points, (d) => (d as Point).id)
      .enter()
      .append('g')
      .attr('class', 'data-point')
      .attr('transform', (d) => `translate(${xs(d.x)},${ys(d.y)})`)
      .style('cursor', 'grab')
      .call(dragPoint);

    // Large invisible touch target
    pointGroups.append('circle')
      .attr('r', 20)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    // Outer circle
    pointGroups.append('circle')
      .attr('r', isMobile ? 6 : 5.5)
      .attr('fill', '#1e293b')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))');

  }, [points, beta0, beta1, showResiduals, dimensions]);

  return (
    <FigureBox
      title="Interactive Linear Regression: Line of Best Fit & Residuals"
      caption="Drag data points or adjust the slope (β₁) and intercept (β₀) sliders to minimize the red vertical residuals (eᵢ = yᵢ - ŷᵢ). Watch MSE and R² update in real time."
      controls={
        <div className="flex flex-col gap-3 w-full">
          {/* Sliders for Slope and Intercept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
            <Slider
              label="Slope β₁ (Weight / Hours Rate)"
              value={beta1}
              min={-5.0}
              max={25.0}
              step={0.5}
              onChange={(val) => setBeta1(Math.round(val * 10) / 10)}
            />
            <Slider
              label="Intercept β₀ (Base Score at x=0)"
              value={beta0}
              min={-10.0}
              max={40.0}
              step={1.0}
              onChange={(val) => setBeta0(Math.round(val))}
            />
          </div>

          {/* Toggle and Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-200/80">
            {/* Mobile Top Header */}
            <div className="flex items-center justify-between sm:hidden w-full">
              <Toggle
                label={showResiduals ? 'Showing Residuals' : 'Residuals hidden'}
                value={showResiduals}
                onChange={setShowResiduals}
              />
              <button
                onClick={() => {
                  setBeta1(olsParams.beta1);
                  setBeta0(olsParams.beta0);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors active:scale-95 shadow-2xs"
              >
                🎯 Auto-Fit OLS
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:flex-wrap gap-1.5 w-full sm:w-auto">
              <span className="hidden sm:inline text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">
                Presets:
              </span>
              {[
                { label: 'Optimal Fit', onApply: () => { setBeta1(olsParams.beta1); setBeta0(olsParams.beta0); } },
                { label: 'Imperfect (10+10x)', onApply: () => { setBeta0(10); setBeta1(10); } },
                { label: 'Flat (β₁ = 0)', onApply: () => { setBeta1(0); setBeta0(53); } },
                { label: 'Negative Slope', onApply: () => { setBeta1(-5); setBeta0(80); } },
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

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2">
              <Toggle
                label={showResiduals ? 'Residuals' : 'Residuals'}
                value={showResiduals}
                onChange={setShowResiduals}
              />
              <button
                onClick={() => {
                  setBeta1(olsParams.beta1);
                  setBeta0(olsParams.beta0);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors active:scale-95 shadow-2xs"
              >
                🎯 Auto-Fit OLS
              </button>
              <button
                onClick={() => {
                  setPoints(INITIAL_POINTS);
                  setBeta1(13.1);
                  setBeta0(7.6);
                }}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors active:scale-95"
              >
                ↺ Reset
              </button>
            </div>
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Fitted Model Equation */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
              <span className="text-slate-400 text-xs">Model:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs">
                ŷ={beta0} + {beta1}x
              </span>
            </div>

            {/* Mean Squared Error */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">MSE:</span>
              <span className={`font-bold tabular-nums text-xs ${stats.mse < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {stats.mse.toFixed(1)}
              </span>
            </div>

            {/* Residual Sum of Squares (RSS) */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">RSS:</span>
              <span className="text-slate-300 font-bold tabular-nums text-xs">
                {stats.rss.toFixed(1)}
              </span>
            </div>

            {/* R-squared Score */}
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">R² Score:</span>
              <span className={`font-bold tabular-nums text-xs ${stats.r2 > 0.9 ? 'text-emerald-400' : stats.r2 > 0.6 ? 'text-blue-400' : 'text-red-400'}`}>
                {(stats.r2 * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag points or adjust sliders
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
