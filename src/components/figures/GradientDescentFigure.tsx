'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, Presets, PlayControls } from '@/components/figures/FigureControls';
import { LiveValuesPanel } from '@/components/figures/FigureControls';

// ── The loss curve: a 1-D parabola-like function ──────────────────────────────
function loss(w: number): number {
  // L(w) = (w - 2)^2 + 0.5·sin(3w) + 1  — has a clear global min near w≈2
  return Math.pow(w - 2, 2) + 0.5 * Math.sin(3 * w) + 1;
}

function gradient(w: number): number {
  // dL/dw
  return 2 * (w - 2) + 1.5 * Math.cos(3 * w);
}

const W_RANGE: [number, number] = [-1, 5];
const DEFAULT_W = -0.5;
const DEFAULT_LR = 0.1;

export function GradientDescentFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [w, setW] = useState(DEFAULT_W);
  const [lr, setLr] = useState(DEFAULT_LR);
  const [playing, setPlaying] = useState(false);
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState<{ w: number; l: number }[]>([
    { w: DEFAULT_W, l: loss(DEFAULT_W) },
  ]);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentLoss = loss(w);
  const currentGrad = gradient(w);

  // ── Draw the SVG ──────────────────────────────────────────────────────────
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 600;
    const height = 320;

    svg.attr('height', height);

    const margin = { top: 24, right: 24, bottom: 40, left: 52 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain(W_RANGE).range([0, innerW]);
    const yDomain: [number, number] = [0, 7];
    const yScale = d3.scaleLinear().domain(yDomain).range([innerH, 0]);

    // Build curve points
    const curvePoints = d3.range(W_RANGE[0], W_RANGE[1], 0.02).map((wx) => ({
      x: wx,
      y: loss(wx),
    }));

    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .curve(d3.curveCatmullRom);

    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale).ticks(5).tickSize(-innerW).tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);
    g.select('.grid .domain').remove();

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).ticks(7))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', 11);

    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', 11);

    // Axis labels
    g.append('text')
      .attr('x', innerW / 2)
      .attr('y', innerH + 34)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', 12)
      .text('Weight (w)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2)
      .attr('y', -40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748b')
      .attr('font-size', 12)
      .text('Loss L(w)');

    // Loss curve
    g.append('path')
      .datum(curvePoints)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', lineGen);

    // History trail
    if (history.length > 1) {
      const trailGen = d3
        .line<{ w: number; l: number }>()
        .x((d) => xScale(d.w))
        .y((d) => yScale(d.l))
        .curve(d3.curveLinear);

      g.append('path')
        .datum(history)
        .attr('fill', 'none')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4 2')
        .attr('opacity', 0.6)
        .attr('d', trailGen);
    }

    // Gradient arrow (tangent)
    const tangentLen = 0.6;
    const gx1 = w - tangentLen;
    const gx2 = w + tangentLen;
    const gy1 = currentLoss + currentGrad * tangentLen;
    const gy2 = currentLoss - currentGrad * tangentLen;

    // Clamp y to chart area
    const inRange = (v: number) => v >= yDomain[0] && v <= yDomain[1];
    if (inRange(gy1) && inRange(gy2)) {
      g.append('line')
        .attr('x1', xScale(gx1))
        .attr('y1', yScale(gy1))
        .attr('x2', xScale(gx2))
        .attr('y2', yScale(gy2))
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.7);
    }

    // Ball (current position)
    g.append('circle')
      .attr('cx', xScale(w))
      .attr('cy', yScale(currentLoss))
      .attr('r', 9)
      .attr('fill', '#f97316')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))');

    // Min marker (approximate)
    const minW = 2.0;
    g.append('line')
      .attr('x1', xScale(minW))
      .attr('y1', yScale(0))
      .attr('x2', xScale(minW))
      .attr('y2', yScale(7))
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4 3')
      .attr('opacity', 0.5);

    g.append('text')
      .attr('x', xScale(minW) + 4)
      .attr('y', 14)
      .attr('fill', '#22c55e')
      .attr('font-size', 10)
      .attr('font-weight', 600)
      .text('min');

  }, [w, lr, history, currentLoss, currentGrad]);

  // ── One GD step ───────────────────────────────────────────────────────────
  const step = useCallback(() => {
    setW((prev) => {
      const grad = gradient(prev);
      const next = prev - lr * grad;
      const clamped = Math.max(W_RANGE[0], Math.min(W_RANGE[1], next));
      setHistory((h) => [...h.slice(-60), { w: clamped, l: loss(clamped) }]);
      setSteps((s) => s + 1);
      return clamped;
    });
  }, [lr]);

  // ── Auto-play ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => {
      const grad = gradient(w);
      if (Math.abs(grad) < 0.001) { setPlaying(false); return; }
      step();
    }, 80);
    rafRef.current = id;
    return () => clearTimeout(id);
  }, [playing, w, step]);

  function reset() {
    setPlaying(false);
    setW(DEFAULT_W);
    setLr(DEFAULT_LR);
    setSteps(0);
    setHistory([{ w: DEFAULT_W, l: loss(DEFAULT_W) }]);
  }

  function breakIt() {
    setLr(1.2);
    setW(DEFAULT_W);
    setSteps(0);
    setHistory([{ w: DEFAULT_W, l: loss(DEFAULT_W) }]);
  }

  return (
    <FigureBox
      title="Gradient Descent"
      caption="The orange ball rolls down the loss curve. The red line shows the gradient (slope) at the current point. Set the learning rate and watch it converge — or diverge."
      controls={
        <div className="flex flex-col gap-4 w-full">
          <Slider
            label="Learning Rate (α)"
            value={lr}
            min={0.01}
            max={1.5}
            step={0.01}
            onChange={setLr}
          />
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <PlayControls
              playing={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onStep={step}
              onReset={reset}
            />
            <Presets
              presets={[
                { label: 'α = 0.05 (slow)',  onApply: () => setLr(0.05) },
                { label: 'α = 0.1 (good)',   onApply: () => setLr(0.1) },
                { label: 'α = 0.5 (fast)',   onApply: () => setLr(0.5) },
              ]}
              onReset={reset}
              onBreakIt={breakIt}
            />
          </div>
        </div>
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'w',    value: w.toFixed(4),           color: '#fb923c' },
            { label: 'Loss', value: currentLoss.toFixed(4), color: '#60a5fa' },
            { label: '∇L',   value: currentGrad.toFixed(4), color: '#f87171' },
            { label: 'Steps', value: steps,                 color: '#a5b4fc' },
            { label: 'α',    value: lr.toFixed(2),          color: '#86efac' },
          ]}
        />
      }
    >
      <svg ref={svgRef} className="w-full" />
    </FigureBox>
  );
}
