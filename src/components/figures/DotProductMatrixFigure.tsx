'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Matrix2x2Input } from '@/components/figures/Matrix2x2Input';
import {
  attachDragHandle,
  createIsotropicPlane,
  drawCartesianGrid,
  drawTransformedGrid,
  drawVectorArrow,
  drawVectorLabel,
  useFigureDimensions,
} from '@/components/figures/linearAlgebraCanvas';
import {
  angleDeg2,
  dot2,
  matVec2,
  norm2,
  projectOnto,
  snapClamp,
  type Mat2,
  type Vec2,
} from '@/components/figures/linearAlgebraMath';

type TabMode = 'dot' | 'matrix';

const DEFAULT_A: Vec2 = { x: 2.5, y: 2.5 };
const DEFAULT_B: Vec2 = { x: 3.5, y: 0.5 };
const DEFAULT_MAT: Mat2 = [
  [1.4, 0.6],
  [0.2, 1.2],
];
const DEFAULT_X: Vec2 = { x: 2.0, y: 1.5 };

/**
 * Interactive visualizer covering geometric dot product / cosine similarity / orthogonal projection
 * and 2x2 matrix-vector transformation seen as stacked row dot products.
 */
export function DotProductMatrixFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useFigureDimensions(containerRef, { mobileHeight: 315, maxHeight: 390 });

  const [tab, setTab] = useState<TabMode>('dot');
  const [vecA, setVecA] = useState<Vec2>(DEFAULT_A);
  const [vecB, setVecB] = useState<Vec2>(DEFAULT_B);

  const [mat, setMat] = useState<Mat2>(DEFAULT_MAT);
  const [vecX, setVecX] = useState<Vec2>(DEFAULT_X);

  const dotMetrics = useMemo(() => {
    const dotVal = dot2(vecA, vecB);
    const normA = norm2(vecA);
    const normB = norm2(vecB);
    const cosineSim = normA > 1e-6 && normB > 1e-6 ? dotVal / (normA * normB) : 0;
    const angle = angleDeg2(vecA, vecB);
    const proj = projectOnto(vecA, vecB);
    const relation =
      Math.abs(dotVal) < 0.08
        ? 'Orthogonal (90°)'
        : dotVal > 0
        ? 'Aligned (+)'
        : 'Opposite (-)';
    return { dotVal, normA, normB, cosineSim, angle, proj, relation };
  }, [vecA, vecB]);

  const matrixResult = useMemo(() => matVec2(mat, vecX), [mat, vecX]);

  useEffect(() => {
    if (!svgRef.current) return;
    const plane = createIsotropicPlane(
      svgRef.current,
      dimensions.width,
      dimensions.height,
      4.5,
      'dot-mat-clip'
    );
    drawCartesianGrid(plane);
    const { g, xs, ys, isMobile } = plane;

    if (tab === 'dot') {
      // Orthogonal projection shadow along b
      const projTip = dotMetrics.proj.vec;
      if (norm2(vecB) > 0.05) {
        // Infinite faint line supporting vector b
        const bNorm = norm2(vecB);
        const dir = { x: vecB.x / bNorm, y: vecB.y / bNorm };
        g.append('line')
          .attr('x1', xs(-dir.x * 7))
          .attr('y1', ys(-dir.y * 7))
          .attr('x2', xs(dir.x * 7))
          .attr('y2', ys(dir.y * 7))
          .attr('stroke', '#fed7aa')
          .attr('stroke-width', 1.2)
          .attr('stroke-dasharray', '4 4');

        // Dashed perpendicular drop line from tip of a to projection point on b
        g.append('line')
          .attr('x1', xs(vecA.x))
          .attr('y1', ys(vecA.y))
          .attr('x2', xs(projTip.x))
          .attr('y2', ys(projTip.y))
          .attr('stroke', '#64748b')
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '4 3');

        // Green projection arrow
        drawVectorArrow(g, xs(0), ys(0), xs(projTip.x), ys(projTip.y), '#16a34a', {
          strokeWidth: 3.5,
          isMobile,
        });
        if (norm2(projTip) > 0.4) {
          drawVectorLabel(g, xs(projTip.x) + 6, ys(projTip.y) + 14, 'proj_b(a)', '#15803d', {
            isMobile,
            fontSize: 10,
          });
        }
      }

      // Angle arc between a and b
      if (dotMetrics.normA > 0.25 && dotMetrics.normB > 0.25) {
        const arcR = Math.min(34, Math.min(dotMetrics.normA, dotMetrics.normB) * plane.pixelsPerUnit * 0.45);
        const angA = Math.atan2(vecA.y, vecA.x);
        const angB = Math.atan2(vecB.y, vecB.x);
        let diff = angA - angB;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;

        // SVG y axis points downward, so canvas angle = Math.PI/2 - mathAngle for d3.arc
        const startD3 = Math.PI / 2 - angB;
        const endD3 = Math.PI / 2 - (angB + diff);
        const arcGen = d3
          .arc<unknown>()
          .innerRadius(arcR - 1.5)
          .outerRadius(arcR + 1.5)
          .startAngle(Math.min(startD3, endD3))
          .endAngle(Math.max(startD3, endD3));

        g.append('path')
          .attr('transform', `translate(${xs(0)},${ys(0)})`)
          .attr('d', arcGen({}) || '')
          .attr('fill', Math.abs(dotMetrics.dotVal) < 0.08 ? '#16a34a' : '#8b5cf6')
          .attr('opacity', 0.85);
      }

      // Vector b (orange) & Vector a (blue)
      drawVectorArrow(g, xs(0), ys(0), xs(vecB.x), ys(vecB.y), '#f97316', {
        strokeWidth: 2.5,
        isMobile,
      });
      drawVectorLabel(g, xs(vecB.x) + 8, ys(vecB.y) - 6, 'b', '#ea580c', { isMobile });

      drawVectorArrow(g, xs(0), ys(0), xs(vecA.x), ys(vecA.y), '#2563eb', {
        strokeWidth: 2.5,
        isMobile,
      });
      drawVectorLabel(g, xs(vecA.x) + 8, ys(vecA.y) - 6, 'a', '#1d4ed8', { isMobile });

      attachDragHandle(g, xs(vecB.x), ys(vecB.y), '#f97316', {
        isMobile,
        onDrag: (px, py) =>
          setVecB({ x: snapClamp(xs.invert(px), -4, 4), y: snapClamp(ys.invert(py), -4, 4) }),
      });

      attachDragHandle(g, xs(vecA.x), ys(vecA.y), '#2563eb', {
        isMobile,
        onDrag: (px, py) =>
          setVecA({ x: snapClamp(xs.invert(px), -4, 4), y: snapClamp(ys.invert(py), -4, 4) }),
      });
    } else {
      // Tab 2: 2x2 Matrix transformation preview
      drawTransformedGrid(plane, mat, { range: 5, opacity: 0.6 });

      // Transformed basis vectors A*i and A*j
      const col1 = { x: mat[0][0], y: mat[1][0] };
      const col2 = { x: mat[0][1], y: mat[1][1] };
      drawVectorArrow(g, xs(0), ys(0), xs(col1.x), ys(col1.y), '#0d9488', {
        strokeWidth: 2,
        isMobile,
        opacity: 0.8,
      });
      drawVectorLabel(g, xs(col1.x) + 6, ys(col1.y) + 12, 'Aî', '#0f766e', {
        isMobile,
        fontSize: 10,
      });

      drawVectorArrow(g, xs(0), ys(0), xs(col2.x), ys(col2.y), '#d97706', {
        strokeWidth: 2,
        isMobile,
        opacity: 0.8,
      });
      drawVectorLabel(g, xs(col2.x) + 6, ys(col2.y) - 6, 'Aĵ', '#b45309', {
        isMobile,
        fontSize: 10,
      });

      // Input vector x (blue dashed)
      drawVectorArrow(g, xs(0), ys(0), xs(vecX.x), ys(vecX.y), '#2563eb', {
        strokeWidth: 2.2,
        dashed: true,
        isMobile,
      });
      drawVectorLabel(g, xs(vecX.x) + 8, ys(vecX.y) + 12, 'x', '#1d4ed8', { isMobile });

      // Transformed output vector Ax (emerald solid)
      drawVectorArrow(g, xs(0), ys(0), xs(matrixResult.x), ys(matrixResult.y), '#7c3aed', {
        strokeWidth: 3,
        isMobile,
      });
      drawVectorLabel(g, xs(matrixResult.x) + 8, ys(matrixResult.y) - 6, 'Ax', '#6d28d9', {
        isMobile,
      });

      attachDragHandle(g, xs(vecX.x), ys(vecX.y), '#2563eb', {
        isMobile,
        onDrag: (px, py) =>
          setVecX({ x: snapClamp(xs.invert(px), -4, 4), y: snapClamp(ys.invert(py), -4, 4) }),
      });
    }
  }, [tab, vecA, vecB, mat, vecX, dotMetrics, matrixResult, dimensions]);

  return (
    <FigureBox
      title="Interactive Dot Product, Projection & 2×2 Matrix Multiply"
      caption={
        tab === 'dot'
          ? 'Drag tips a (blue) and b (orange) to watch the shadow projection proj_b(a) and cosine similarity change in real time.'
          : 'Drag input vector x (blue) or edit matrix A below. Notice how row 1 · x gives the horizontal output coordinate and row 2 · x gives the vertical coordinate.'
      }
      controls={
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setTab('dot')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'dot' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                📐 Dot Product & Shadow
              </button>
              <button
                onClick={() => setTab('matrix')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'matrix' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                🔢 Matrix × Vector (Ax)
              </button>
            </div>

            <button
              onClick={() => {
                setVecA(DEFAULT_A);
                setVecB(DEFAULT_B);
                setMat(DEFAULT_MAT);
                setVecX(DEFAULT_X);
              }}
              className="preset-btn text-[11px] px-2.5 py-1 text-slate-500"
            >
              ↺ Reset
            </button>
          </div>

          {tab === 'dot' ? (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="control-label text-[10px] mr-1">Presets:</span>
              {[
                { label: 'Acute (35°)', a: { x: 2.5, y: 2.5 }, b: { x: 3.5, y: 0.5 } },
                { label: 'Orthogonal (90°)', a: { x: 0, y: 3 }, b: { x: 3, y: 0 } },
                { label: 'Parallel (0°)', a: { x: 2, y: 1 }, b: { x: 4, y: 2 } },
                { label: 'Opposite (180°)', a: { x: 3, y: 1.5 }, b: { x: -3, y: -1.5 } },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setVecA(p.a);
                    setVecB(p.b);
                  }}
                  className="preset-btn text-[11px] px-2.5 py-1"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="control-label text-[10px] mr-1">Transforms:</span>
              {[
                { label: 'Stretch + Tilt', m: [[1.4, 0.6], [0.2, 1.2]] as Mat2 },
                { label: 'Rotate 90° CCW', m: [[0, -1], [1, 0]] as Mat2 },
                { label: 'Shear Right', m: [[1, 1.2], [0, 1]] as Mat2 },
                { label: 'X-Axis Shadow', m: [[1, 0], [0, 0]] as Mat2 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setMat(p.m)}
                  className="preset-btn text-[11px] px-2.5 py-1"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          {tab === 'dot' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">a · b:</span>
                <span
                  className={`font-bold tabular-nums ${
                    Math.abs(dotMetrics.dotVal) < 0.08
                      ? 'text-emerald-400'
                      : dotMetrics.dotVal > 0
                      ? 'text-blue-400'
                      : 'text-rose-400'
                  }`}
                >
                  {dotMetrics.dotVal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">cos(θ):</span>
                <span className="text-purple-300 font-bold tabular-nums">
                  {dotMetrics.cosineSim.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Angle θ:</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {dotMetrics.angle.toFixed(1)}°
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">State:</span>
                <span className="text-emerald-300 font-semibold truncate ml-1">
                  {dotMetrics.relation}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Matrix2x2Input label="A" matrix={mat} min={-2.5} max={2.5} onChange={setMat} />
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 flex-1">
                <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex-1">
                  <span className="text-slate-400">x:</span>
                  <span className="text-blue-400 font-bold tabular-nums">
                    [{vecX.x.toFixed(1)}, {vecX.y.toFixed(1)}]ᵀ
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-purple-500/40 flex-1">
                  <span className="text-slate-400">Ax:</span>
                  <span className="text-purple-300 font-bold tabular-nums">
                    [{matrixResult.x.toFixed(2)}, {matrixResult.y.toFixed(2)}]ᵀ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 {tab === 'dot' ? 'Drag vectors a & b' : 'Drag input vector x'}
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
