'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, Toggle, Presets, LiveValuesPanel } from '@/components/figures/FigureControls';

export function VectorMatrixFigure() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 580, height: 360 });

  // Vector v (blue) and Vector u (orange)
  const [v, setV] = useState<{ x: number; y: number }>({ x: 3, y: 2 });
  const [u, setU] = useState<{ x: number; y: number }>({ x: 1, y: 3 });
  const [showSum, setShowSum] = useState(true);
  const [scalarC, setScalarC] = useState(1);

  // Scaled v
  const sv = { x: v.x * scalarC, y: v.y * scalarC };
  // Sum = sv + u
  const sum = { x: sv.x + u.x, y: sv.y + u.y };

  const magV = Math.sqrt(v.x * v.x + v.y * v.y);
  const magU = Math.sqrt(u.x * u.x + u.y * u.y);
  const magSum = Math.sqrt(sum.x * sum.x + sum.y * sum.y);

  const DOMAIN: [number, number] = [-6, 6];

  // Observe container size on mobile and desktop
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const w = rect?.width ?? 580;
      // Proportional mobile height
      const h = Math.round(Math.min(360, Math.max(260, w * 0.72)));
      setDimensions({ width: w, height: h });
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;

    const isMobile = width < 480;
    const margin = isMobile
      ? { top: 15, right: 15, bottom: 15, left: 15 }
      : { top: 20, right: 20, bottom: 20, left: 20 };

    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const xs = d3.scaleLinear().domain(DOMAIN).range([0, iW]);
    const ys = d3.scaleLinear().domain(DOMAIN).range([iH, 0]);

    svg.selectAll('*').remove();

    // Defs for arrow markers
    const defs = svg.append('defs');
    const addMarker = (id: string, color: string) => {
      defs.append('marker')
        .attr('id', id)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 8)
        .attr('refY', 5)
        .attr('markerWidth', isMobile ? 5 : 6)
        .attr('markerHeight', isMobile ? 5 : 6)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', 'M 0 1.5 L 8 5 L 0 8.5 z')
        .attr('fill', color);
    };

    addMarker('arrow-v', '#3b82f6');
    addMarker('arrow-u', '#f97316');
    addMarker('arrow-sum', '#22c55e');

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    const ticksCount = isMobile ? 6 : 12;
    g.append('g')
      .call(d3.axisBottom(xs).ticks(ticksCount).tickSize(-iH).tickFormat(() => ''))
      .attr('transform', `translate(0,${iH})`)
      .selectAll('line').attr('stroke', '#f1f5f9');
    g.append('g')
      .call(d3.axisLeft(ys).ticks(ticksCount).tickSize(-iW).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f1f5f9');
    g.selectAll('.domain').remove();

    // Main Axes (x=0, y=0)
    g.append('line')
      .attr('x1', xs(DOMAIN[0])).attr('x2', xs(DOMAIN[1]))
      .attr('y1', ys(0)).attr('y2', ys(0))
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);
    g.append('line')
      .attr('x1', xs(0)).attr('x2', xs(0))
      .attr('y1', ys(DOMAIN[0])).attr('y2', ys(DOMAIN[1]))
      .attr('stroke', '#cbd5e1').attr('stroke-width', 1.5);

    // Axis labels
    g.append('text').attr('x', iW - 4).attr('y', ys(0) - 6)
      .attr('fill', '#94a3b8').attr('font-size', isMobile ? 10 : 11).attr('text-anchor', 'end').text('x₁');
    g.append('text').attr('x', xs(0) + 6).attr('y', 12)
      .attr('fill', '#94a3b8').attr('font-size', isMobile ? 10 : 11).text('x₂');

    // Parallelogram helper dashed lines when showSum is active
    if (showSum) {
      // From tip of sv to tip of sum
      g.append('line')
        .attr('x1', xs(sv.x)).attr('y1', ys(sv.y))
        .attr('x2', xs(sum.x)).attr('y2', ys(sum.y))
        .attr('stroke', '#f97316').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3').attr('opacity', 0.6);

      // From tip of u to tip of sum
      g.append('line')
        .attr('x1', xs(u.x)).attr('y1', ys(u.y))
        .attr('x2', xs(sum.x)).attr('y2', ys(sum.y))
        .attr('stroke', '#3b82f6').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 3').attr('opacity', 0.6);

      // Sum Vector arrow
      g.append('line')
        .attr('x1', xs(0)).attr('y1', ys(0))
        .attr('x2', xs(sum.x)).attr('y2', ys(sum.y))
        .attr('stroke', '#22c55e').attr('stroke-width', isMobile ? 2 : 2.5)
        .attr('marker-end', 'url(#arrow-sum)');

      // Label for Sum
      g.append('text')
        .attr('x', xs(sum.x) + 8).attr('y', ys(sum.y) - 6)
        .attr('fill', '#22c55e').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
        .text('v + u');
    }

    // Vector u (orange)
    g.append('line')
      .attr('x1', xs(0)).attr('y1', ys(0))
      .attr('x2', xs(u.x)).attr('y2', ys(u.y))
      .attr('stroke', '#f97316').attr('stroke-width', isMobile ? 2 : 2.5)
      .attr('marker-end', 'url(#arrow-u)');

    g.append('text')
      .attr('x', xs(u.x) + 8).attr('y', ys(u.y) - 6)
      .attr('fill', '#f97316').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
      .text('u');

    // Vector sv (blue, scaled)
    g.append('line')
      .attr('x1', xs(0)).attr('y1', ys(0))
      .attr('x2', xs(sv.x)).attr('y2', ys(sv.y))
      .attr('stroke', '#3b82f6').attr('stroke-width', isMobile ? 2 : 2.5)
      .attr('marker-end', 'url(#arrow-v)');

    const vLabel = scalarC === 1 ? 'v' : `${scalarC.toFixed(1)}v`;
    g.append('text')
      .attr('x', xs(sv.x) + 8).attr('y', ys(sv.y) - 6)
      .attr('fill', '#3b82f6').attr('font-weight', 700).attr('font-size', isMobile ? 11 : 12)
      .text(vLabel);

    // Draggable handle for v
    const dragV = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const roundedX = Math.round(Math.max(DOMAIN[0] + 0.5, Math.min(DOMAIN[1] - 0.5, rawX)) * 2) / 2;
        const roundedY = Math.round(Math.max(DOMAIN[0] + 0.5, Math.min(DOMAIN[1] - 0.5, rawY)) * 2) / 2;
        setV({ x: roundedX, y: roundedY });
      });

    const vHandleGroup = g.append('g')
      .attr('transform', `translate(${xs(v.x)},${ys(v.y)})`)
      .style('cursor', 'grab')
      .call(dragV);

    // Large invisible touch-target area for fingers (radius 24px)
    vHandleGroup.append('circle')
      .attr('r', 24)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    // Visible circle
    vHandleGroup.append('circle')
      .attr('r', isMobile ? 9 : 8)
      .attr('fill', '#3b82f6')
      .attr('stroke', 'white')
      .attr('stroke-width', 2.5);

    // Draggable handle for u
    const dragU = d3.drag<SVGGElement, unknown>()
      .on('drag', (event) => {
        const rawX = xs.invert(event.x);
        const rawY = ys.invert(event.y);
        const roundedX = Math.round(Math.max(DOMAIN[0] + 0.5, Math.min(DOMAIN[1] - 0.5, rawX)) * 2) / 2;
        const roundedY = Math.round(Math.max(DOMAIN[0] + 0.5, Math.min(DOMAIN[1] - 0.5, rawY)) * 2) / 2;
        setU({ x: roundedX, y: roundedY });
      });

    const uHandleGroup = g.append('g')
      .attr('transform', `translate(${xs(u.x)},${ys(u.y)})`)
      .style('cursor', 'grab')
      .call(dragU);

    // Large invisible touch-target area for fingers (radius 24px)
    uHandleGroup.append('circle')
      .attr('r', 24)
      .attr('fill', 'transparent')
      .style('touch-action', 'none');

    // Visible circle
    uHandleGroup.append('circle')
      .attr('r', isMobile ? 9 : 8)
      .attr('fill', '#f97316')
      .attr('stroke', 'white')
      .attr('stroke-width', 2.5);

  }, [v, u, sv, sum, showSum, scalarC, dimensions]);

  return (
    <FigureBox
      title="Interactive 2D Vectors & Vector Addition"
      caption="Drag the blue dot (v) or orange dot (u). Adjust the scalar slider to stretch/flip v, and observe how the green sum (v + u) tracks the parallelogram rule."
      controls={
        <div className="flex flex-col gap-3.5 w-full">
          {/* Main Controls row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
            <Slider
              label="Scale v (c · v)"
              value={scalarC}
              min={-2}
              max={2}
              step={0.1}
              onChange={setScalarC}
            />
            <div className="flex-shrink-0">
              <Toggle
                label={showSum ? 'Showing Sum (v + u)' : 'Sum hidden'}
                value={showSum}
                onChange={setShowSum}
              />
            </div>
          </div>

          {/* Mobile Quick Nudge Steppers */}
          <div className="sm:hidden flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 text-xs">
            <span className="font-semibold text-slate-500 text-[11px]">Nudge vectors:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-600 font-mono text-[11px]">v:</span>
              <button
                onClick={() => setV((prev) => ({ ...prev, x: Math.max(DOMAIN[0] + 1, prev.x - 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ←
              </button>
              <button
                onClick={() => setV((prev) => ({ ...prev, x: Math.min(DOMAIN[1] - 1, prev.x + 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                →
              </button>
              <button
                onClick={() => setV((prev) => ({ ...prev, y: Math.min(DOMAIN[1] - 1, prev.y + 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ↑
              </button>
              <button
                onClick={() => setV((prev) => ({ ...prev, y: Math.max(DOMAIN[0] + 1, prev.y - 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ↓
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-bold text-orange-600 font-mono text-[11px]">u:</span>
              <button
                onClick={() => setU((prev) => ({ ...prev, x: Math.max(DOMAIN[0] + 1, prev.x - 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ←
              </button>
              <button
                onClick={() => setU((prev) => ({ ...prev, x: Math.min(DOMAIN[1] - 1, prev.x + 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                →
              </button>
              <button
                onClick={() => setU((prev) => ({ ...prev, y: Math.min(DOMAIN[1] - 1, prev.y + 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ↑
              </button>
              <button
                onClick={() => setU((prev) => ({ ...prev, y: Math.max(DOMAIN[0] + 1, prev.y - 0.5) }))}
                className="w-6 h-6 rounded-md bg-slate-100 font-bold hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs"
              >
                ↓
              </button>
            </div>
          </div>

          {/* Presets */}
          <Presets
            presets={[
              { label: 'Standard Basis (i, j)', onApply: () => { setV({ x: 1, y: 0 }); setU({ x: 0, y: 1 }); setScalarC(1); } },
              { label: 'Orthogonal (90°)', onApply: () => { setV({ x: 3, y: 1 }); setU({ x: -1, y: 3 }); setScalarC(1); } },
              { label: 'Collinear (Parallel)', onApply: () => { setV({ x: 2, y: 1 }); setU({ x: 4, y: 2 }); setScalarC(1); } },
              { label: 'Opposite Directions', onApply: () => { setV({ x: 3, y: 2 }); setU({ x: -3, y: -2 }); setScalarC(1); } },
            ]}
            onReset={() => { setV({ x: 3, y: 2 }); setU({ x: 1, y: 3 }); setScalarC(1); setShowSum(true); }}
          />
        </div>
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'v',        value: `[${v.x.toFixed(1)}, ${v.y.toFixed(1)}]ᵀ`,   color: '#60a5fa' },
            { label: '‖v‖',      value: magV.toFixed(2),                             color: '#60a5fa' },
            { label: 'u',        value: `[${u.x.toFixed(1)}, ${u.y.toFixed(1)}]ᵀ`,   color: '#fb923c' },
            { label: '‖u‖',      value: magU.toFixed(2),                             color: '#fb923c' },
            { label: 'v + u',    value: `[${sum.x.toFixed(1)}, ${sum.y.toFixed(1)}]ᵀ`, color: '#86efac' },
            { label: '‖v + u‖',  value: magSum.toFixed(2),                           color: '#86efac' },
          ]}
        />
      }
    >
      <div ref={containerRef} className="relative w-full select-none touch-none">
        {/* Touch instruction badge for mobile */}
        <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur text-[10px] text-slate-200 font-medium">
          👆 Drag dot tips
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
