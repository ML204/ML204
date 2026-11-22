'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FigureBox } from '@/components/figures/FigureBox';
import { Slider, LiveValuesPanel, Presets, PlayControls } from '@/components/figures/FigureControls';

// 2D loss surface: bowl + ridge to make paths interesting
function loss2d(x: number, y: number) {
  return 0.4 * Math.pow(x - 3, 2) + 1.2 * Math.pow(y - 2, 2)
    + 0.3 * Math.sin(2 * x) * Math.cos(2 * y);
}
function gradX(x: number, y: number) {
  return 0.8 * (x - 3) + 0.6 * Math.cos(2 * x) * Math.cos(2 * y);
}
function gradY(x: number, y: number) {
  return 2.4 * (y - 2) - 0.6 * Math.sin(2 * x) * Math.sin(2 * y);
}

const START: [number, number] = [0.3, 4.5];
const DOMAIN: [[number, number], [number, number]] = [[0, 6], [0, 5]];
const ALPHA = 0.08;

type Path = { x: number; y: number }[];

function batchStep(pos: [number, number]): [number, number] {
  return [
    Math.max(DOMAIN[0][0], Math.min(DOMAIN[0][1], pos[0] - ALPHA * gradX(pos[0], pos[1]))),
    Math.max(DOMAIN[1][0], Math.min(DOMAIN[1][1], pos[1] - ALPHA * gradY(pos[0], pos[1]))),
  ];
}

function sgdStep(pos: [number, number], batchSize: number): [number, number] {
  // Simulate noise proportional to 1/sqrt(batchSize)
  const noise = 1.2 / Math.sqrt(batchSize);
  const nx = gradX(pos[0], pos[1]) + (Math.random() - 0.5) * noise * 2;
  const ny = gradY(pos[0], pos[1]) + (Math.random() - 0.5) * noise * 2;
  return [
    Math.max(DOMAIN[0][0], Math.min(DOMAIN[0][1], pos[0] - ALPHA * nx)),
    Math.max(DOMAIN[1][0], Math.min(DOMAIN[1][1], pos[1] - ALPHA * ny)),
  ];
}

export function SGDBatchFigure() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [batchSize, setBatchSize] = useState(32);
  const [playing, setPlaying] = useState(false);
  const [batchPos, setBatchPos] = useState<[number, number]>([...START]);
  const [sgdPos, setSgdPos] = useState<[number, number]>([...START]);
  const [batchPath, setBatchPath] = useState<Path>([{ x: START[0], y: START[1] }]);
  const [sgdPath, setSgdPath] = useState<Path>([{ x: START[0], y: START[1] }]);
  const [steps, setSteps] = useState(0);

  function reset() {
    setPlaying(false);
    setBatchPos([...START]);
    setSgdPos([...START]);
    setBatchPath([{ x: START[0], y: START[1] }]);
    setSgdPath([{ x: START[0], y: START[1] }]);
    setSteps(0);
  }

  const step = useCallback(() => {
    setBatchPos(prev => {
      const next = batchStep(prev);
      setBatchPath(p => [...p.slice(-80), { x: next[0], y: next[1] }]);
      return next;
    });
    setSgdPos(prev => {
      const next = sgdStep(prev, batchSize);
      setSgdPath(p => [...p.slice(-80), { x: next[0], y: next[1] }]);
      return next;
    });
    setSteps(s => s + 1);
  }, [batchSize]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    const id = setTimeout(() => step(), 60);
    return () => clearTimeout(id);
  }, [playing, batchPos, sgdPos, step]);

  // Draw contour map
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const rect = svgRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 560;
    const height = 300;
    svg.attr('height', height);

    const margin = { top: 16, right: 16, bottom: 38, left: 48 };
    const iW = width - margin.left - margin.right;
    const iH = height - margin.top - margin.bottom;

    const xs = d3.scaleLinear().domain(DOMAIN[0]).range([0, iW]);
    const ys = d3.scaleLinear().domain(DOMAIN[1]).range([iH, 0]);

    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Contour map via grid
    const nx = 60, ny = 50;
    const grid: number[] = [];
    const xVals = d3.range(DOMAIN[0][0], DOMAIN[0][1], (DOMAIN[0][1] - DOMAIN[0][0]) / nx);
    const yVals = d3.range(DOMAIN[1][0], DOMAIN[1][1], (DOMAIN[1][1] - DOMAIN[1][0]) / ny);
    for (let yi = 0; yi < ny; yi++) {
      for (let xi = 0; xi < nx; xi++) {
        grid.push(loss2d(xVals[xi], yVals[yi]));
      }
    }

    const contours = d3.contours().size([nx, ny]).thresholds(12)(grid);
    const color = d3.scaleSequential(d3.interpolateBlues).domain([0, d3.max(grid)!]);

    const contourXs = d3.scaleLinear().domain([0, nx]).range([0, iW]);
    const contourYs = d3.scaleLinear().domain([0, ny]).range([iH, 0]);
    const proj = d3.geoTransform({
      point(x, y) { this.stream.point(contourXs(x), contourYs(y)); }
    });
    const pathGen = d3.geoPath(proj);

    g.selectAll('.contour').data(contours).enter().append('path')
      .attr('class', 'contour')
      .attr('d', pathGen)
      .attr('fill', d => color(d.value))
      .attr('stroke', 'white')
      .attr('stroke-width', 0.4)
      .attr('opacity', 0.85);

    // Axes
    g.append('g').attr('transform', `translate(0,${iH})`)
      .call(d3.axisBottom(xs).ticks(5))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);
    g.append('g').call(d3.axisLeft(ys).ticks(4))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', 11);

    g.append('text').attr('x', iW / 2).attr('y', iH + 32)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 12)
      .text('w₁');
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -iH / 2).attr('y', -36)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', 12)
      .text('w₂');

    // Minimum marker
    g.append('circle').attr('cx', xs(3)).attr('cy', ys(2)).attr('r', 5)
      .attr('fill', 'none').attr('stroke', '#22c55e').attr('stroke-width', 2);

    // Draw paths
    const lineGen = d3.line<{ x: number; y: number }>()
      .x(d => xs(d.x)).y(d => ys(d.y)).curve(d3.curveCatmullRom);

    if (batchPath.length > 1) {
      g.append('path').datum(batchPath)
        .attr('fill', 'none').attr('stroke', '#3b82f6')
        .attr('stroke-width', 2).attr('opacity', 0.9).attr('d', lineGen);
    }
    if (sgdPath.length > 1) {
      g.append('path').datum(sgdPath)
        .attr('fill', 'none').attr('stroke', '#f97316')
        .attr('stroke-width', 1.5).attr('stroke-dasharray', '3 2')
        .attr('opacity', 0.9).attr('d', lineGen);
    }

    // Current positions
    g.append('circle').attr('cx', xs(batchPos[0])).attr('cy', ys(batchPos[1]))
      .attr('r', 7).attr('fill', '#3b82f6').attr('stroke', 'white').attr('stroke-width', 2);
    g.append('circle').attr('cx', xs(sgdPos[0])).attr('cy', ys(sgdPos[1]))
      .attr('r', 7).attr('fill', '#f97316').attr('stroke', 'white').attr('stroke-width', 2);

    // Legend
    const leg = g.append('g').attr('transform', `translate(${iW - 110}, 10)`);
    [['#3b82f6', 'Batch GD'], ['#f97316', 'SGD (mini-batch)']].forEach(([col, lbl], i) => {
      leg.append('circle').attr('cx', 6).attr('cy', i * 18).attr('r', 5).attr('fill', col);
      leg.append('text').attr('x', 14).attr('y', i * 18 + 4)
        .attr('fill', '#e2e8f0').attr('font-size', 10).text(lbl);
    });

  }, [batchPos, sgdPos, batchPath, sgdPath]);

  return (
    <FigureBox
      title="Batch GD vs Mini-batch SGD — 2D Loss Landscape"
      caption="Blue = Batch GD (smooth path). Orange = SGD (noisy but fast). The green circle is the minimum. Both start at the same point."
      controls={
        <div className="flex flex-col gap-3 w-full">
          <Slider
            label="Batch size"
            value={batchSize}
            min={1}
            max={256}
            step={1}
            onChange={v => { setBatchSize(v); reset(); }}
            formatValue={v => String(Math.round(v))}
          />
          <div className="flex flex-wrap gap-3 items-center">
            <PlayControls
              playing={playing}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onStep={step}
              onReset={reset}
            />
            <Presets
              presets={[
                { label: 'Batch size 1 (pure SGD)', onApply: () => { setBatchSize(1); reset(); } },
                { label: 'Batch size 32',           onApply: () => { setBatchSize(32); reset(); } },
                { label: 'Batch size 256',          onApply: () => { setBatchSize(256); reset(); } },
              ]}
              onReset={reset}
            />
          </div>
        </div>
      }
      liveValues={
        <LiveValuesPanel
          values={[
            { label: 'Steps',         value: steps,                                            color: '#a5b4fc' },
            { label: 'Batch size',    value: batchSize,                                        color: '#86efac' },
            { label: 'Batch Loss',    value: loss2d(batchPos[0], batchPos[1]).toFixed(3),      color: '#60a5fa' },
            { label: 'SGD Loss',      value: loss2d(sgdPos[0], sgdPos[1]).toFixed(3),          color: '#fb923c' },
          ]}
        />
      }
    >
      <svg ref={svgRef} className="w-full" />
    </FigureBox>
  );
}
