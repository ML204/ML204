'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';

interface Point {
  id: number;
  x: number;
  y: number;
}

const DEFAULT_POINTS: Point[] = [
  { id: 1, x: 1, y: 2 },
  { id: 2, x: 2, y: 3.5 },
  { id: 3, x: 3, y: 3 },
  { id: 4, x: 4, y: 5 },
  { id: 5, x: 5, y: 6.5 },
];

export function OLSFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 320 });
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const [activeTab, setActiveTab] = useState<'plot' | 'matrices'>('plot');

  // Responsive container observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 620;
      const height = width < 480 ? 280 : Math.round(Math.min(360, Math.max(260, width * 0.52)));
      setDimensions({ width, height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute exact Matrix Form terms
  const matrixData = useMemo(() => {
    const n = points.length;
    if (n < 2) return null;

    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumXY = 0;

    for (const p of points) {
      sumX += p.x;
      sumY += p.y;
      sumX2 += p.x * p.x;
      sumXY += p.x * p.y;
    }

    // X^T X = [[n, sumX], [sumX, sumX2]]
    const det = n * sumX2 - sumX * sumX;
    const invertible = Math.abs(det) > 1e-9;

    let beta0 = 0;
    let beta1 = 0;
    let invXX = [[0, 0], [0, 0]];

    if (invertible) {
      invXX = [
        [sumX2 / det, -sumX / det],
        [-sumX / det, n / det],
      ];
      beta0 = invXX[0][0] * sumY + invXX[0][1] * sumXY;
      beta1 = invXX[1][0] * sumY + invXX[1][1] * sumXY;
    }

    // Residuals and Orthogonality Check
    let sumE = 0;
    let sumXE = 0;
    let rss = 0;
    const residuals = points.map((p) => {
      const yHat = beta0 + beta1 * p.x;
      const e = p.y - yHat;
      sumE += e;
      sumXE += p.x * e;
      rss += e * e;
      return { id: p.id, x: p.x, y: p.y, yHat, e };
    });

    return {
      n,
      sumX,
      sumY,
      sumX2,
      sumXY,
      det,
      invertible,
      invXX,
      beta0,
      beta1,
      sumE,
      sumXE,
      rss,
      residuals,
    };
  }, [points]);

  // Render D3 Interactive Coordinate Plot
  useEffect(() => {
    if (!svgRef.current || !matrixData || activeTab !== 'plot') return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 20, right: 25, bottom: 40, left: 45 };
    const innerW = Math.max(10, width - margin.left - margin.right);
    const innerH = Math.max(10, height - margin.top - margin.bottom);

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 6]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([0, 8]).range([innerH, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisBottom(xScale).ticks(6).tickSize(innerH).tickFormat(() => ''))
      .attr('transform', `translate(0,0)`);

    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => ''));

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(6);
    const yAxis = d3.axisLeft(yScale).ticks(5);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('fill', '#64748b')
      .attr('font-size', '11px');

    // Axis Labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 34)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('Feature x');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .text('Target y');

    // Closed-Form OLS Fitted Line
    if (matrixData.invertible) {
      const lineData: [number, number][] = [
        [0, matrixData.beta0],
        [6, matrixData.beta0 + matrixData.beta1 * 6],
      ];

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]));

      g.append('path')
        .datum(lineData)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2.5);

      // Residual dashed vertical projections
      g.selectAll('.res-line')
        .data(matrixData.residuals)
        .enter()
        .append('line')
        .attr('x1', (d) => xScale(d.x))
        .attr('y1', (d) => yScale(d.y))
        .attr('x2', (d) => xScale(d.x))
        .attr('y2', (d) => yScale(d.yHat))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 3')
        .attr('opacity', 0.85);
    }

    // Data points with drag behavior
    const drag = d3
      .drag<SVGCircleElement, Point>()
      .on('drag', function (event, d) {
        const newY = Math.max(0.2, Math.min(7.8, yScale.invert(event.y)));
        setPoints((prev) =>
          prev.map((pt) => (pt.id === d.id ? { ...pt, y: Math.round(newY * 10) / 10 } : pt))
        );
      });

    const circles = g
      .selectAll('.point')
      .data(points)
      .enter()
      .append('circle')
      .attr('class', 'point')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 7)
      .attr('fill', '#1d4ed8')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .attr('cursor', 'ns-resize')
      .call(drag as any);

    circles.append('title').text((d) => `Point ${d.id}: (${d.x}, ${d.y}) - Drag vertically`);
  }, [dimensions, points, matrixData, activeTab]);

  return (
    <FigureBox
      title="Figure 3.2: OLS Closed-Form Estimator & Orthogonality"
      caption="Interactive matrix solution β̂ = (XᵀX)⁻¹Xᵀy. Drag any observation point vertically to inspect how the normal equations and residual orthogonality Xᵀe = 0 update in real time."
      controls={
        <div className="flex flex-col gap-2.5 w-full">
          {/* View Mode Tabs & Reset */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setActiveTab('plot')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'plot'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 Coordinate Projection
              </button>
              <button
                onClick={() => setActiveTab('matrices')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'matrices'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🧮 Matrix Inspector
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPoints(DEFAULT_POINTS)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors active:scale-95 shadow-2xs"
              >
                ↺ Reset Points
              </button>
              <button
                onClick={() =>
                  setPoints([
                    { id: 1, x: 1, y: 1.5 },
                    { id: 2, x: 2, y: 2.8 },
                    { id: 3, x: 3, y: 4.2 },
                    { id: 4, x: 4, y: 5.6 },
                    { id: 5, x: 5, y: 7.0 },
                  ])
                }
                className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors active:scale-95 shadow-2xs"
              >
                Collinear Preset
              </button>
            </div>
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
              <span className="text-slate-400 text-xs">OLS β̂:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs">
                [{matrixData?.beta0.toFixed(2)}, {matrixData?.beta1.toFixed(2)}]ᵀ
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">RSS:</span>
              <span className="text-emerald-400 font-bold tabular-nums text-xs">
                {matrixData?.rss.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Xᵀe (1ᵀe):</span>
              <span className="text-slate-200 font-bold tabular-nums text-xs">
                {Math.abs(matrixData?.sumE ?? 0) < 1e-4 ? '0.00' : matrixData?.sumE.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Xᵀe (xᵀe):</span>
              <span className="text-slate-200 font-bold tabular-nums text-xs">
                {Math.abs(matrixData?.sumXE ?? 0) < 1e-4 ? '0.00' : matrixData?.sumXE.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      }
    >
      {activeTab === 'plot' ? (
        <div ref={containerRef} className="relative w-full select-none touch-none bg-slate-900/5">
          <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium z-10">
            👆 Drag points vertically to update OLS
          </div>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full block touch-none"
          />
        </div>
      ) : (
        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto min-h-[280px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Design Matrix and Target Vector */}
            <div className="space-y-3">
              <div>
                <p className="text-blue-400 font-semibold mb-1">1. Design Matrix X (n×2) & y (n×1):</p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
                  {points.map((p) => (
                    <div key={p.id} className="flex justify-between border-b border-slate-800/50 py-0.5">
                      <span className="text-slate-400">[ 1.0, {p.x.toFixed(1)} ]</span>
                      <span className="text-slate-300">y = {p.y.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-blue-400 font-semibold mb-1">2. Normal System: XᵀX and Xᵀy</p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <p className="text-slate-400">
                    XᵀX = [[ {matrixData?.n}, {matrixData?.sumX} ], [ {matrixData?.sumX}, {matrixData?.sumX2} ]]
                  </p>
                  <p className="text-slate-400">
                    Xᵀy = [ {matrixData?.sumY.toFixed(1)}, {matrixData?.sumXY.toFixed(1)} ]ᵀ
                  </p>
                  <p className="text-amber-400">
                    det(XᵀX) = {matrixData?.det.toFixed(1)} {matrixData?.invertible ? '(Full Rank ✓)' : '(Singular ✗)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Inversion and Orthogonality Proof */}
            <div className="space-y-3">
              <div>
                <p className="text-blue-400 font-semibold mb-1">3. Inverse Matrix (XᵀX)⁻¹:</p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <p className="text-slate-300">
                    [[ {matrixData?.invXX[0][0].toFixed(3)}, {matrixData?.invXX[0][1].toFixed(3)} ],
                  </p>
                  <p className="text-slate-300">
                    &nbsp;[ {matrixData?.invXX[1][0].toFixed(3)}, {matrixData?.invXX[1][1].toFixed(3)} ]]
                  </p>
                </div>
              </div>

              <div>
                <p className="text-emerald-400 font-semibold mb-1">4. Orthogonality Verification (Xᵀe = 0):</p>
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                  <p className="text-slate-300">
                    Column 1 (1ᵀe = Σ eᵢ) = <span className="text-emerald-400 font-bold">{Math.abs(matrixData?.sumE ?? 0) < 1e-4 ? '0.00' : matrixData?.sumE.toFixed(4)}</span>
                  </p>
                  <p className="text-slate-300">
                    Column 2 (xᵀe = Σ xᵢeᵢ) = <span className="text-emerald-400 font-bold">{Math.abs(matrixData?.sumXE ?? 0) < 1e-4 ? '0.00' : matrixData?.sumXE.toFixed(4)}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 italic">
                    ✓ The residual vector e is strictly orthogonal to every column of X!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </FigureBox>
  );
}
