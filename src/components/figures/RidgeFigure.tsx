'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider } from '@/components/figures/FigureControls';

export function RidgeFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 350 });

  // Regularization parameter lambda
  const [lambda, setLambda] = useState<number>(3.0);
  const [activeTab, setActiveTab] = useState<'geometry' | 'paths'>('geometry');

  // Ground truth / OLS unregularized optimum in (beta1, beta2) space
  // Simulated multicollinear regression: beta1_ols = 3.5, beta2_ols = 2.8
  const olsBeta = useMemo(() => ({ b1: 3.5, b2: 2.8 }), []);

  // Compute Ridge coefficients as a function of lambda
  // Closed-form shrinkage for correlated system: beta_ridge(lambda) = beta_ols / (1 + lambda * factor)
  const ridgeBeta = useMemo(() => {
    // Principal axes eigenvalues: major axis stretches due to collinearity
    const s1 = 1 / (1 + 0.28 * lambda);
    const s2 = 1 / (1 + 0.75 * lambda);
    const b1 = olsBeta.b1 * s1;
    const b2 = olsBeta.b2 * s2;
    const l2NormSq = b1 * b1 + b2 * b2;
    const radius = Math.sqrt(l2NormSq);

    // Approximate theoretical Bias, Variance, and Total MSE
    const biasSq = 0.05 * Math.pow(lambda, 1.4);
    const variance = 4.2 / (1 + 0.65 * lambda);
    const totalMse = biasSq + variance + 0.5; // irreducible noise = 0.5

    return {
      b1,
      b2,
      l2NormSq,
      radius,
      biasSq,
      variance,
      totalMse,
    };
  }, [lambda, olsBeta]);

  // Responsive container observer
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
      // ---------------- GEOMETRIC CONTOUR & CONSTRAINT VIEW ----------------
      const maxRange = 5.0;
      const xScale = d3.scaleLinear().domain([-0.5, maxRange]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([-0.5, maxRange]).range([innerH, 0]);

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

      // Draw OLS RSS Elliptical Contours centered at (olsBeta.b1, olsBeta.b2)
      const contourLevels = [0.3, 0.7, 1.2, 1.8, 2.5, 3.3];
      const ellipseGroup = g.append('g').attr('class', 'contours');

      contourLevels.forEach((level) => {
        const rx = level * (xScale(1) - xScale(0)) * 1.35;
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

      // Draw L2 Circular Constraint Disk: ||beta||_2 <= radius centered at (0, 0)
      const radiusPx = ridgeBeta.radius * (xScale(1) - xScale(0));
      g.append('circle')
        .attr('cx', xScale(0))
        .attr('cy', yScale(0))
        .attr('r', Math.max(0, radiusPx))
        .attr('fill', '#22c55e')
        .attr('fill-opacity', 0.12)
        .attr('stroke', '#16a34a')
        .attr('stroke-width', 2.5);

      // Trajectory path from OLS to Origin
      const pathPoints: [number, number][] = [];
      for (let l = 0; l <= 50; l += 1) {
        const s1 = 1 / (1 + 0.28 * l);
        const s2 = 1 / (1 + 0.75 * l);
        pathPoints.push([olsBeta.b1 * s1, olsBeta.b2 * s2]);
      }
      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xScale(d[0]))
        .y((d) => yScale(d[1]));

      g.append('path')
        .datum(pathPoints)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', '#a855f7')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3 3')
        .attr('opacity', 0.6);

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
        .text('β̂_OLS (λ = 0)');

      // Mark Ridge Constrained Solution (Point of Tangency)
      g.append('circle')
        .attr('cx', xScale(ridgeBeta.b1))
        .attr('cy', yScale(ridgeBeta.b2))
        .attr('r', 7)
        .attr('fill', '#dc2626')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2.5);

      g.append('text')
        .attr('x', xScale(ridgeBeta.b1) + 10)
        .attr('y', yScale(ridgeBeta.b2) + 4)
        .attr('fill', '#b91c1c')
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .text(`β̂_Ridge (${ridgeBeta.b1.toFixed(2)}, ${ridgeBeta.b2.toFixed(2)})`);

      // Tangent indication label
      g.append('text')
        .attr('x', innerW - 10)
        .attr('y', 20)
        .attr('text-anchor', 'end')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .text('Tangent Point: Smallest Ellipse ∩ Circular L₂ Disk');
    } else {
      // ---------------- COEFFICIENT SHRINKAGE PATHS VIEW ----------------
      const xLambdas = d3.range(0, 30.5, 0.5);
      const xScale = d3.scaleLinear().domain([0, 30]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([0, 4.0]).range([innerH, 0]);

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).ticks(8))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b')
        .attr('font-size', '11px');

      g.append('g')
        .call(d3.axisLeft(yScale).ticks(6))
        .attr('color', '#cbd5e1')
        .selectAll('text')
        .attr('fill', '#64748b')
        .attr('font-size', '11px');

      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 36)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text('Regularization Penalty λ');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -34)
        .attr('text-anchor', 'middle')
        .attr('fill', '#64748b')
        .attr('font-size', '11px')
        .attr('font-weight', '500')
        .text('Coefficient Value');

      // Paths for beta 1 and beta 2
      const lineGen1 = d3
        .line<number>()
        .x((l) => xScale(l))
        .y((l) => yScale(olsBeta.b1 / (1 + 0.28 * l)));

      const lineGen2 = d3
        .line<number>()
        .x((l) => xScale(l))
        .y((l) => yScale(olsBeta.b2 / (1 + 0.75 * l)));

      g.append('path')
        .datum(xLambdas)
        .attr('d', lineGen1)
        .attr('fill', 'none')
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2.5);

      g.append('path')
        .datum(xLambdas)
        .attr('d', lineGen2)
        .attr('fill', 'none')
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 2.5);

      // Current lambda indicator vertical line
      g.append('line')
        .attr('x1', xScale(lambda))
        .attr('y1', 0)
        .attr('x2', xScale(lambda))
        .attr('y2', innerH)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 4');

      // Current position dots
      g.append('circle')
        .attr('cx', xScale(lambda))
        .attr('cy', yScale(ridgeBeta.b1))
        .attr('r', 5)
        .attr('fill', '#3b82f6')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      g.append('circle')
        .attr('cx', xScale(lambda))
        .attr('cy', yScale(ridgeBeta.b2))
        .attr('r', 5)
        .attr('fill', '#ec4899')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Legend
      const legend = g.append('g').attr('transform', `translate(${innerW - 130}, 15)`);
      legend
        .append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 20)
        .attr('y2', 0)
        .attr('stroke', '#3b82f6')
        .attr('stroke-width', 2.5);
      legend.append('text').attr('x', 26).attr('y', 4).attr('font-size', '11px').attr('fill', '#1e293b').text('β₁ path');

      legend
        .append('line')
        .attr('x1', 0)
        .attr('y1', 18)
        .attr('x2', 20)
        .attr('y2', 18)
        .attr('stroke', '#ec4899')
        .attr('stroke-width', 2.5);
      legend.append('text').attr('x', 26).attr('y', 22).attr('font-size', '11px').attr('fill', '#1e293b').text('β₂ path');
    }
  }, [dimensions, lambda, olsBeta, ridgeBeta, activeTab]);

  return (
    <FigureBox
      title="Figure 3.4: Ridge Geometry & Smooth Shrinkage"
      caption="Interactive Ridge Regularization. The Ridge solution is the tangency point where the elliptical OLS contours meet the smooth circular L₂ penalty boundary ||β||₂² ≤ s. As λ increases, the circle shrinks toward zero."
      controls={
        <div className="flex flex-col gap-3 w-full">
          {/* View Tab Selector & Presets */}
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
                ⭕ Geometric Contours & L₂ Disk
              </button>
              <button
                onClick={() => setActiveTab('paths')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'paths'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📉 Coefficient Shrinkage Paths
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'OLS (λ = 0)', val: 0 },
                { label: 'Mild (λ = 1.5)', val: 1.5 },
                { label: 'Balanced (λ = 4.0)', val: 4.0 },
                { label: 'Heavy (λ = 18.0)', val: 18.0 },
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

          {/* Slider for Lambda */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Slider
              label={`Regularization Penalty (λ = ${lambda.toFixed(1)})`}
              min={0}
              max={25}
              step={0.5}
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
              <span className="text-slate-400 text-xs">β̂_Ridge:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs">
                [{ridgeBeta.b1.toFixed(2)}, {ridgeBeta.b2.toFixed(2)}]ᵀ
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">||β̂||₂² (Norm):</span>
              <span className="text-purple-400 font-bold tabular-nums text-xs">
                {ridgeBeta.l2NormSq.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Est. Variance:</span>
              <span className={`font-bold tabular-nums text-xs ${ridgeBeta.variance < 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ridgeBeta.variance.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Est. Bias²:</span>
              <span className={`font-bold tabular-nums text-xs ${ridgeBeta.biasSq < 0.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {ridgeBeta.biasSq.toFixed(2)}
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
