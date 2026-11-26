'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, Toggle } from '@/components/figures/FigureControls';
import {
  attachDragHandle,
  createIsotropicPlane,
  drawCartesianGrid,
  drawVectorArrow,
  drawVectorLabel,
  useFigureDimensions,
} from '@/components/figures/linearAlgebraCanvas';
import { normP, snapClamp, type Vec2 } from '@/components/figures/linearAlgebraMath';

/** Generates polygon coordinates of a 2D L_p ball contour of radius R. */
function buildLpContour(radius: number, p: number, samples = 140): [number, number][] {
  if (radius <= 1e-6) return [[0, 0]];
  if (!Number.isFinite(p) || p >= 50) {
    return [
      [radius, radius],
      [-radius, radius],
      [-radius, -radius],
      [radius, -radius],
      [radius, radius],
    ];
  }
  const pts: [number, number][] = [];
  for (let i = 0; i <= samples; i++) {
    const theta = (2 * Math.PI * i) / samples;
    const ct = Math.cos(theta);
    const st = Math.sin(theta);
    const x = Math.sign(ct) * Math.pow(Math.abs(ct), 2 / p) * radius;
    const y = Math.sign(st) * Math.pow(Math.abs(st), 2 / p) * radius;
    pts.push([x, y]);
  }
  return pts;
}

/**
 * Interactive L1 (Manhattan), L2 (Euclidean), and L_p / L_infinity Norms Visualizer.
 */
export function NormsFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useFigureDimensions(containerRef, { mobileHeight: 320, maxHeight: 390 });

  const [vec, setVec] = useState<Vec2>({ x: 3.0, y: 4.0 });
  const [pValue, setPValue] = useState<number>(2);
  const [useInfinity, setUseInfinity] = useState<boolean>(false);
  const [showL1Ball, setShowL1Ball] = useState<boolean>(true);
  const [showL2Ball, setShowL2Ball] = useState<boolean>(true);
  const [showLInfBall, setShowLInfBall] = useState<boolean>(false);

  const effectiveP = useInfinity ? Infinity : pValue;

  const norms = useMemo(() => {
    const l1 = normP(vec, 1);
    const l2 = normP(vec, 2);
    const lInf = normP(vec, Infinity);
    const lp = normP(vec, effectiveP);
    return { l1, l2, lInf, lp };
  }, [vec, effectiveP]);

  useEffect(() => {
    if (!svgRef.current) return;
    const plane = createIsotropicPlane(
      svgRef.current,
      dimensions.width,
      dimensions.height,
      4.8,
      'norms-clip'
    );
    drawCartesianGrid(plane, { ticks: [-4, -2, 2, 4] });
    const { g, clippedG, xs, ys, isMobile } = plane;

    const lineGen = d3
      .line<[number, number]>()
      .x((d) => xs(d[0]))
      .y((d) => ys(d[1]));

    // Draw level contours passing through the tip of v (radius = norm_p(v)) so users see why balls differ
    if (showL1Ball && norms.l1 > 0.05) {
      clippedG
        .append('path')
        .datum(buildLpContour(norms.l1, 1))
        .attr('d', lineGen)
        .attr('fill', '#f97316')
        .attr('fill-opacity', 0.06)
        .attr('stroke', '#f97316')
        .attr('stroke-width', 1.6)
        .attr('stroke-dasharray', '4 3');
    }

    if (showL2Ball && norms.l2 > 0.05) {
      clippedG
        .append('path')
        .datum(buildLpContour(norms.l2, 2))
        .attr('d', lineGen)
        .attr('fill', '#2563eb')
        .attr('fill-opacity', 0.06)
        .attr('stroke', '#2563eb')
        .attr('stroke-width', 1.6)
        .attr('stroke-dasharray', '5 4');
    }

    if (showLInfBall && norms.lInf > 0.05) {
      clippedG
        .append('path')
        .datum(buildLpContour(norms.lInf, Infinity))
        .attr('d', lineGen)
        .attr('fill', '#7c3aed')
        .attr('fill-opacity', 0.06)
        .attr('stroke', '#7c3aed')
        .attr('stroke-width', 1.6)
        .attr('stroke-dasharray', '2 3');
    }

    // Active custom Lp contour matching ||v||_p
    if (norms.lp > 0.05 && (useInfinity || (Math.abs(pValue - 1) > 0.05 && Math.abs(pValue - 2) > 0.05))) {
      clippedG
        .append('path')
        .datum(buildLpContour(norms.lp, effectiveP))
        .attr('d', lineGen)
        .attr('fill', '#10b981')
        .attr('fill-opacity', 0.09)
        .attr('stroke', '#059669')
        .attr('stroke-width', 2);
    }

    // Draw L1 City-Block walk: (0,0) -> (vx, 0) -> (vx, vy)
    g.append('path')
      .attr(
        'd',
        `M ${xs(0)},${ys(0)} L ${xs(vec.x)},${ys(0)} L ${xs(vec.x)},${ys(vec.y)}`
      )
      .attr('fill', 'none')
      .attr('stroke', '#f97316')
      .attr('stroke-width', 2.8)
      .attr('stroke-dasharray', '6 4');

    // Label horizontal and vertical city blocks if large enough
    if (Math.abs(vec.x) >= 0.7) {
      drawVectorLabel(
        g,
        xs(vec.x / 2),
        ys(0) + (vec.y >= 0 ? 14 : -8),
        `|x₁|=${Math.abs(vec.x).toFixed(1)}`,
        '#ea580c',
        { isMobile, anchor: 'middle', fontSize: 10 }
      );
    }
    if (Math.abs(vec.y) >= 0.7) {
      drawVectorLabel(
        g,
        xs(vec.x) + (vec.x >= 0 ? 8 : -8),
        ys(vec.y / 2),
        `|x₂|=${Math.abs(vec.y).toFixed(1)}`,
        '#ea580c',
        { isMobile, anchor: vec.x >= 0 ? 'start' : 'end', fontSize: 10 }
      );
    }

    // Draw L2 Crow-Flies straight vector arrow
    drawVectorArrow(g, xs(0), ys(0), xs(vec.x), ys(vec.y), '#2563eb', {
      strokeWidth: 3,
      isMobile,
    });
    drawVectorLabel(g, xs(vec.x) + 8, ys(vec.y) - 8, 'v (L₂)', '#1d4ed8', { isMobile });

    attachDragHandle(g, xs(vec.x), ys(vec.y), '#2563eb', {
      isMobile,
      onDrag: (px, py) =>
        setVec({
          x: snapClamp(xs.invert(px), -4.2, 4.2, 0.25),
          y: snapClamp(ys.invert(py), -4.2, 4.2, 0.25),
        }),
    });
  }, [vec, effectiveP, pValue, useInfinity, norms, showL1Ball, showL2Ball, showLInfBall, dimensions]);

  return (
    <FigureBox
      title="Interactive Vector Norms: L₁ Taxi Walk vs L₂ Straight Line"
      caption="Drag the blue dot anywhere. Notice how the orange Manhattan walk follows the grid streets (|x₁| + |x₂|), while the blue Euclidean arrow cuts diagonally (√(x₁² + x₂²)). Contours show all points sharing v's norm!"
      controls={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Toggle label="L₁ Diamond" value={showL1Ball} onChange={setShowL1Ball} />
              <Toggle label="L₂ Circle" value={showL2Ball} onChange={setShowL2Ball} />
              <Toggle label="L∞ Square" value={showLInfBall} onChange={setShowLInfBall} />
            </div>
            <button
              onClick={() => {
                setVec({ x: 3.0, y: 4.0 });
                setPValue(2);
                setUseInfinity(false);
              }}
              className="preset-btn text-[11px] px-2.5 py-1 text-slate-500"
            >
              ↺ Reset
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="control-label text-[10px] mr-1">Presets:</span>
            {[
              { label: '3-4-5 Triangle', v: { x: 3, y: 4 } },
              { label: 'Axis-Aligned (L₁=L₂=L∞)', v: { x: 3.5, y: 0 } },
              { label: 'Diagonal (2.5, 2.5)', v: { x: 2.5, y: 2.5 } },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => setVec(p.v)}
                className="preset-btn text-[11px] px-2.5 py-1"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
            <Slider
              label={`Custom Lₚ Shape (p = ${useInfinity ? '∞' : pValue.toFixed(1)})`}
              value={pValue}
              min={1}
              max={8}
              step={0.1}
              onChange={(val) => {
                setUseInfinity(false);
                setPValue(val);
              }}
            />
            <Toggle label="Lock p = ∞" value={useInfinity} onChange={setUseInfinity} />
          </div>
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-orange-500/30">
              <span className="text-slate-400">‖v‖₁ (L₁):</span>
              <span className="text-orange-400 font-bold tabular-nums">{norms.l1.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
              <span className="text-slate-400">‖v‖₂ (L₂):</span>
              <span className="text-blue-400 font-bold tabular-nums">{norms.l2.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-purple-500/30">
              <span className="text-slate-400">‖v‖∞ (Max):</span>
              <span className="text-purple-300 font-bold tabular-nums">{norms.lInf.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-emerald-500/30">
              <span className="text-slate-400">‖v‖_{useInfinity ? '∞' : pValue.toFixed(1)}:</span>
              <span className="text-emerald-400 font-bold tabular-nums">{norms.lp.toFixed(2)}</span>
            </div>
          </div>
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag vector tip v
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
