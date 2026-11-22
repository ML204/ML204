'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { LiveValuesPanel, Toggle, Presets } from '@/components/figures/FigureControls';

type Point = { id: number; y: number };

function mse(points: Point[], pred: number) {
  return points.reduce((s, p) => s + Math.pow(p.y - pred, 2), 0) / points.length;
}
function mae(points: Point[], pred: number) {
  return points.reduce((s, p) => s + Math.abs(p.y - pred), 0) / points.length;
}
function meanY(points: Point[]) {
  return points.reduce((s, p) => s + p.y, 0) / points.length;
}

const DEFAULT_POINTS: Point[] = [
  { id: 1, y: 2.5 }, { id: 2, y: 3.8 }, { id: 3, y: 5.2 },
  { id: 4, y: 4.1 }, { id: 5, y: 3.3 },
];
const OUTLIER: Point = { id: 99, y: 9.5 };

export function LossFunctionsFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [points, setPoints] = useState<Point[]>(DEFAULT_POINTS);
  const [showMSE, setShowMSE] = useState(true);
  const [hasOutlier, setHasOutlier] = useState(false);

  const pred = meanY(points); // prediction = mean (optimal for MSE)
  const mseLoss = mse(points, pred);
  const maeLoss = mae(points, pred);

  const toggleOutlier = useCallback(() => {
    setHasOutlier(prev => {
      const next = !prev;
      setPoints(pts =>
        next
          ? pts.some(p => p.id === OUTLIER.id) ? pts : [...pts, OUTLIER]
          : pts.filter(p => p.id !== OUTLIER.id)
      );
      return next;
    });
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 560;
    const height = 280;
    svg.attr('height', height);

    const margin = { top: 20, right: 20, bottom: 38, left: 48 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const xs = d3.scaleLinear().domain([0, points.length + 1]).range([0, iW]);
    const ys = d3.scaleLinear().domain([0, 11]).range([iH, 0]);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid
    g.append('g').call(d3.axisLeft(ys).ticks(5).tickSize(-iW).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f1f5f9');
    g.select('.domain').remove();

    // Axes
    g.append('g').attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(xs).ticks(points.length).tickFormat(d => `x${d}`))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);
    g.append('g').call(d3.axisLeft(ys).ticks(5))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);

    g.append('text').attr('x', iW / 2).attr('y', iH + 32)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Example index');
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -iH / 2).attr('y', -36)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Value');

    // Prediction line (mean)
    g.append('line')
      .attr('x1', 0).attr('x2', iW)
      .attr('y1', ys(pred)).attr('y2', ys(pred))
      .attr('stroke', '#f97316').attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 3');

    g.append('text').attr('x', iW - 4).attr('y', ys(pred) - 6)
      .attr('text-anchor', 'end').attr('fill', '#f97316')
      .attr('font-size', 10).attr('font-weight', 600).text('prediction (mean)');

    // Error bars + draggable points
    points.forEach((pt, i) => {
      const cx = xs(i + 1);
      const isOutlier = pt.id === OUTLIER.id;

      // Error bar
      const barColor = showMSE ? '#3b82f6' : '#a855f7';
      g.append('line')
        .attr('x1', cx).attr('x2', cx)
        .attr('y1', ys(pred)).attr('y2', ys(pt.y))
        .attr('stroke', barColor).attr('stroke-width', isOutlier ? 3 : 2)
        .attr('opacity', 0.5);

      // Error label
      const err = Math.abs(pt.y - pred);
      const label = showMSE ? `e²=${(err * err).toFixed(1)}` : `|e|=${err.toFixed(1)}`;
      g.append('text')
        .attr('x', cx + 5).attr('y', ys((pt.y + pred) / 2))
        .attr('fill', barColor).attr('font-size', 9).attr('opacity', 0.8)
        .text(label);

      // Draggable point
      const drag = d3.drag<SVGCircleElement, unknown>()
        .on('drag', (event) => {
          const newY = Math.max(0.1, Math.min(10.5, ys.invert(event.y)));
          setPoints(prev => prev.map(p => p.id === pt.id ? { ...p, y: newY } : p));
        });

      g.append('circle')
        .attr('cx', cx).attr('cy', ys(pt.y)).attr('r', isOutlier ? 10 : 8)
        .attr('fill', isOutlier ? '#ef4444' : '#3b82f6')
        .attr('stroke', 'white').attr('stroke-width', 2)
        .style('cursor', 'ns-resize')
        .style('filter', 'drop-shadow(0 1px 4px rgba(0,0,0,0.15))')
        .call(drag);
    });

  }, [points, pred, showMSE]);

  return (
    <FigureBox
      title="Loss Functions — MSE vs MAE"
      caption="Drag any point up or down to change its value. Add an outlier to see how MSE and MAE respond differently."
      controls={
        <div className="flex flex-wrap gap-4 items-center">
          <Toggle
            label={showMSE ? 'Showing: MSE' : 'Showing: MAE'}
            value={showMSE}
            onChange={setShowMSE}
          />
          <Presets
            presets={[
              { label: hasOutlier ? 'Remove outlier' : 'Add outlier', onApply: toggleOutlier },
            ]}
            onReset={() => { setPoints(DEFAULT_POINTS); setHasOutlier(false); setShowMSE(true); }}
          />
        </div>
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'Prediction', value: pred.toFixed(2),    color: '#fb923c' },
            { label: 'MSE',        value: mseLoss.toFixed(3), color: '#60a5fa' },
            { label: 'MAE',        value: maeLoss.toFixed(3), color: '#c084fc' },
            { label: 'Points',     value: points.length,      color: '#a5b4fc' },
          ]}
        />
      }
    >
      <svg ref={svgRef} className="w-full" />
    </FigureBox>
  );
}
