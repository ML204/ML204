'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider } from '@/components/figures/FigureControls';
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
  det2,
  IDENTITY_MAT2,
  inv2,
  lerpMat2,
  matMul2,
  matVec2,
  snapClamp,
  type Mat2,
  type Vec2,
} from '@/components/figures/linearAlgebraMath';

const DEFAULT_MAT: Mat2 = [
  [2.0, 0.5],
  [0.5, 1.5],
];

/**
 * Interactive 2x2 Determinant, Signed Area Scaling & Matrix Inverse Undo Visualizer.
 */
export function DeterminantInverseFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useFigureDimensions(containerRef, { mobileHeight: 315, maxHeight: 390 });

  const [mat, setMat] = useState<Mat2>(DEFAULT_MAT);
  const [undoT, setUndoT] = useState<number>(0); // 0 = A, 1 = A^-1 * A = I
  const [animTarget, setAnimTarget] = useState<number | null>(null);
  const [testVec, setTestVec] = useState<Vec2>({ x: 1.5, y: 1.0 });
  const undoTRef = useRef(0);
  undoTRef.current = undoT;

  const detA = useMemo(() => det2(mat), [mat]);
  const inverseA = useMemo(() => inv2(mat, 1e-4), [mat]);
  const isSingular = inverseA === null;

  // Smooth active matrix: interpolates between A (t=0) and A^-1 * A = I (t=1)
  const activeMat = useMemo<Mat2>(() => {
    if (isSingular || undoT <= 0.001) return mat;
    const undoOp = lerpMat2(IDENTITY_MAT2, inverseA, undoT);
    return matMul2(undoOp, mat);
  }, [mat, inverseA, isSingular, undoT]);

  // Animate undo forward/backward smoothly toward animTarget
  useEffect(() => {
    if (animTarget === null || isSingular) {
      return;
    }
    let rafId = 0;
    const startVal = undoTRef.current;
    const startTime = performance.now();
    const duration = 700;

    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      setUndoT(startVal + (animTarget - startVal) * eased);
      if (elapsed < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setAnimTarget(null);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [animTarget, isSingular]);

  const currentDet = useMemo(() => det2(activeMat), [activeMat]);
  const outVec = useMemo(() => matVec2(activeMat, testVec), [activeMat, testVec]);

  useEffect(() => {
    if (!svgRef.current) return;
    const plane = createIsotropicPlane(
      svgRef.current,
      dimensions.width,
      dimensions.height,
      4.5,
      'det-inv-clip'
    );
    drawCartesianGrid(plane);
    const { g, xs, ys, isMobile } = plane;

    // Warped grid
    drawTransformedGrid(plane, activeMat, {
      range: 5,
      stroke: currentDet < -1e-3 ? '#fda4af' : '#93c5fd',
      axisStroke: currentDet < -1e-3 ? '#e11d48' : '#3b82f6',
      opacity: 0.55,
    });

    // Original unit square outline [0,1]^2 for reference
    const sqPts = [
      [xs(0), ys(0)],
      [xs(1), ys(0)],
      [xs(1), ys(1)],
      [xs(0), ys(1)],
    ];
    g.append('polygon')
      .attr('points', sqPts.map((p) => p.join(',')).join(' '))
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', '4 3');

    // Transformed unit parallelogram spanned by col1 and col2
    const c1 = { x: activeMat[0][0], y: activeMat[1][0] };
    const c2 = { x: activeMat[0][1], y: activeMat[1][1] };
    const c12 = { x: c1.x + c2.x, y: c1.y + c2.y };

    const paraFill =
      Math.abs(currentDet) < 1e-3
        ? '#f59e0b'
        : currentDet > 0
        ? '#10b981'
        : '#f43f5e';

    const paraPts = [
      [xs(0), ys(0)],
      [xs(c1.x), ys(c1.y)],
      [xs(c12.x), ys(c12.y)],
      [xs(c2.x), ys(c2.y)],
    ];

    g.append('polygon')
      .attr('points', paraPts.map((p) => p.join(',')).join(' '))
      .attr('fill', paraFill)
      .attr('fill-opacity', 0.22)
      .attr('stroke', paraFill)
      .attr('stroke-width', 2);

    // Transformed basis arrows
    drawVectorArrow(g, xs(0), ys(0), xs(c1.x), ys(c1.y), '#0d9488', {
      strokeWidth: 2.5,
      isMobile,
    });
    drawVectorLabel(g, xs(c1.x) + 6, ys(c1.y) + 12, 'col₁', '#0f766e', {
      isMobile,
      fontSize: 10,
    });

    drawVectorArrow(g, xs(0), ys(0), xs(c2.x), ys(c2.y), '#d97706', {
      strokeWidth: 2.5,
      isMobile,
    });
    drawVectorLabel(g, xs(c2.x) + 6, ys(c2.y) - 6, 'col₂', '#b45309', {
      isMobile,
      fontSize: 10,
    });

    // Input test vector x and transformed output
    drawVectorArrow(g, xs(0), ys(0), xs(testVec.x), ys(testVec.y), '#64748b', {
      strokeWidth: 1.8,
      dashed: true,
      isMobile,
    });
    drawVectorLabel(g, xs(testVec.x) + 7, ys(testVec.y) + 12, 'x', '#475569', {
      isMobile,
      fontSize: 11,
    });

    drawVectorArrow(g, xs(0), ys(0), xs(outVec.x), ys(outVec.y), '#7c3aed', {
      strokeWidth: 2.8,
      isMobile,
    });
    drawVectorLabel(g, xs(outVec.x) + 8, ys(outVec.y) - 6, undoT > 0.5 ? 'A⁻¹(Ax)' : 'Ax', '#6d28d9', {
      isMobile,
      fontSize: 11,
    });

    attachDragHandle(g, xs(testVec.x), ys(testVec.y), '#475569', {
      isMobile,
      onDrag: (px, py) =>
        setTestVec({ x: snapClamp(xs.invert(px), -3.5, 3.5), y: snapClamp(ys.invert(py), -3.5, 3.5) }),
    });
  }, [activeMat, currentDet, testVec, outVec, undoT, dimensions]);

  function applyPreset(m: Mat2) {
    setAnimTarget(null);
    setUndoT(0);
    setMat(m);
  }

  return (
    <FigureBox
      title="Interactive Determinant (Area Scale) & Inverse (Undo)"
      caption="The shaded parallelogram shows how a 1×1 unit square scales under matrix A. Emerald means orientation is preserved (det > 0), rose means flipped upside-down (det < 0), and det = 0 collapses area to zero so A⁻¹ cannot exist."
      controls={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="control-label text-[10px] mr-1">Presets:</span>
              {[
                { label: 'Scale (det=3)', m: [[2, 0], [0, 1.5]] as Mat2 },
                { label: 'Shear (det=1)', m: [[1, 1.2], [0, 1]] as Mat2 },
                { label: 'Flip (det=-2)', m: [[-1, 0.5], [0, 2]] as Mat2 },
                { label: 'Singular (det=0)', m: [[1.5, 1.5], [1, 1]] as Mat2 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.m)}
                  className="preset-btn text-[11px] px-2.5 py-1"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                applyPreset(DEFAULT_MAT);
                setTestVec({ x: 1.5, y: 1.0 });
              }}
              className="preset-btn text-[11px] px-2.5 py-1 text-slate-500"
            >
              ↺ Reset
            </button>
          </div>

          {/* Undo Slider / Animate Button */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
            <button
              disabled={isSingular}
              onClick={() => setAnimTarget(undoT < 0.5 ? 1 : 0)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-300 disabled:text-slate-500 transition-colors whitespace-nowrap"
            >
              {isSingular
                ? '🚫 Singular: No Inverse'
                : undoT > 0.5
                ? '⟲ Re-apply A'
                : '⏪ Apply A⁻¹ (Undo)'}
            </button>
            <Slider
              label="Transform Progress (A → A⁻¹A = I)"
              value={undoT}
              min={0}
              max={1}
              step={0.01}
              onChange={(val) => {
                if (!isSingular) {
                  setAnimTarget(null);
                  setUndoT(val);
                }
              }}
            />
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Matrix2x2Input
              label="A"
              matrix={mat}
              min={-3}
              max={3}
              accent="blue"
              onChange={(m) => {
                setAnimTarget(null);
                setUndoT(0);
                setMat(m);
              }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">det(A):</span>
                <span
                  className={`font-bold tabular-nums ${
                    Math.abs(detA) < 1e-3
                      ? 'text-amber-400'
                      : detA > 0
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }`}
                >
                  {detA.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Area Scale:</span>
                <span className="text-slate-200 font-bold tabular-nums">
                  {Math.abs(currentDet).toFixed(2)}×
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-semibold ${
                    isSingular ? 'text-amber-400' : detA > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isSingular ? 'Collapsed (det=0)' : detA > 0 ? 'Invertible (+)' : 'Flipped (-)'}
                </span>
              </div>
            </div>
          </div>
          {inverseA && (
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
              <span className="text-slate-400">Computed A⁻¹ =</span>
              <span className="text-purple-300 font-bold">
                [[{inverseA[0][0].toFixed(2)}, {inverseA[0][1].toFixed(2)}], [{inverseA[1][0].toFixed(2)}, {inverseA[1][1].toFixed(2)}]]
              </span>
            </div>
          )}
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag test vector x
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
