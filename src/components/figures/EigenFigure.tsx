'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, Toggle } from '@/components/figures/FigureControls';
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
  eigen2x2,
  matVec2,
  norm2,
  type Mat2,
  type Vec2,
} from '@/components/figures/linearAlgebraMath';

const DEFAULT_MAT: Mat2 = [
  [2.2, 0.8],
  [0.8, 1.4],
];

/**
 * Interactive 2x2 Eigenvalue & Eigenvector Span Sweeper with unit-circle/ellipse visualization.
 */
export function EigenFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useFigureDimensions(containerRef, { mobileHeight: 320, maxHeight: 390 });

  const [mat, setMat] = useState<Mat2>(DEFAULT_MAT);
  const [angleDeg, setAngleDeg] = useState<number>(35);
  const [showEllipse, setShowEllipse] = useState<boolean>(true);

  const unitV = useMemo<Vec2>(() => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: Math.cos(rad), y: Math.sin(rad) };
  }, [angleDeg]);

  const eigen = useMemo(() => eigen2x2(mat), [mat]);
  const av = useMemo(() => matVec2(mat, unitV), [mat, unitV]);

  // Check if unitV is currently aligned with any real eigenvector span (within 4 degrees)
  const alignmentInfo = useMemo(() => {
    if (eigen.kind !== 'real') return { matched: false, lambda: null as number | null };
    for (const pair of eigen.realPairs) {
      const a1 = angleDeg2(unitV, pair.vec);
      const a2 = angleDeg2(unitV, { x: -pair.vec.x, y: -pair.vec.y });
      if (Math.min(a1, a2) <= 4.0) {
        return { matched: true, lambda: pair.lambda };
      }
    }
    return { matched: false, lambda: null as number | null };
  }, [eigen, unitV]);

  useEffect(() => {
    if (!svgRef.current) return;
    const plane = createIsotropicPlane(
      svgRef.current,
      dimensions.width,
      dimensions.height,
      3.8,
      'eigen-clip'
    );
    drawCartesianGrid(plane, { ticks: [-3, -2, -1, 1, 2, 3] });
    const { g, clippedG, xs, ys, isMobile } = plane;

    drawTransformedGrid(plane, mat, { range: 5, opacity: 0.4 });

    // Unit circle & transformed ellipse showing covariance / PCA spread
    if (showEllipse) {
      const unitCirclePts: [number, number][] = [];
      const ellipsePts: [number, number][] = [];
      for (let i = 0; i <= 96; i++) {
        const t = (2 * Math.PI * i) / 96;
        const p = { x: Math.cos(t), y: Math.sin(t) };
        const ap = matVec2(mat, p);
        unitCirclePts.push([p.x, p.y]);
        ellipsePts.push([ap.x, ap.y]);
      }
      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xs(d[0]))
        .y((d) => ys(d[1]));

      clippedG
        .append('path')
        .datum(unitCirclePts)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '4 3');

      clippedG
        .append('path')
        .datum(ellipsePts)
        .attr('d', lineGen)
        .attr('fill', '#6366f1')
        .attr('fill-opacity', 0.08)
        .attr('stroke', '#6366f1')
        .attr('stroke-width', 1.8);
    }

    // Draw infinite eigenvector span lines if real
    if (eigen.kind === 'real') {
      const spanColors = ['#10b981', '#f59e0b'];
      eigen.realPairs.forEach((pair, idx) => {
        const col = spanColors[idx % spanColors.length];
        clippedG
          .append('line')
          .attr('x1', xs(-pair.vec.x * 7))
          .attr('y1', ys(-pair.vec.y * 7))
          .attr('x2', xs(pair.vec.x * 7))
          .attr('y2', ys(pair.vec.y * 7))
          .attr('stroke', col)
          .attr('stroke-width', alignmentInfo.matched ? 2.2 : 1.7)
          .attr('stroke-dasharray', '6 4')
          .attr('opacity', 0.85);

        const badgePt = { x: pair.vec.x * 2.5, y: pair.vec.y * 2.5 };
        drawVectorLabel(
          g,
          xs(badgePt.x),
          ys(badgePt.y),
          `e${idx + 1} (λ=${pair.lambda.toFixed(2)})`,
          col,
          { isMobile, anchor: 'middle', fontSize: 10 }
        );
      });
    }

    // Draw current Av first, then unit v on top so v stays visible
    const avColor = alignmentInfo.matched ? '#16a34a' : '#7c3aed';
    drawVectorArrow(g, xs(0), ys(0), xs(av.x), ys(av.y), avColor, {
      strokeWidth: alignmentInfo.matched ? 3.5 : 2.8,
      isMobile,
    });
    drawVectorLabel(
      g,
      xs(av.x) + 8,
      ys(av.y) - 6,
      alignmentInfo.matched && alignmentInfo.lambda !== null
        ? `Av = ${alignmentInfo.lambda.toFixed(2)}v 🎯`
        : 'Av',
      avColor,
      { isMobile }
    );

    drawVectorArrow(g, xs(0), ys(0), xs(unitV.x), ys(unitV.y), '#2563eb', {
      strokeWidth: 2.5,
      isMobile,
    });
    drawVectorLabel(g, xs(unitV.x) + 8, ys(unitV.y) + 12, 'v', '#1d4ed8', { isMobile });

    attachDragHandle(g, xs(unitV.x), ys(unitV.y), '#2563eb', {
      isMobile,
      onDrag: (px, py) => {
        const wx = xs.invert(px);
        const wy = ys.invert(py);
        let deg = (Math.atan2(wy, wx) * 180) / Math.PI;
        if (deg < 0) deg += 360;
        setAngleDeg(Math.round(deg));
      },
    });
  }, [mat, eigen, unitV, av, alignmentInfo, showEllipse, dimensions]);

  function snapToEigenvec(idx: number) {
    const pair = eigen.realPairs[idx];
    if (!pair) return;
    let deg = (Math.atan2(pair.vec.y, pair.vec.x) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    setAngleDeg(Math.round(deg));
  }

  return (
    <FigureBox
      title="Interactive Eigenvector Sweeper: Finding Invariant Directions"
      caption="Rotate unit vector v (blue) around the dashed unit circle. Most directions get knocked off-course into Av (purple), EXCEPT the special eigenvector span lines where Av lands squarely on the same line (Av = λv)!"
      controls={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="control-label text-[10px] mr-1">Matrices:</span>
              {[
                { label: 'PCA Covariance', m: [[2.2, 0.8], [0.8, 1.4]] as Mat2 },
                { label: 'Flip Axis (λ<0)', m: [[0.6, 1.4], [1.4, 0.6]] as Mat2 },
                { label: 'Shear', m: [[1.5, 1.2], [0, 1.0]] as Mat2 },
                { label: 'Rotation (Complex)', m: [[0, -1], [1, 0]] as Mat2 },
                { label: 'Singular (λ₂=0)', m: [[1.5, 0.75], [1.5, 0.75]] as Mat2 },
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
            <button
              onClick={() => {
                setMat(DEFAULT_MAT);
                setAngleDeg(35);
              }}
              className="preset-btn text-[11px] px-2.5 py-1 text-slate-500"
            >
              ↺ Reset
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
            <Slider
              label="Sweep Vector v Angle"
              value={angleDeg}
              min={0}
              max={360}
              step={1}
              unit="°"
              formatValue={(v) => v.toFixed(0)}
              onChange={setAngleDeg}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              {eigen.kind === 'real' && (
                <>
                  <button
                    onClick={() => snapToEigenvec(0)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    🎯 Snap e₁
                  </button>
                  <button
                    onClick={() => snapToEigenvec(1)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700"
                  >
                    🎯 Snap e₂
                  </button>
                </>
              )}
              <Toggle label="Unit Ellipse" value={showEllipse} onChange={setShowEllipse} />
            </div>
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <Matrix2x2Input label="A" matrix={mat} min={-2.5} max={2.5} accent="indigo" onChange={setMat} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Eigenvalues:</span>
                {eigen.kind === 'real' ? (
                  <span className="text-emerald-400 font-bold tabular-nums">
                    {eigen.realPairs[0].lambda.toFixed(2)}, {eigen.realPairs[1].lambda.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-amber-300 font-bold tabular-nums">
                    {eigen.complexParts?.real.toFixed(1)}±{eigen.complexParts?.imag.toFixed(1)}i
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Stretch ‖Av‖:</span>
                <span className="text-purple-300 font-bold tabular-nums">{norm2(av).toFixed(2)}×</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Aligned?:</span>
                <span
                  className={`font-bold ${
                    eigen.kind === 'complex'
                      ? 'text-amber-400'
                      : alignmentInfo.matched
                      ? 'text-emerald-400'
                      : 'text-slate-300'
                  }`}
                >
                  {eigen.kind === 'complex'
                    ? 'No real evec'
                    : alignmentInfo.matched
                    ? 'YES (Av = λv)'
                    : `${Math.min(angleDeg2(unitV, av), 180 - angleDeg2(unitV, av)).toFixed(1)}° off`}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag unit tip v around circle
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
