'use client';

import { useEffect, useState, type RefObject } from 'react';
import * as d3 from 'd3';
import { matVec2, type Mat2 } from './linearAlgebraMath';

export interface Dimensions {
  width: number;
  height: number;
}

interface DimensionOptions {
  mobileHeight?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

/**
 * Tracks container width responsively using ResizeObserver so D3 figures fit desktop & mobile WebViews.
 */
export function useFigureDimensions(
  containerRef: RefObject<HTMLDivElement | null>,
  options: DimensionOptions = {}
): Dimensions {
  const { mobileHeight = 310, minHeight = 290, maxHeight = 390, aspectRatio = 0.58 } = options;
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 620, height: 350 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const w = el.getBoundingClientRect().width || 620;
      const h =
        w < 480
          ? mobileHeight
          : Math.round(Math.min(maxHeight, Math.max(minHeight, w * aspectRatio)));
      setDimensions({ width: w, height: h });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef, mobileHeight, minHeight, maxHeight, aspectRatio]);

  return dimensions;
}

export interface PlaneMetrics {
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  g: d3.Selection<SVGGElement, unknown, null, undefined>;
  clippedG: d3.Selection<SVGGElement, unknown, null, undefined>;
  iW: number;
  iH: number;
  xs: d3.ScaleLinear<number, number>;
  ys: d3.ScaleLinear<number, number>;
  xDomain: [number, number];
  yDomain: [number, number];
  isMobile: boolean;
  pixelsPerUnit: number;
}

/**
 * Clears the SVG and initializes a 1:1 isotropic Cartesian plane (equal pixel scale on X and Y axes).
 */
export function createIsotropicPlane(
  svgElement: SVGSVGElement,
  width: number,
  height: number,
  yHalf = 4.5,
  clipId = 'la-plot-clip'
): PlaneMetrics {
  const svg = d3.select(svgElement);
  const isMobile = width < 500;
  const pad = isMobile ? 14 : 20;

  const iW = Math.max(40, width - 2 * pad);
  const iH = Math.max(40, height - 2 * pad);

  const pixelsPerUnit = iH / (2 * yHalf);
  const xHalf = iW / 2 / pixelsPerUnit;

  const xDomain: [number, number] = [-xHalf, xHalf];
  const yDomain: [number, number] = [-yHalf, yHalf];

  const xs = d3.scaleLinear().domain(xDomain).range([0, iW]);
  const ys = d3.scaleLinear().domain(yDomain).range([iH, 0]);

  svg.selectAll('*').remove();

  const defs = svg.append('defs');
  defs
    .append('clipPath')
    .attr('id', clipId)
    .append('rect')
    .attr('width', iW)
    .attr('height', iH);

  const g = svg.append('g').attr('transform', `translate(${pad},${pad})`);
  const clippedG = g.append('g').attr('clip-path', `url(#${clipId})`);

  return { svg, g, clippedG, iW, iH, xs, ys, xDomain, yDomain, isMobile, pixelsPerUnit };
}

interface GridOptions {
  ticks?: number[];
  xLabel?: string;
  yLabel?: string;
}

/**
 * Renders 1-unit Cartesian grid lines, main coordinate axes, tick marks, origin marker, and axis names.
 */
export function drawCartesianGrid(plane: PlaneMetrics, options: GridOptions = {}) {
  const { g, iW, iH, xs, ys, xDomain, yDomain, isMobile } = plane;
  const { ticks = [-4, -2, 2, 4], xLabel = 'x₁', yLabel = 'x₂' } = options;

  const gridG = g.append('g').attr('class', 'cartesian-grid');

  for (let x = Math.floor(xDomain[0]); x <= Math.ceil(xDomain[1]); x++) {
    if (x === 0) continue;
    gridG
      .append('line')
      .attr('x1', xs(x))
      .attr('x2', xs(x))
      .attr('y1', 0)
      .attr('y2', iH)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);
  }

  for (let y = Math.floor(yDomain[0]); y <= Math.ceil(yDomain[1]); y++) {
    if (y === 0) continue;
    gridG
      .append('line')
      .attr('x1', 0)
      .attr('x2', iW)
      .attr('y1', ys(y))
      .attr('y2', ys(y))
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1);
  }

  // Main axes
  g.append('line')
    .attr('x1', 0)
    .attr('x2', iW)
    .attr('y1', ys(0))
    .attr('y2', ys(0))
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 1.5);
  g.append('line')
    .attr('x1', xs(0))
    .attr('x2', xs(0))
    .attr('y1', 0)
    .attr('y2', iH)
    .attr('stroke', '#cbd5e1')
    .attr('stroke-width', 1.5);

  ticks.forEach((t) => {
    if (t >= xDomain[0] + 0.5 && t <= xDomain[1] - 0.5) {
      g.append('line')
        .attr('x1', xs(t))
        .attr('x2', xs(t))
        .attr('y1', ys(0) - 3)
        .attr('y2', ys(0) + 3)
        .attr('stroke', '#cbd5e1');
      g.append('text')
        .attr('x', xs(t))
        .attr('y', ys(0) + 13)
        .attr('fill', '#94a3b8')
        .attr('font-size', 9)
        .attr('font-family', 'monospace')
        .attr('text-anchor', 'middle')
        .text(t);
    }
    if (t >= yDomain[0] + 0.5 && t <= yDomain[1] - 0.5) {
      g.append('line')
        .attr('x1', xs(0) - 3)
        .attr('x2', xs(0) + 3)
        .attr('y1', ys(t))
        .attr('y2', ys(t))
        .attr('stroke', '#cbd5e1');
      g.append('text')
        .attr('x', xs(0) - 6)
        .attr('y', ys(t) + 3)
        .attr('fill', '#94a3b8')
        .attr('font-size', 9)
        .attr('font-family', 'monospace')
        .attr('text-anchor', 'end')
        .text(t);
    }
  });

  g.append('text')
    .attr('x', iW - 4)
    .attr('y', ys(0) - 6)
    .attr('fill', '#94a3b8')
    .attr('font-size', isMobile ? 10 : 11)
    .attr('font-weight', 600)
    .attr('text-anchor', 'end')
    .text(xLabel);

  g.append('text')
    .attr('x', xs(0) + 6)
    .attr('y', 12)
    .attr('fill', '#94a3b8')
    .attr('font-size', isMobile ? 10 : 11)
    .attr('font-weight', 600)
    .text(yLabel);

  g.append('circle').attr('cx', xs(0)).attr('cy', ys(0)).attr('r', 3).attr('fill', '#94a3b8');
}

/**
 * Draws the transformed grid under a 2x2 linear transformation matrix inside the clipped plane.
 */
export function drawTransformedGrid(
  plane: PlaneMetrics,
  mat: Mat2,
  options: { range?: number; stroke?: string; axisStroke?: string; opacity?: number } = {}
) {
  const { clippedG, xs, ys } = plane;
  const { range = 6, stroke = '#93c5fd', axisStroke = '#3b82f6', opacity = 0.65 } = options;

  for (let k = -range; k <= range; k++) {
    const isMainAxis = k === 0;
    const col = isMainAxis ? axisStroke : stroke;
    const sw = isMainAxis ? 1.5 : 1;
    const op = isMainAxis ? opacity : opacity * 0.7;

    // Transformed vertical grid line (x = k)
    const vStart = matVec2(mat, { x: k, y: -range });
    const vEnd = matVec2(mat, { x: k, y: range });
    clippedG
      .append('line')
      .attr('x1', xs(vStart.x))
      .attr('y1', ys(vStart.y))
      .attr('x2', xs(vEnd.x))
      .attr('y2', ys(vEnd.y))
      .attr('stroke', col)
      .attr('stroke-width', sw)
      .attr('opacity', op);

    // Transformed horizontal grid line (y = k)
    const hStart = matVec2(mat, { x: -range, y: k });
    const hEnd = matVec2(mat, { x: range, y: k });
    clippedG
      .append('line')
      .attr('x1', xs(hStart.x))
      .attr('y1', ys(hStart.y))
      .attr('x2', xs(hEnd.x))
      .attr('y2', ys(hEnd.y))
      .attr('stroke', col)
      .attr('stroke-width', sw)
      .attr('opacity', op);
  }
}

interface ArrowOptions {
  strokeWidth?: number;
  isMobile?: boolean;
  dashed?: boolean;
  opacity?: number;
  headScale?: number;
}

/**
 * Draws a vector arrow with a crisp polygon arrowhead that avoids SVG marker clipping.
 */
export function drawVectorArrow(
  target: d3.Selection<SVGGElement, unknown, null, undefined>,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  options: ArrowOptions = {}
) {
  const { strokeWidth = 2.5, isMobile = false, dashed = false, opacity = 1, headScale = 1 } = options;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const len = Math.hypot(dx, dy);
  if (len < 3) return;

  const angle = Math.atan2(dy, dx);
  const headLength = Math.min(len * 0.45, (isMobile ? 10 : 12) * headScale);
  const headAngle = Math.PI / 7;
  const shortenBy = headLength * 0.7;
  const endLineX = toX - (dx / len) * shortenBy;
  const endLineY = toY - (dy / len) * shortenBy;

  const shaft = target
    .append('line')
    .attr('x1', fromX)
    .attr('y1', fromY)
    .attr('x2', endLineX)
    .attr('y2', endLineY)
    .attr('stroke', color)
    .attr('stroke-width', strokeWidth)
    .attr('opacity', opacity);

  if (dashed) {
    shaft.attr('stroke-dasharray', '5 4');
  }

  const p1X = toX - headLength * Math.cos(angle - headAngle);
  const p1Y = toY - headLength * Math.sin(angle - headAngle);
  const p2X = toX - headLength * Math.cos(angle + headAngle);
  const p2Y = toY - headLength * Math.sin(angle + headAngle);

  target
    .append('polygon')
    .attr('points', `${toX},${toY} ${p1X},${p1Y} ${endLineX},${endLineY} ${p2X},${p2Y}`)
    .attr('fill', color)
    .attr('opacity', opacity);
}

/**
 * Draws a crisp label with a subtle white halo so text remains legible over grid lines.
 */
export function drawVectorLabel(
  target: d3.Selection<SVGGElement, unknown, null, undefined>,
  xPx: number,
  yPx: number,
  text: string,
  color: string,
  options: { isMobile?: boolean; anchor?: 'start' | 'middle' | 'end'; fontSize?: number } = {}
) {
  const { isMobile = false, anchor = 'start', fontSize } = options;
  target
    .append('text')
    .attr('x', xPx)
    .attr('y', yPx)
    .attr('fill', color)
    .attr('font-weight', 700)
    .attr('font-size', fontSize ?? (isMobile ? 11 : 12))
    .attr('text-anchor', anchor)
    .style('paint-order', 'stroke')
    .style('stroke', 'rgba(255,255,255,0.92)')
    .style('stroke-width', '3.5px')
    .style('stroke-linejoin', 'round')
    .text(text);
}

/**
 * Attaches an accessible, touch-friendly circular drag handle on top of the canvas.
 */
export function attachDragHandle(
  target: d3.Selection<SVGGElement, unknown, null, undefined>,
  xPx: number,
  yPx: number,
  color: string,
  options: { isMobile?: boolean; onDrag: (px: number, py: number) => void }
) {
  const { isMobile = false, onDrag } = options;

  const dragBehavior = d3
    .drag<SVGGElement, unknown>()
    .on('drag', (event) => {
      onDrag(event.x, event.y);
    });

  const handleGroup = target
    .append('g')
    .attr('transform', `translate(${xPx},${yPx})`)
    .style('cursor', 'grab')
    .call(dragBehavior);

  handleGroup
    .append('circle')
    .attr('r', 26)
    .attr('fill', 'transparent')
    .style('touch-action', 'none');

  handleGroup
    .append('circle')
    .attr('r', isMobile ? 9 : 8)
    .attr('fill', color)
    .attr('stroke', 'white')
    .attr('stroke-width', 2.5)
    .style('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.22))');
}
