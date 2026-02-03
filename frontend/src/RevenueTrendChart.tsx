import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { RevenueTrendData } from './types';

interface RevenueTrendChartProps {
  data: RevenueTrendData[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 840;
    const height = 280;
    const margin = { top: 20, right: 40, bottom: 40, left: 60 };

    const g = svg.append('g');

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yMax = d3.max(data, d => Math.max(d.revenue, d.target)) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat(() => '')
      )
      .call(g => g.selectAll('.tick line')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-opacity', 0.5))
      .call(g => g.select('.domain').remove());

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => xScale(d.month)!)
      .attr('y', d => yScale(d.revenue))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - margin.bottom - yScale(d.revenue))
      .attr('fill', '#1976d2');

    // Target line
    const line = d3.line<RevenueTrendData>()
      .x(d => xScale(d.month)! + xScale.bandwidth() / 2)
      .y(d => yScale(d.target));

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#ff9800')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Target points
    g.selectAll('.target-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.month)! + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.target))
      .attr('r', 5)
      .attr('fill', '#ff9800');

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .call(g => g.select('.domain').attr('stroke', '#e0e0e0'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#e0e0e0'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#666')
        .attr('font-size', '12px'));

    // Y Axis with percentage labels
    const formatPercent = (d: number) => `${Math.round((d / yMax) * 100)}%`;
    
    g.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(formatPercent as any))
      .call(g => g.select('.domain').attr('stroke', '#e0e0e0'))
      .call(g => g.selectAll('.tick line').attr('stroke', '#e0e0e0'))
      .call(g => g.selectAll('.tick text')
        .attr('fill', '#666')
        .attr('font-size', '12px'));

  }, [data]);

  return <svg ref={svgRef} width={840} height={280} style={{ display: 'block' }} />;
};
