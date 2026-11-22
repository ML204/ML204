'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, LiveValuesPanel, Presets } from '@/components/figures/FigureControls';

function loss(w: number) {
  return Math.pow(w - 2, 2) + 0.5 * Math.sin(3 * w) + 1;
}
function gradient(w: number) {
  return 2 * (w - 2) + 1.5 * Math.cos(3 * w);
}

const W_START = -0.5;
const W_RANGE: [number, number] = [-1, 5];
const STEPS = 60;

function runGD(alpha: number, start = W_START): { w: number; l: number }[] {
  const path = [{ w: start, l: loss(start) }];
  let w = start;
  for (let i = 0; i < STEPS; i++) {
    w = w - alpha * gradient(w);
    w = Math.max(W_RANGE[0], Math.min(W_RANGE[1], w));
    path.push({ w, l: loss(w) });
    if (Math.abs(gradient(w)) < 0.0005) break;
  }
  return path;
}

export function LearningRateFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [alphaGood, setAlphaGood] = useState(0.1);

  const alphaSmall = alphaGood / 10;
  const alphaLarge = alphaGood * 8;

  const configs = useMemo(() => {
    const pathSlow = runGD(alphaSmall);
    const pathGood = runGD(alphaGood);
    const pathFast = runGD(Math.min(alphaLarge, 1.5));

    return [
      { label: `α = ${alphaSmall.toFixed(3)} (too slow)`, path: pathSlow, color: '#94a3b8' },
      { label: `α = ${alphaGood.toFixed(2)} (good)`,      path: pathGood, color: '#22c55e' },
      { label: `α = ${Math.min(alphaLarge, 1.5).toFixed(2)} (too fast)`, path: pathFast, color: '#ef4444' },
    ];
  }, [alphaSmall, alphaGood, alphaLarge]);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 580;
    const height = 300;
    svg.attr('height', height);

    const margin = { top: 24, right: 100, bottom: 38, left: 52 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const maxSteps = Math.max(...configs.map(c => c.path.length));
    const xs = d3.scaleLinear().domain([0, maxSteps]).range([0, iW]);
    const ys = d3.scaleLinear().domain([0, 10]).range([iH, 0]);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid
    g.append('g').call(d3.axisLeft(ys).ticks(5).tickSize(-iW).tickFormat(() => ''))
      .selectAll('line').attr('stroke', '#f1f5f9');
    g.select('.domain').remove();

    // Axes
    g.append('g').attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(xs).ticks(8))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);
    g.append('g').call(d3.axisLeft(ys).ticks(5))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);

    g.append('text').attr('x', iW / 2).attr('y', iH + 32)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Steps');
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -iH / 2).attr('y', -40)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', 12)
      .text('Loss');

    // Loss curves
    const lineGen = d3.line<{ w: number; l: number }>()
      .x((_, i) => xs(i)).y(d => ys(Math.min(d.l, 10))).curve(d3.curveMonotoneX);

    configs.forEach(({ path, color, label }) => {
      g.append('path').datum(path)
        .attr('fill', 'none').attr('stroke', color)
        .attr('stroke-width', 2).attr('d', lineGen);

      // End label
      const last = path[path.length - 1];
      const labelY = Math.min(last.l, 9.5);
      g.append('text')
        .attr('x', xs(path.length - 1) + 6)
        .attr('y', ys(labelY))
        .attr('fill', color).attr('font-size', 9.5).attr('font-weight', 600)
        .text(label);
    });

    // Optimal loss line
    const minLoss = 0.95; // approx
    g.append('line')
      .attr('x1', 0).attr('x2', iW)
      .attr('y1', ys(minLoss)).attr('y2', ys(minLoss))
      .attr('stroke', '#22c55e').attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3').attr('opacity', 0.4);

  }, [alphaGood, configs]);

  const finalLosses = configs.map(c => c.path[c.path.length - 1].l);

  return (
    <FigureBox
      title="Learning Rate Comparison — Loss vs Steps"
      caption="Three gradient descent runs with different learning rates. Gray = too slow, green = just right, red = too fast (may diverge)."
      controls={
        <div className="flex flex-col gap-3 w-full">
          <Slider
            label="Good learning rate (α)"
            value={alphaGood}
            min={0.01}
            max={0.4}
            step={0.005}
            onChange={setAlphaGood}
          />
          <Presets
            presets={[
              { label: 'Goldilocks (α=0.1)', onApply: () => setAlphaGood(0.1) },
              { label: 'Diverge (large α)',  onApply: () => setAlphaGood(0.35) },
            ]}
            onReset={() => setAlphaGood(0.1)}
          />
        </div>
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'α (slow)',  value: alphaSmall.toFixed(3), color: '#94a3b8' },
            { label: 'α (good)',  value: alphaGood.toFixed(3),  color: '#86efac' },
            { label: 'α (fast)',  value: Math.min(alphaLarge, 1.5).toFixed(3), color: '#fca5a5' },
            { label: 'Final Loss (slow)', value: finalLosses[0].toFixed(3), color: '#94a3b8' },
            { label: 'Final Loss (good)', value: finalLosses[1].toFixed(3), color: '#86efac' },
          ]}
        />
      }
    >
      <svg ref={svgRef} className="w-full" />
    </FigureBox>
  );
}
