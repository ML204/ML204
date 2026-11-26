'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { PlayControls, Slider } from '@/components/figures/FigureControls';
import { Matrix2x2Input } from '@/components/figures/Matrix2x2Input';
import {
  createIsotropicPlane,
  drawCartesianGrid,
  drawTransformedGrid,
  drawVectorArrow,
  drawVectorLabel,
  useFigureDimensions,
} from '@/components/figures/linearAlgebraCanvas';
import {
  IDENTITY_MAT2,
  lerpMat2,
  matMul2,
  matVec2,
  svd2x2,
  svdSmallMatrix,
  type Mat2,
} from '@/components/figures/linearAlgebraMath';

type SVDTab = 'geometry' | 'compression';

const DEFAULT_MAT: Mat2 = [
  [1.8, 1.0],
  [0.2, 1.4],
];

// Three crisp 8x8 grayscale patterns for rank-k SVD reconstruction
const IMAGE_PATTERNS: Record<string, { label: string; grid: number[][] }> = {
  letterA: {
    label: 'Letter A',
    grid: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
    ],
  },
  smiley: {
    label: 'Smiley',
    grid: [
      [0.2, 0.2, 0.8, 0.8, 0.8, 0.8, 0.2, 0.2],
      [0.2, 0.8, 0.2, 0.2, 0.2, 0.2, 0.8, 0.2],
      [0.8, 0.2, 1.0, 0.2, 0.2, 1.0, 0.2, 0.8],
      [0.8, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.8],
      [0.8, 0.2, 0.9, 0.2, 0.2, 0.9, 0.2, 0.8],
      [0.8, 0.2, 0.2, 0.9, 0.9, 0.2, 0.2, 0.8],
      [0.2, 0.8, 0.2, 0.2, 0.2, 0.2, 0.8, 0.2],
      [0.2, 0.2, 0.8, 0.8, 0.8, 0.8, 0.2, 0.2],
    ],
  },
  checker: {
    label: 'Diagonal Cross',
    grid: [
      [1.0, 0.8, 0.2, 0.0, 0.0, 0.2, 0.8, 1.0],
      [0.8, 1.0, 0.8, 0.2, 0.2, 0.8, 1.0, 0.8],
      [0.2, 0.8, 1.0, 0.8, 0.8, 1.0, 0.8, 0.2],
      [0.0, 0.2, 0.8, 1.0, 1.0, 0.8, 0.2, 0.0],
      [0.0, 0.2, 0.8, 1.0, 1.0, 0.8, 0.2, 0.0],
      [0.2, 0.8, 1.0, 0.8, 0.8, 1.0, 0.8, 0.2],
      [0.8, 1.0, 0.8, 0.2, 0.2, 0.8, 1.0, 0.8],
      [1.0, 0.8, 0.2, 0.0, 0.0, 0.2, 0.8, 1.0],
    ],
  },
};

/**
 * Interactive SVD Visualizer with 3-step animated geometric breakdown (V^T -> Sigma -> U)
 * and real-time 8x8 rank-k matrix compression.
 */
export function SVDFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dimensions = useFigureDimensions(containerRef, { mobileHeight: 320, maxHeight: 390 });

  const [tab, setTab] = useState<SVDTab>('geometry');
  const [mat, setMat] = useState<Mat2>(DEFAULT_MAT);
  const [stageT, setStageT] = useState<number>(3); // 0..3 across Start -> V^T -> Sigma -> U
  const [playing, setPlaying] = useState<boolean>(false);
  const stageTRef = useRef(3);
  stageTRef.current = stageT;

  const [patternKey, setPatternKey] = useState<keyof typeof IMAGE_PATTERNS>('letterA');
  const [rankK, setRankK] = useState<number>(2);

  const svd2 = useMemo(() => svd2x2(mat), [mat]);

  // Smooth stage playback animation from current stageT toward 3.0 (wraps from 0 if already near 3)
  useEffect(() => {
    if (!playing || tab !== 'geometry') return;
    let rafId = 0;
    const startVal = stageTRef.current >= 2.98 ? 0 : stageTRef.current;
    const startTime = performance.now();
    const duration = Math.max(400, ((3 - startVal) / 3) * 3600);

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      setStageT(startVal + (3 - startVal) * progress);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [playing, tab]);

  // Active cumulative matrix at fractional stage t in [0, 3]
  const currentTransform = useMemo<Mat2>(() => {
    const Sigma: Mat2 = [
      [svd2.sigma[0], 0],
      [0, svd2.sigma[1]],
    ];
    const step1 = svd2.Vt;
    const step2 = matMul2(Sigma, step1);
    const step3 = matMul2(svd2.U, step2);

    if (stageT <= 1) return lerpMat2(IDENTITY_MAT2, step1, stageT);
    if (stageT <= 2) return lerpMat2(step1, step2, stageT - 1);
    return lerpMat2(step2, step3, Math.min(1, stageT - 2));
  }, [svd2, stageT]);

  // 8x8 Low-Rank Compression Computation
  const compression = useMemo(() => {
    const orig = IMAGE_PATTERNS[patternKey].grid;
    const { U, S, V } = svdSmallMatrix(orig);
    const m = orig.length;
    const n = orig[0].length;

    const approx: number[][] = Array.from({ length: m }, () => Array(n).fill(0));
    let totalEnergy = 0;
    let capturedEnergy = 0;
    for (let k = 0; k < S.length; k++) {
      totalEnergy += S[k] * S[k];
      if (k < rankK) capturedEnergy += S[k] * S[k];
    }

    for (let k = 0; k < Math.min(rankK, S.length); k++) {
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          approx[i][j] += S[k] * U[i][k] * V[j][k];
        }
      }
    }

    let sqErr = 0;
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        const diff = orig[i][j] - approx[i][j];
        sqErr += diff * diff;
      }
    }

    const energyPct = totalEnergy > 1e-8 ? (capturedEnergy / totalEnergy) * 100 : 100;
    return {
      orig,
      approx,
      S,
      energyPct,
      rmse: Math.sqrt(sqErr / (m * n)),
      storedNums: rankK * (m + n + 1),
    };
  }, [patternKey, rankK]);

  // Render SVG Canvas
  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;

    if (tab === 'geometry') {
      const plane = createIsotropicPlane(svgRef.current, width, height, 3.8, 'svd-clip');
      drawCartesianGrid(plane, { ticks: [-3, -2, -1, 1, 2, 3] });
      const { g, clippedG, xs, ys, isMobile } = plane;

      drawTransformedGrid(plane, currentTransform, { range: 5, opacity: 0.45 });

      // Reference unit circle + morphed circle -> ellipse under currentTransform
      const unitPts: [number, number][] = [];
      const warpedPts: [number, number][] = [];
      for (let i = 0; i <= 96; i++) {
        const th = (2 * Math.PI * i) / 96;
        const p = { x: Math.cos(th), y: Math.sin(th) };
        const wp = matVec2(currentTransform, p);
        unitPts.push([p.x, p.y]);
        warpedPts.push([wp.x, wp.y]);
      }

      const lineGen = d3
        .line<[number, number]>()
        .x((d) => xs(d[0]))
        .y((d) => ys(d[1]));

      clippedG
        .append('path')
        .datum(unitPts)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', '#94a3b8')
        .attr('stroke-width', 1.4)
        .attr('stroke-dasharray', '4 3');

      clippedG
        .append('path')
        .datum(warpedPts)
        .attr('d', lineGen)
        .attr('fill', '#6366f1')
        .attr('fill-opacity', 0.14)
        .attr('stroke', '#4f46e5')
        .attr('stroke-width', 2.2);

      // Track the right singular basis vectors v1 & v2 as they travel through V^T -> Sigma -> U
      const tv1 = matVec2(currentTransform, svd2.v1);
      const tv2 = matVec2(currentTransform, svd2.v2);

      drawVectorArrow(g, xs(0), ys(0), xs(tv1.x), ys(tv1.y), '#2563eb', {
        strokeWidth: 3,
        isMobile,
      });
      drawVectorLabel(
        g,
        xs(tv1.x) + 8,
        ys(tv1.y) - 6,
        stageT < 0.5 ? 'v₁' : stageT < 1.5 ? 'Vᵀv₁ = î' : stageT < 2.5 ? 'σ₁î' : 'σ₁u₁',
        '#1d4ed8',
        { isMobile }
      );

      drawVectorArrow(g, xs(0), ys(0), xs(tv2.x), ys(tv2.y), '#f97316', {
        strokeWidth: 3,
        isMobile,
      });
      drawVectorLabel(
        g,
        xs(tv2.x) + 8,
        ys(tv2.y) + 12,
        stageT < 0.5 ? 'v₂' : stageT < 1.5 ? 'Vᵀv₂ = ĵ' : stageT < 2.5 ? 'σ₂ĵ' : 'σ₂u₂',
        '#ea580c',
        { isMobile }
      );
    } else {
      // Tab 2: Render Original 8x8 Heatmap + Rank-k Reconstruction + Singular Value Bar Chart
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      const isMobile = width < 520;
      const g = svg.append('g');

      const gridSize = isMobile
        ? Math.min(125, (width - 48) / 2)
        : Math.min(170, (width - 210) / 2);
      const cellPx = gridSize / 8;
      const topY = isMobile ? 28 : Math.max(30, (height - gridSize) / 2);

      const leftX = isMobile ? (width - gridSize * 2 - 20) / 2 : 24;
      const midX = leftX + gridSize + (isMobile ? 20 : 28);

      const drawMatrixGrid = (
        grid: number[][],
        ox: number,
        oy: number,
        caption: string,
        borderCol: string
      ) => {
        g.append('text')
          .attr('x', ox + gridSize / 2)
          .attr('y', oy - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', 11)
          .attr('font-weight', 700)
          .attr('fill', '#334155')
          .text(caption);

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const val = Math.max(0, Math.min(1, grid[r][c]));
            const shade = Math.round(255 * (1 - val));
            g.append('rect')
              .attr('x', ox + c * cellPx)
              .attr('y', oy + r * cellPx)
              .attr('width', cellPx - 0.5)
              .attr('height', cellPx - 0.5)
              .attr('fill', `rgb(${shade},${shade},${shade})`);
          }
        }
        g.append('rect')
          .attr('x', ox)
          .attr('y', oy)
          .attr('width', gridSize)
          .attr('height', gridSize)
          .attr('fill', 'none')
          .attr('stroke', borderCol)
          .attr('stroke-width', 2);
      };

      drawMatrixGrid(compression.orig, leftX, topY, 'Original 8×8 (64 nums)', '#64748b');
      drawMatrixGrid(
        compression.approx,
        midX,
        topY,
        `Rank-${rankK} Approx (${compression.energyPct.toFixed(0)}%)`,
        '#4f46e5'
      );

      // Singular values spectrum bar chart on desktop right or mobile bottom
      const chartX = isMobile ? 24 : midX + gridSize + 28;
      const chartY = isMobile ? topY + gridSize + 24 : topY + 12;
      const chartW = isMobile ? width - 48 : Math.max(80, width - chartX - 18);
      const chartH = isMobile ? Math.max(60, height - chartY - 24) : gridSize - 24;

      if (chartW > 40 && chartH > 30) {
        const maxS = Math.max(1, compression.S[0]);
        const bw = chartW / 8;
        g.append('text')
          .attr('x', chartX + chartW / 2)
          .attr('y', chartY - 8)
          .attr('text-anchor', 'middle')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('fill', '#475569')
          .text('Singular Values σ₁…σ₈');

        compression.S.forEach((sVal, idx) => {
          const barH = (sVal / maxS) * chartH;
          const active = idx < rankK;
          g.append('rect')
            .attr('x', chartX + idx * bw + 2)
            .attr('y', chartY + chartH - barH)
            .attr('width', Math.max(4, bw - 4))
            .attr('height', barH)
            .attr('rx', 2)
            .attr('fill', active ? '#4f46e5' : '#cbd5e1');

          g.append('text')
            .attr('x', chartX + idx * bw + bw / 2)
            .attr('y', chartY + chartH + 12)
            .attr('text-anchor', 'middle')
            .attr('font-size', 9)
            .attr('fill', active ? '#4338ca' : '#94a3b8')
            .text(`σ${idx + 1}`);
        });
      }
    }
  }, [tab, currentTransform, svd2, stageT, compression, rankK, dimensions]);

  const stageName =
    stageT < 0.25
      ? 'Stage 0: Original Unit Circle (v₁ ⊥ v₂)'
      : stageT < 1.25
      ? 'Stage 1: Vᵀ Aligns Axes with Grid'
      : stageT < 2.25
      ? 'Stage 2: Σ Stretches Axes by σ₁, σ₂'
      : 'Stage 3: U Rotates into Final Ellipse (A = UΣVᵀ)';

  return (
    <FigureBox
      title="Interactive Singular Value Decomposition (SVD): Rotate → Stretch → Rotate"
      caption={
        tab === 'geometry'
          ? 'Play or scrub the 3 steps of A = UΣVᵀ. Notice how two perpendicular vectors v₁ (blue) and v₂ (orange) stay strictly perpendicular at every stage!'
          : 'Reduce an 8×8 matrix to Rank k using only the largest k singular values. Notice how k=2 or k=3 already captures almost all visual structure!'
      }
      controls={
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                onClick={() => setTab('geometry')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'geometry' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                🔄 3-Step Geometry (UΣVᵀ)
              </button>
              <button
                onClick={() => setTab('compression')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  tab === 'compression' ? 'bg-white text-brand-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                🗜️ Rank-k Image Compression
              </button>
            </div>

            {tab === 'geometry' && (
              <PlayControls
                playing={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onStep={() => {
                  setPlaying(false);
                  const next = Math.min(3, Math.floor(stageT + 0.01) + 1);
                  setStageT(next);
                }}
                onReset={() => {
                  setPlaying(false);
                  setMat(DEFAULT_MAT);
                  setStageT(3);
                }}
              />
            )}
          </div>

          {tab === 'geometry' ? (
            <>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="control-label text-[10px] mr-1">Stages:</span>
                {[
                  { label: '0: Input (I)', t: 0 },
                  { label: '1: Rotate Vᵀ', t: 1 },
                  { label: '2: Stretch Σ', t: 2 },
                  { label: '3: Rotate U (=A)', t: 3 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => {
                      setPlaying(false);
                      setStageT(s.t);
                    }}
                    className={`preset-btn text-[11px] px-2.5 py-1 ${
                      Math.abs(stageT - s.t) < 0.15 ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold' : ''
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200">
                <Slider
                  label={stageName}
                  value={stageT}
                  min={0}
                  max={3}
                  step={0.02}
                  onChange={(v) => {
                    setPlaying(false);
                    setStageT(v);
                  }}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white/80 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.entries(IMAGE_PATTERNS).map(([key, pat]) => (
                  <button
                    key={key}
                    onClick={() => setPatternKey(key as keyof typeof IMAGE_PATTERNS)}
                    className={`preset-btn text-[11px] px-2.5 py-1 ${
                      patternKey === key ? 'bg-brand-50 border-brand-400 text-brand-700 font-semibold' : ''
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
              <Slider
                label="Rank k Cutoff"
                value={rankK}
                min={1}
                max={8}
                step={1}
                formatValue={(v) => `k = ${v.toFixed(0)}`}
                onChange={(v) => setRankK(Math.round(v))}
              />
            </div>
          )}
        </div>
      }
      liveValues={
        <div className="bg-slate-900 border-t border-slate-800 px-3 py-2.5 rounded-b-xl text-xs font-mono select-none">
          {tab === 'geometry' ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Matrix2x2Input
                label="A"
                matrix={mat}
                min={-2.5}
                max={2.5}
                accent="purple"
                onChange={setMat}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1">
                <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-blue-500/30">
                  <span className="text-slate-400">σ₁ (Major):</span>
                  <span className="text-blue-400 font-bold tabular-nums">{svd2.sigma[0].toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-orange-500/30">
                  <span className="text-slate-400">σ₂ (Minor):</span>
                  <span className="text-orange-400 font-bold tabular-nums">{svd2.sigma[1].toFixed(2)}</span>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                  <span className="text-slate-400">Rank:</span>
                  <span className="text-emerald-400 font-bold">
                    {svd2.sigma[0] < 1e-4 ? 0 : svd2.sigma[1] < 1e-4 ? 1 : 2}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Energy:</span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {compression.energyPct.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">RMSE:</span>
                <span className="text-amber-300 font-bold tabular-nums">
                  {compression.rmse.toFixed(3)}
                </span>
              </div>
              <div className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Stored:</span>
                <span className="text-purple-300 font-bold tabular-nums">
                  {compression.storedNums} / 64 nums
                </span>
              </div>
            </div>
          )}
        </div>
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
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
