'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider } from '@/components/figures/FigureControls';

export function LassoFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 350 });

  const [lambda, setLambda] = useState<number>(3.5);
  const [activeTab, setActiveTab] = useState<'geometry' | 'threshold' | 'paths'>('geometry');
  const [compareRidge, setCompareRidge] = useState<boolean>(false);

  // Unregularized OLS optimal parameters
  const olsBeta = useMemo(() => ({ b1: 3.2, b2: 2.4 }), []);

  // Compute exact Lasso and Ridge coefficients under soft thresholding
  const solution = useMemo(() => {
    // Soft thresholding calculation for Lasso
    // When lambda increases, beta2 hits zero first (sparsity)
    const threshold = lambda * 0.45;
    const b2Raw = olsBeta.b2 - threshold * 1.5;
    const b2 = Math.max(0, b2Raw);

    // After beta2 hits zero, beta1 adjusts
    const b1Raw = olsBeta.b1 - threshold * (b2 === 0 ? 0.6 : 0.4);
    const b1 = Math.max(0, b1Raw);

    const l1Norm = Math.abs(b1) + Math.abs(b2);
    const activeFeatures = (b1 > 0 ? 1 : 0) + (b2 > 0 ? 1 : 0);

    // Comparative Ridge coefficients (smooth shrink, never exact zero)
    const ridgeB1 = olsBeta.b1 / (1 + 0.3 * lambda);
    const ridgeB2 = olsBeta.b2 / (1 + 0.7 * lambda);
    const ridgeL2Radius = Math.sqrt(ridgeB1 * ridgeB1 + ridgeB2 * ridgeB2);

    return {
      b1,
      b2,
      l1Norm,
      activeFeatures,
      ridgeB1,
      ridgeB2,
      ridgeL2Radius,
      isSparse: b2 === 0,
    };
  }, [lambda, olsBeta]);

  // Responsive observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 620;
      const height = width < 480 ? 290 : Math.round(Math.min(370, Math.max(270, width * 0.54)));
      setDimensions({ width, height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Render D3 Graphic
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    const margin = { top: 25, right: 30, bottom: 45, left: 50 };
    const innerW = Math.max(10, width - margin.left - margin.right);
    const innerH = Math.max(10, height - margin.top - margin.bottom);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    if (activeTab === 'geometry') {
      // ---------------- GEOMETRIC DIAMOND VS ELLIPSE VIEW ----------------
      const maxVal = 4.8;
      const xScale = d3.scaleLinear().domain([-1.0, maxVal]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([-1.0, maxVal]).range([innerH, 0]);

      // Axes & grid
      g.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(6))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b')
        .attr('font-size', '11px');

      g.append('g')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale).ticks(6))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b')
        .attr('font-size', '11px');

      // Labels
      g.append('text')
        .attr('x', innerW)
        .attr('y', yScale(0) - 10)
        .attr('text-anchor', 'end')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Parameter β₁');

      g.append('text')
        .attr('x', xScale(0) + 12)
        .attr('y', 15)
        .attr('text-anchor', 'start')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Parameter β₂');

      // OLS RSS Elliptical Contours
      const contourLevels = [0.4, 0.9, 1.5, 2.2, 3.0];
      const ellipseGroup = g.append('g').attr('class', 'contours');
      contourLevels.forEach((level) => {
        const rx = level * (xScale(1) - xScale(0)) * 1.3;
        const ry = level * (yScale(0) - yScale(1)) * 0.75;
        ellipseGroup
          .append('ellipse')
          .attr('cx', xScale(olsBeta.b1))
          .attr('cy', yScale(olsBeta.b2))
          .attr('rx', rx)
          .attr('ry', ry)
          .attr('transform', `rotate(-35, ${xScale(olsBeta.b1)}, ${yScale(olsBeta.b2)})`)
          .attr('fill', 'none')
          .attr('stroke', '#93c5fd')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4 3')
          .attr('opacity', 0.85);
      });

      // Optional Ridge circular comparison boundary
      if (compareRidge) {
        const rPx = solution.ridgeL2Radius * (xScale(1) - xScale(0));
        g.append('circle')
          .attr('cx', xScale(0))
          .attr('cy', yScale(0))
          .attr('r', Math.max(0, rPx))
          .attr('fill', 'none')
          .attr('stroke', '#16a34a')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '3 3')
          .attr('opacity', 0.8);

        // Ridge point
        g.append('circle')
          .attr('cx', xScale(solution.ridgeB1))
          .attr('cy', yScale(solution.ridgeB2))
          .attr('r', 5)
          .attr('fill', '#16a34a');

        g.append('text')
          .attr('x', xScale(solution.ridgeB1) + 8)
          .attr('y', yScale(solution.ridgeB2) - 6)
          .attr('fill', '#15803d')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .text('Ridge (Non-zero)');
      }

      // Draw L1 Diamond Constraint: |beta1| + |beta2| <= s
      const s = solution.l1Norm;
      const diamondPoints = [
        [xScale(s), yScale(0)],
        [xScale(0), yScale(s)],
        [xScale(-s), yScale(0)],
        [xScale(0), yScale(-s)],
      ];

      g.append('polygon')
        .attr('points', diamondPoints.map((d) => d.join(',')).join(' '))
        .attr('fill', '#f59e0b')
        .attr('fill-opacity', 0.16)
        .attr('stroke', '#d97706')
        .attr('stroke-width', 2.5);

      // Mark OLS Unconstrained Optimum
      g.append('circle')
        .attr('cx', xScale(olsBeta.b1))
        .attr('cy', yScale(olsBeta.b2))
        .attr('r', 6)
        .attr('fill', '#2563eb')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', xScale(olsBeta.b1) + 8)
        .attr('y', yScale(olsBeta.b2) - 8)
        .attr('fill', '#1d4ed8')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text('β̂_OLS');

      // Mark Lasso Optimum (Hits Corner Vertex on Axis!)
      g.append('circle')
        .attr('cx', xScale(solution.b1))
        .attr('cy', yScale(solution.b2))
        .attr('r', 7.5)
        .attr('fill', '#dc2626')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5);

      g.append('text')
        .attr('x', xScale(solution.b1) + (solution.b2 === 0 ? 10 : 8))
        .attr('y', yScale(solution.b2) + (solution.b2 === 0 ? -10 : 16))
        .attr('fill', '#b91c1c')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text(
          solution.b2 === 0
            ? `β̂_Lasso (${solution.b1.toFixed(2)}, 0) [SPARSE CORNER!]`
            : `β̂_Lasso (${solution.b1.toFixed(2)}, ${solution.b2.toFixed(2)})`
        );
    } else if (activeTab === 'threshold') {
      // ---------------- SOFT THRESHOLDING OPERATOR VIEW ----------------
      const t = lambda * 0.35;
      const xScale = d3.scaleLinear().domain([-5, 5]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([-4, 4]).range([innerH, 0]);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b');

      g.append('g')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(d3.axisLeft(yScale).ticks(8))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b');

      // Labels
      g.append('text')
        .attr('x', innerW)
        .attr('y', yScale(0) - 10)
        .attr('text-anchor', 'end')
        .attr('fill', '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text('Input z = xⱼᵀrⱼ');

      g.append('text')
        .attr('x', xScale(0) + 12)
        .attr('y', 15)
        .attr('text-anchor', 'start')
        .attr('fill', '#475569')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text('Updated βⱼ = soft(z, t)');

      // Deadband Shading [-t, t]
      g.append('rect')
        .attr('x', xScale(-t))
        .attr('y', 0)
        .attr('width', Math.max(0, xScale(t) - xScale(-t)))
        .attr('height', innerH)
        .attr('fill', '#ef4444')
        .attr('fill-opacity', 0.1);

      g.append('text')
        .attr('x', xScale(0))
        .attr('y', innerH - 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#dc2626')
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`Deadband [-${t.toFixed(2)}, +${t.toFixed(2)}]: Values shrunk to ZERO`);

      // 45 degree OLS identity line
      g.append('line')
        .attr('x1', xScale(-4))
        .attr('y1', yScale(-4))
        .attr('x2', xScale(4))
        .attr('y2', yScale(4))
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '3 3');

      // Soft thresholding piecewise function curve
      const pts: [number, number][] = [
        [-5, -5 + t],
        [-t, 0],
        [t, 0],
        [5, 5 - t],
      ];

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]));

      g.append('path').datum(pts).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 3);
    } else {
      // ---------------- REGULARIZATION PATHS VIEW ----------------
      const lambdas = d3.range(0, 10.5, 0.2);
      const xScale = d3.scaleLinear().domain([0, 10]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([0, 3.5]).range([innerH, 0]);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b');

      g.append('g')
        .call(d3.axisLeft(yScale).ticks(6))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b');

      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 36)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .text('Lasso Penalty λ');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -34)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .text('Estimated Coefficient');

      // Curves
      const curve1 = lambdas.map((l) => [l, Math.max(0, olsBeta.b1 - l * 0.3)] as [number, number]);
      const curve2 = lambdas.map((l) => [l, Math.max(0, olsBeta.b2 - l * 0.7)] as [number, number]);

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]));

      g.append('path').datum(curve1).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2.5);
      g.append('path').datum(curve2).attr('d', lineGen).attr('fill', 'none').attr('stroke', '#ec4899').attr('stroke-width', 2.5);

      // Vertical line for current lambda
      g.append('line')
        .attr('x1', xScale(lambda))
        .attr('y1', 0)
        .attr('x2', xScale(lambda))
        .attr('y2', innerH)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 4');

      // Sparsity marker
      const lambdaZero = olsBeta.b2 / 0.7;
      g.append('circle').attr('cx', xScale(lambdaZero)).attr('cy', yScale(0)).attr('r', 5).attr('fill', '#dc2626');

      g.append('text')
        .attr('x', xScale(lambdaZero) + 8)
        .attr('y', yScale(0) - 10)
        .attr('fill', '#dc2626')
        .attr('font-size', '10px')
        .attr('font-weight', '700')
        .text('β₂ drops to exact 0.00');
    }
  }, [dimensions, lambda, olsBeta, solution, activeTab, compareRidge]);

  return (
    <FigureBox
      title="Figure 3.5: Lasso Diamond Geometry & Exact Sparsity"
      caption="Interactive Lasso Regularization. The sharp corners of the L₁ diamond constraint ||β||₁ ≤ s lie directly on coordinate axes. When the expanding RSS contour touches a corner, the corresponding parameter drops exactly to zero (automatic feature selection)."
      controls={
        <div className="flex flex-col gap-3 w-full">
          {/* Tab Selection */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setActiveTab('geometry')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'geometry'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                💎 Diamond L₁ Geometry
              </button>
              <button
                onClick={() => setActiveTab('threshold')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'threshold'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✂️ Soft Thresholding
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'paths'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📉 Regularization Paths
              </button>
            </div>

            {/* Presets & Ridge Overlay Toggle */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setCompareRidge((prev) => !prev)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  compareRidge
                    ? 'bg-green-50 border-green-400 text-green-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {compareRidge ? '✓ Ridge Circle ON' : '+ Compare Ridge Circle'}
              </button>
              {[
                { label: 'OLS (λ = 0)', val: 0 },
                { label: 'Sparse (λ = 3.5)', val: 3.5 },
                { label: 'All Zero (λ = 8.0)', val: 8.0 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setLambda(p.val)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors active:scale-95 shadow-2xs ${
                    lambda === p.val
                      ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Slider
              label={`Lasso Regularization Penalty (λ = ${lambda.toFixed(1)})`}
              min={0}
              max={10}
              step={0.2}
              value={lambda}
              onChange={setLambda}
            />
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
              <span className="text-slate-400 text-xs">β̂_Lasso:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs">
                [{solution.b1.toFixed(2)}, {solution.b2.toFixed(2)}]ᵀ
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Active Features:</span>
              <span
                className={`font-bold tabular-nums text-xs ${
                  solution.activeFeatures === 2
                    ? 'text-blue-400'
                    : solution.activeFeatures === 1
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {solution.activeFeatures} of 2 {solution.b2 === 0 ? '(β₂ pruned ✓)' : ''}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">||β̂||₁ (L1):</span>
              <span className="text-purple-400 font-bold tabular-nums text-xs">
                {solution.l1Norm.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Model State:</span>
              <span
                className={`font-bold text-xs ${
                  solution.b2 === 0 ? 'text-emerald-400' : 'text-slate-300'
                }`}
              >
                {solution.b2 === 0 ? 'SPARSE (Selection)' : 'Dense Model'}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none bg-slate-900/5">
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
