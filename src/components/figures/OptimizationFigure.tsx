'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { LiveValuesPanel, Presets } from '@/components/figures/FigureControls';

// Two curves: parabola (convex) and bumpy (non-convex)
type CurveKind = 'convex' | 'bumpy';

function convex(x: number) { return Math.pow(x - 2, 2) + 0.5; }
function bumpy(x: number) {
  return 1.2 * Math.sin(2.5 * x) + 0.6 * Math.cos(5 * x) + 0.04 * Math.pow(x - 1, 2) + 2.5;
}

const X_RANGE: [number, number] = [-0.5, 4.5];

export function OptimizationFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [xPos, setXPos] = useState(0.3);
  const [curve, setCurve] = useState<CurveKind>('convex');

  const fn = curve === 'convex' ? convex : bumpy;
  const currentY = fn(xPos);

  // Find approx global min by sampling
  const minX = d3.range(X_RANGE[0], X_RANGE[1], 0.01).reduce(
    (best, x) => (fn(x) < fn(best) ? x : best),
    X_RANGE[0]
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 580;
    const height = 300;
    svg.attr('height', height);

    const margin = { top: 20, right: 20, bottom: 38, left: 48 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const xs = d3.scaleLinear().domain(X_RANGE).range([0, iW]);
    const yVals = d3.range(X_RANGE[0], X_RANGE[1], 0.02).map(fn);
    const yMin = Math.min(...yVals) - 0.3;
    const yMax = Math.max(...yVals) + 0.5;
    const ys = d3.scaleLinear().domain([yMin, yMax]).range([iH, 0]);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid
    g.append('g').call(d3.axisLeft(ys).ticks(4).tickSize(-iW).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f1f5f9');
    g.select('.domain').remove();

    // Axes
    g.append('g').attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(xs).ticks(6))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);
    g.append('g').call(d3.axisLeft(ys).ticks(4))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);

    // Axis labels
    g.append('text').attr('x', iW / 2).attr('y', iH + 32)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Parameter w');
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -iH / 2).attr('y', -36)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Loss L(w)');

    // Curve
    const pts = d3.range(X_RANGE[0], X_RANGE[1], 0.02).map(x => ({ x, y: fn(x) }));
    const line = d3.line<{ x: number; y: number }>()
      .x(d => xs(d.x)).y(d => ys(d.y)).curve(d3.curveCatmullRom);
    g.append('path').datum(pts)
      .attr('fill', 'none').attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5).attr('d', line);

    // Filled area under curve
    const area = d3.area<{ x: number; y: number }>()
      .x(d => xs(d.x)).y0(iH).y1(d => ys(d.y)).curve(d3.curveCatmullRom);
    g.append('path').datum(pts)
      .attr('fill', '#3b82f6').attr('opacity', 0.06).attr('d', area);

    // Global min marker
    g.append('line')
      .attr('x1', xs(minX)).attr('x2', xs(minX))
      .attr('y1', 0).attr('y2', iH)
      .attr('stroke', '#22c55e').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '5 3').attr('opacity', 0.7);
    g.append('text').attr('x', xs(minX) + 4).attr('y', 14)
      .attr('fill', '#22c55e').attr('font-size', 10).attr('font-weight', 600)
      .text('global min');

    // Draggable ball
    const drag = d3.drag<SVGCircleElement, unknown>()
      .on('drag', (event) => {
        const wx = Math.max(X_RANGE[0], Math.min(X_RANGE[1], xs.invert(event.x)));
        setXPos(wx);
      });

    g.append('circle')
      .attr('cx', xs(xPos)).attr('cy', ys(fn(xPos)))
      .attr('r', 10).attr('fill', '#f97316')
      .attr('stroke', 'white').attr('stroke-width', 2.5)
      .style('cursor', 'ew-resize')
      .style('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.18))')
      .call(drag);

    // Vertical drop line from ball to x-axis
    g.append('line')
      .attr('x1', xs(xPos)).attr('x2', xs(xPos))
      .attr('y1', ys(fn(xPos))).attr('y2', iH)
      .attr('stroke', '#f97316').attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 2').attr('opacity', 0.5);

  }, [xPos, curve, fn, minX]);

  return (
    <FigureBox
      title="Loss Landscape"
      caption="Drag the orange dot to explore the loss at different parameter values. The green dashed line marks the global minimum."
      controls={
        <Presets
          presets={[
            { label: 'Convex (parabola)', onApply: () => { setCurve('convex'); setXPos(0.3); } },
            { label: 'Bumpy (local minima)', onApply: () => { setCurve('bumpy'); setXPos(0.3); } },
          ]}
          onReset={() => { setCurve('convex'); setXPos(0.3); }}
        />
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'w',      value: xPos.toFixed(3),      color: '#fb923c' },
            { label: 'Loss',   value: currentY.toFixed(3),  color: '#60a5fa' },
            { label: 'Min w',  value: minX.toFixed(3),      color: '#86efac' },
            { label: 'Min L',  value: fn(minX).toFixed(3),  color: '#86efac' },
            { label: 'Curve',  value: curve,                color: '#c4b5fd' },
          ]}
        />
      }
    >
      <svg ref={svgRef} className="w-full" />
    </FigureBox>
  );
}
