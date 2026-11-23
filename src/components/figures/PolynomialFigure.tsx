'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';

interface Point {
  x: number;
  y: number;
}

// Fixed noisy sinusoidal dataset that clearly shows underfitting, optimal fit, and overfitting
const TRAINING_POINTS: Point[] = [
  { x: 0.5, y: 1.2 },
  { x: 1.2, y: 2.8 },
  { x: 2.0, y: 3.6 },
  { x: 3.1, y: 3.2 },
  { x: 4.0, y: 1.8 },
  { x: 5.0, y: 0.8 },
  { x: 6.2, y: 1.1 },
  { x: 7.1, y: 2.4 },
  { x: 8.0, y: 4.1 },
  { x: 8.8, y: 5.2 },
  { x: 9.5, y: 5.8 },
];

/**
 * Solve (X^T X + lambda * I) beta = X^T y using Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const n = A.length;
  // Deep clone augmented matrix
  const M: number[][] = A.map((row, i) => [...row, b[i]]);

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(M[k][i]) > Math.abs(M[maxRow][i])) {
        maxRow = k;
      }
    }
    // Swap rows
    const tmp = M[i];
    M[i] = M[maxRow];
    M[maxRow] = tmp;

    const pivot = M[i][i];
    if (Math.abs(pivot) < 1e-12) {
      // Degenerate/singular fallback
      continue;
    }

    // Eliminate column entries below
    for (let k = i + 1; k < n; k++) {
      const factor = M[k][i] / pivot;
      for (let j = i; j <= n; j++) {
        M[k][j] -= factor * M[i][j];
      }
    }
  }

  // Back substitution
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
  const [dimensions, setDimensions] = useState({ width: 620, height: 320 });
  const [degree, setDegree] = useState<number>(3);
  const [regularized, setRegularized] = useState<boolean>(false);

  // Responsive resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const width = rect?.width ?? 620;
      const height = width < 480 ? 270 : Math.round(Math.min(350, Math.max(250, width * 0.5)));
      setDimensions({ width, height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute polynomial coefficients via normal equations
  const { coefficients, rss, evaluatePoly } = useMemo(() => {
    const d = degree;
    const n = TRAINING_POINTS.length;
    const numParams = d + 1;

    // Normalizing x to [-1, 1] internally guarantees numerical conditioning of high powers
    const xMin = 0;
    const xMax = 10;
    const normalize = (xVal: number) => ((xVal - xMin) / (xMax - xMin)) * 2 - 1;

    // Build Vandermonde Matrix X (n x (d+1))
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

    // Compute X^T * X and X^T * y
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

    // Add Ridge penalty to diagonal if regularization is enabled (excluding intercept)
    const lambda = regularized ? 0.8 : 0.0001; // subtle ridge regularizer prevents pure singularity
    for (let r = 1; r < numParams; r++) {
      XtX[r][r] += lambda;
    }

    // Solve for beta
    const beta = solveLinearSystem(XtX, Xty);

    // Evaluator function for any original x in [0, 10]
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

    // Calculate training RSS
    let totalRSS = 0;
    for (const pt of TRAINING_POINTS) {
      const pred = evalFunc(pt.x);
      totalRSS += (pt.y - pred) ** 2;
    }

    return {
      coefficients: beta,
      rss: totalRSS,
      evaluatePoly: evalFunc,
    };
  }, [degree, regularized]);

  // Render SVG plot
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 25, bottom: 35, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const yScale = d3.scaleLinear().domain([-0.5, 7.5]).range([height, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.12)
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ''));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(dimensions.width < 450 ? 5 : 10))
      .call((axis) => axis.select('.domain').attr('stroke', '#cbd5e1'))
      .call((axis) => axis.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '11px'));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .call((axis) => axis.select('.domain').attr('stroke', '#cbd5e1'))
      .call((axis) => axis.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '11px'));

    // Continuous fitted curve
    const steps = 180;
    const curvePoints: [number, number][] = [];
    for (let i = 0; i <= steps; i++) {
      const xVal = (i / steps) * 10;
      const yVal = evaluatePoly(xVal);
      curvePoints.push([xScale(xVal), yScale(yVal)]);
    }

    const lineGenerator = d3.line();

    g.append('path')
      .datum(curvePoints)
      .attr('fill', 'none')
      .attr('stroke', regularized ? '#059669' : degree >= 7 ? '#dc2626' : '#4f46e5')
      .attr('stroke-width', 2.5)
      .attr('d', lineGenerator);

    // Draw residual vertical drop lines
    TRAINING_POINTS.forEach((pt) => {
      const predY = evaluatePoly(pt.x);
      g.append('line')
        .attr('x1', xScale(pt.x))
        .attr('x2', xScale(pt.x))
        .attr('y1', yScale(pt.y))
        .attr('y2', yScale(predY))
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '3,3');
    });

    // Draw training points
    g.selectAll('circle.data-point')
      .data(TRAINING_POINTS)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', dimensions.width < 450 ? 4 : 5)
      .attr('fill', '#3b82f6')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer');
  }, [dimensions, degree, regularized, evaluatePoly]);

  // Model diagnostics state
  const modelStatus = useMemo(() => {
    if (regularized) {
      return {
        label: 'Regularized (Ridge Shrunk)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        note: 'High degree polynomial with L2 penalty: dampened oscillations!',
      };
    }
    if (degree === 1) {
      return {
        label: 'Underfitting (High Bias)',
        color: 'bg-amber-50 text-amber-800 border-amber-300',
        note: 'Straight line fails to capture the true curve. Systematic residuals.',
      };
    }
    if (degree >= 2 && degree <= 4) {
      return {
        label: 'Optimal Fit (Balanced)',
        color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
        note: 'Smoothly models curvature without fitting noise.',
      };
    }
    return {
      label: "Overfitting (Runge's Phenomenon)",
      color: 'bg-red-50 text-red-800 border-red-300',
      note: 'Violent boundary oscillations! Lowest RSS on training, but poor generalization.',
    };
  }, [degree, regularized]);

  return (
    <FigureBox
      title="Interactive Polynomial Degree & Overfitting Explorer"
      caption="Adjust degree d and toggle regularization to observe how the hypothesis space expands from a rigid line to flexible curves and boundary oscillations."
    >
      <div ref={containerRef} className="space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Degree: <span className="text-brand-600 font-mono text-sm">d = {degree}</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={degree}
              onChange={(e) => setDegree(Number(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setDegree(1); setRegularized(false); }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                degree === 1 && !regularized
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Linear (d=1)
            </button>
            <button
              onClick={() => { setDegree(3); setRegularized(false); }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                degree === 3 && !regularized
                  ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cubic (d=3)
            </button>
            <button
              onClick={() => { setDegree(7); setRegularized(false); }}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                degree === 7 && !regularized
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Overfit (d=7)
            </button>
            <button
              onClick={() => setRegularized(!regularized)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 ${
                regularized
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{regularized ? '✓ Ridge ON' : '+ Add Ridge'}</span>
            </button>
          </div>
        </div>

        {/* SVG Plot */}
        <div className="w-full overflow-hidden bg-white rounded-xl border border-slate-200 shadow-2xs">
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-auto block select-none"
          />
        </div>

        {/* Live Diagnostics Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turning Points</p>
            <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
              ≤ {degree - 1}
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features</p>
            <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
              {degree + 1} <span className="text-xs text-slate-400">(incl. β₀)</span>
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Training RSS</p>
            <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
              {rss.toFixed(3)}
            </p>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diagnosis</p>
            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border mt-0.5 ${modelStatus.color}`}>
              {modelStatus.label}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic text-center">
          💡 {modelStatus.note}
        </p>
      </div>
    </FigureBox>
  );
}
