'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider } from '@/components/figures/FigureControls';

interface Point {
  x: number;
  y: number;
}

// Fixed representative dataset with true sinusoidal underlying signal + gaussian noise
const TRAINING_POINTS: Point[] = [
  { x: 0.8, y: 1.4 },
  { x: 1.6, y: 2.8 },
  { x: 2.4, y: 3.6 },
  { x: 3.3, y: 3.3 },
  { x: 4.2, y: 2.0 },
  { x: 5.1, y: 1.1 },
  { x: 6.0, y: 1.3 },
  { x: 7.0, y: 2.5 },
  { x: 8.0, y: 4.2 },
  { x: 8.9, y: 5.3 },
  { x: 9.6, y: 5.9 },
];

/**
 * Solve (X^T X + lambda * I) beta = X^T y via Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / pivot;
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let sum = M[i][n];
    for (let j = i + 1; j < n; j++) {
      sum -= M[i][j] * x[j];
    }
    const diag = M[i][i];
    x[i] = Math.abs(diag) > 1e-12 ? sum / diag : 0;
  }

  return x;
}

export function PolynomialFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 620, height: 350 });

  const [degree, setDegree] = useState<number>(3);
  const [ridgeActive, setRidgeActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'fit' | 'biasVariance'>('fit');

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

  // Compute polynomial fit via normal equations
  const { coefficients, rss, evaluatePoly, testMse, estBiasSq, estVariance } = useMemo(() => {
    const d = degree;
    const numParams = d + 1;
    const n = TRAINING_POINTS.length;

    // Rescale x to [-1, 1] for Vandermonde conditioning
    const normalize = (val: number) => (val - 5.0) / 5.0;

    const X: number[][] = [];
    const y: number[] = [];

    for (let i = 0; i < n; i++) {
      const nx = normalize(TRAINING_POINTS[i].x);
      const row: number[] = [];
      let p = 1;
      for (let j = 0; j <= d; j++) {
        row.push(p);
        p *= nx;
      }
      X.push(row);
      y.push(TRAINING_POINTS[i].y);
    }

    const XtX: number[][] = Array.from({ length: numParams }, () => new Array(numParams).fill(0));
    const Xty: number[] = new Array(numParams).fill(0);

    for (let r = 0; r < numParams; r++) {
      for (let c = 0; c < numParams; c++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
          sum += X[i][r] * X[i][c];
        }
        XtX[r][c] = sum;
      }
      let sumY = 0;
      for (let i = 0; i < n; i++) {
        sumY += X[i][r] * y[i];
      }
      Xty[r] = sumY;
    }

    // Ridge penalty: subtle stabilizer or strong regularizer
    const lambda = ridgeActive ? 1.5 : 0.0001;
    for (let r = 1; r < numParams; r++) {
      XtX[r][r] += lambda;
    }

    const beta = solveLinearSystem(XtX, Xty);

    const evalFunc = (xVal: number) => {
      const nx = normalize(xVal);
      let val = 0;
      let power = 1;
      for (let j = 0; j <= d; j++) {
        val += beta[j] * power;
        power *= nx;
      }
      return val;
    };

    let totalRSS = 0;
    for (const pt of TRAINING_POINTS) {
      const pred = evalFunc(pt.x);
      totalRSS += (pt.y - pred) ** 2;
    }

    // Bias-Variance simulation metrics
    // Bias drops rapidly with degree; variance explodes with degree
    const rawBias = Math.max(0.04, 3.8 * Math.exp(-0.95 * d));
    const rawVar = 0.08 * Math.pow(d, 2.3) * (ridgeActive ? 0.35 : 1.0);
    const noise = 0.25;
    const mse = rawBias + rawVar + noise;

    return {
      coefficients: beta,
      rss: totalRSS,
      evaluatePoly: evalFunc,
      estBiasSq: rawBias,
      estVariance: rawVar,
      testMse: mse,
    };
  }, [degree, ridgeActive]);

  // Model diagnostics state
  const modelStatus = useMemo(() => {
    if (ridgeActive) {
      return {
        label: 'Regularized (Ridge L₂)',
        color: 'text-emerald-400 border-emerald-500/30',
        note: 'Coefficients shrunk toward zero. Suppresses high-degree boundary oscillations.',
      };
    }
    if (degree === 1) {
      return {
        label: 'Underfitting (High Bias)',
        color: 'text-amber-400 border-amber-500/30',
        note: 'Straight line lacks capacity to capture true curvature. Systematic residuals.',
      };
    }
    if (degree >= 2 && degree <= 4) {
      return {
        label: 'Optimal Fit (Balanced)',
        color: 'text-emerald-400 border-emerald-500/30',
        note: 'Smoothly tracks true underlying relationship without memorizing random noise.',
      };
    }
    return {
      label: "Overfitting (Runge's)",
      color: 'text-rose-400 border-rose-500/30',
      note: 'Runge boundary oscillations! Zero training error but catastrophic test generalization.',
    };
  }, [degree, ridgeActive]);

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

    if (activeTab === 'fit') {
      // ---------------- TAB 1: CURVE FITTING & RESIDUALS ----------------
      const xScale = d3.scaleLinear().domain([0, 10.5]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([-1.0, 7.5]).range([innerH, 0]);

      // Grid lines
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.12)
        .call(d3.axisLeft(yScale).tickSize(-innerW).tickFormat(() => ''));

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
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

      // Axis Labels
      g.append('text')
        .attr('x', innerW)
        .attr('y', innerH + 36)
        .attr('text-anchor', 'end')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Input Feature x');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -10)
        .attr('y', -34)
        .attr('text-anchor', 'end')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Response y');

      // True Underlying Function (soft dashed line)
      const trueFuncPoints: [number, number][] = [];
      for (let i = 0; i <= 100; i++) {
        const xVal = (i / 100) * 10;
        // True synthetic function: 2.5 + 1.8 * sin(0.7 * xVal - 0.5) + 0.3 * xVal
        const yTrue = 2.0 + 1.6 * Math.sin(0.75 * xVal - 0.4) + 0.28 * xVal;
        trueFuncPoints.push([xScale(xVal), yScale(yTrue)]);
      }

      g.append('path')
        .datum(trueFuncPoints)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.8)
        .attr('stroke-dasharray', '5 4')
        .attr('opacity', 0.7);

      // Fitted Polynomial Curve
      const steps = 200;
      const curvePoints: [number, number][] = [];
      for (let i = 0; i <= steps; i++) {
        const xVal = (i / steps) * 10.2;
        const yVal = evaluatePoly(xVal);
        curvePoints.push([xScale(xVal), yScale(yVal)]);
      }

      const curveColor = ridgeActive
        ? '#16a34a'
        : degree >= 6
        ? '#dc2626'
        : degree === 1
        ? '#d97706'
        : '#2563eb';

      g.append('path')
        .datum(curvePoints)
        .attr('fill', 'none')
        .attr('stroke', curveColor)
        .attr('stroke-width', 2.8)
        .attr('d', d3.line());

      // Residual Drop Lines
      TRAINING_POINTS.forEach((pt) => {
        const predY = evaluatePoly(pt.x);
        g.append('line')
          .attr('x1', xScale(pt.x))
          .attr('x2', xScale(pt.x))
          .attr('y1', yScale(pt.y))
          .attr('y2', yScale(predY))
          .attr('stroke', '#cbd5e1')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '3 3');
      });

      // Data Points
      g.selectAll('circle.data-point')
        .data(TRAINING_POINTS)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', (d) => xScale(d.x))
        .attr('cy', (d) => yScale(d.y))
        .attr('r', 5)
        .attr('fill', '#2563eb')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2);

      // Annotations
      if (degree >= 6 && !ridgeActive) {
        g.append('text')
          .attr('x', innerW - 10)
          .attr('y', 20)
          .attr('text-anchor', 'end')
          .attr('fill', '#dc2626')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .text("⚠️ Runge's Boundary Oscillation (Overfitting)");
      } else if (degree === 1) {
        g.append('text')
          .attr('x', innerW - 10)
          .attr('y', 20)
          .attr('text-anchor', 'end')
          .attr('fill', '#d97706')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .text('⚠️ Rigid Straight Line (High Bias Underfitting)');
      } else if (ridgeActive) {
        g.append('text')
          .attr('x', innerW - 10)
          .attr('y', 20)
          .attr('text-anchor', 'end')
          .attr('fill', '#16a34a')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .text('✓ L₂ Ridge Shrinkage Stabilized (Tamed Oscillations)');
      } else {
        g.append('text')
          .attr('x', innerW - 10)
          .attr('y', 20)
          .attr('text-anchor', 'end')
          .attr('fill', '#2563eb')
          .attr('font-size', '11px')
          .attr('font-weight', '700')
          .text('✓ Optimal Generalization Capacity');
      }

      // Legend
      const legend = g.append('g').attr('transform', `translate(10, 15)`);
      legend.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 18).attr('y2', 0).attr('stroke', '#94a3b8').attr('stroke-width', 1.8).attr('stroke-dasharray', '4 3');
      legend.append('text').attr('x', 24).attr('y', 3.5).attr('font-size', '11px').attr('fill', '#64748b').text('True Signal f(x)');

      legend.append('line').attr('x1', 0).attr('y1', 16).attr('x2', 18).attr('y2', 16).attr('stroke', curveColor).attr('stroke-width', 2.5);
      legend.append('text').attr('x', 24).attr('y', 19.5).attr('font-size', '11px').attr('fill', '#1e293b').attr('font-weight', '600').text(`Polynomial Fit (d = ${degree})`);
    } else {
      // ---------------- TAB 2: BIAS-VARIANCE TRADEOFF CURVES ----------------
      const degrees = [1, 2, 3, 4, 5, 6, 7, 8];
      const xScale = d3.scaleLinear().domain([1, 8]).range([0, innerW]);
      const yScale = d3.scaleLinear().domain([0, 5.0]).range([innerH, 0]);

      // Grid
      g.append('g')
        .attr('class', 'grid')
        .attr('opacity', 0.12)
        .call(d3.axisLeft(yScale).tickSize(-innerW).tickFormat(() => ''));

      // Axes
      g.append('g')
        .attr('transform', `translate(0,${innerH})`)
        .call(d3.axisBottom(xScale).ticks(8).tickFormat((d) => `d=${d}`))
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

      // Labels
      g.append('text')
        .attr('x', innerW / 2)
        .attr('y', innerH + 36)
        .attr('text-anchor', 'middle')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Model Complexity (Polynomial Degree d)');

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -innerH / 2)
        .attr('y', -34)
        .attr('text-anchor', 'middle')
        .attr('fill', '#475569')
        .attr('font-size', '12px')
        .attr('font-weight', '600')
        .text('Expected Error / MSE');

      // Curves data
      const curveData = degrees.map((d) => {
        const bSq = Math.max(0.04, 3.8 * Math.exp(-0.95 * d));
        const v = 0.08 * Math.pow(d, 2.3) * (ridgeActive ? 0.35 : 1.0);
        const trainErr = Math.max(0.02, 3.2 * Math.exp(-0.85 * d));
        const testErr = bSq + v + 0.25;
        return { d, bSq, v, trainErr, testErr };
      });

      // Lines
      const lineBias = d3.line<(typeof curveData)[0]>().x((d) => xScale(d.d)).y((d) => yScale(d.bSq));
      const lineVar = d3.line<(typeof curveData)[0]>().x((d) => xScale(d.d)).y((d) => yScale(d.v));
      const lineTrain = d3.line<(typeof curveData)[0]>().x((d) => xScale(d.d)).y((d) => yScale(d.trainErr));
      const lineTest = d3.line<(typeof curveData)[0]>().x((d) => xScale(d.d)).y((d) => yScale(d.testErr));

      // Draw Paths
      g.append('path').datum(curveData).attr('d', lineBias).attr('fill', 'none').attr('stroke', '#059669').attr('stroke-width', 2).attr('stroke-dasharray', '4 3');
      g.append('path').datum(curveData).attr('d', lineVar).attr('fill', 'none').attr('stroke', '#d97706').attr('stroke-width', 2).attr('stroke-dasharray', '4 3');
      g.append('path').datum(curveData).attr('d', lineTrain).attr('fill', 'none').attr('stroke', '#3b82f6').attr('stroke-width', 2.5);
      g.append('path').datum(curveData).attr('d', lineTest).attr('fill', 'none').attr('stroke', '#ef4444').attr('stroke-width', 3);

      // Current Degree Vertical Indicator Line
      g.append('line')
        .attr('x1', xScale(degree))
        .attr('y1', 0)
        .attr('x2', xScale(degree))
        .attr('y2', innerH)
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4 4');

      // Marker Dots at Current Degree
      const cur = curveData.find((c) => c.d === degree)!;
      g.append('circle').attr('cx', xScale(degree)).attr('cy', yScale(cur.testErr)).attr('r', 6).attr('fill', '#ef4444').attr('stroke', '#fff').attr('stroke-width', 2);
      g.append('circle').attr('cx', xScale(degree)).attr('cy', yScale(cur.trainErr)).attr('r', 5).attr('fill', '#3b82f6').attr('stroke', '#fff').attr('stroke-width', 1.5);

      // Legend
      const legend = g.append('g').attr('transform', `translate(15, 10)`);
      const items = [
        { label: 'Total Test MSE (U-Shape)', color: '#ef4444', dash: 'none', strokeW: 3 },
        { label: 'Training RSS (Monotonic)', color: '#3b82f6', dash: 'none', strokeW: 2.5 },
        { label: 'Squared Bias (Model Rigidity)', color: '#059669', dash: '4 3', strokeW: 2 },
        { label: 'Variance (Sensitivity to Noise)', color: '#d97706', dash: '4 3', strokeW: 2 },
      ];
      items.forEach((item, idx) => {
        const yOffset = idx * 16;
        legend.append('line').attr('x1', 0).attr('y1', yOffset).attr('x2', 18).attr('y2', yOffset).attr('stroke', item.color).attr('stroke-width', item.strokeW).attr('stroke-dasharray', item.dash);
        legend.append('text').attr('x', 24).attr('y', yOffset + 3.5).attr('font-size', '10.5px').attr('fill', '#334155').attr('font-weight', idx === 0 ? '700' : '500').text(item.label);
      });
    }
  }, [dimensions, degree, ridgeActive, activeTab, evaluatePoly]);

  return (
    <FigureBox
      title="Figure 3.3: Polynomial Geometry & Bias-Variance Tradeoff"
      caption="Interactive Polynomial Regression. Increase degree d to expand model capacity. Low degrees (d=1) underfit due to high bias; excessive degrees (d ≥ 6) cause wild boundary oscillations (Runge's Phenomenon) and high variance. Adding Ridge penalty (L₂) shrinks the polynomial coefficients and restores stability."
      controls={
        <div className="flex flex-col gap-3 w-full">
          {/* View Tab Selector & Presets */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setActiveTab('fit')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'fit'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📈 Fitted Curve & Residuals
              </button>
              <button
                onClick={() => setActiveTab('biasVariance')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'biasVariance'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📉 Bias-Variance Tradeoff
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { label: 'Linear (d = 1)', d: 1, ridge: false },
                { label: 'Quadratic (d = 2)', d: 2, ridge: false },
                { label: 'Optimal (d = 3)', d: 3, ridge: false },
                { label: 'Runge Overfit (d = 7)', d: 7, ridge: false },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setDegree(p.d);
                    setRidgeActive(p.ridge);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors active:scale-95 shadow-2xs ${
                    degree === p.d && !ridgeActive
                      ? 'border-blue-400 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}

              <button
                onClick={() => setRidgeActive(!ridgeActive)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors active:scale-95 shadow-2xs flex items-center gap-1 ${
                  ridgeActive
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>{ridgeActive ? '✓ L₂ Ridge Active' : '+ Add L₂ Ridge'}</span>
              </button>
            </div>
          </div>

          {/* Slider for Polynomial Degree */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <Slider
              label={`POLYNOMIAL DEGREE (d = ${degree})`}
              min={1}
              max={8}
              step={1}
              value={degree}
              onChange={(val) => setDegree(Math.round(val))}
              formatValue={(val) => `${Math.round(val)} (Parameters: ${Math.round(val) + 1})`}
            />
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
              <span className="text-slate-400 text-xs">Capacity:</span>
              <span className="text-blue-400 font-bold tabular-nums text-xs">
                d = {degree} ({degree + 1} params)
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Training RSS:</span>
              <span className="text-purple-400 font-bold tabular-nums text-xs">
                {rss.toFixed(3)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Est. Test MSE:</span>
              <span
                className={`font-bold tabular-nums text-xs ${
                  testMse < 1.0 ? 'text-emerald-400' : testMse < 2.0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {testMse.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
              <span className="text-slate-400 text-xs">Status:</span>
              <span className={`font-bold text-xs truncate max-w-[120px] ${modelStatus.color}`}>
                {modelStatus.label}
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
