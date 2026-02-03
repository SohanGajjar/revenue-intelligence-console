import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface MiniChartProps {
  data: number[];
  color: string;
  type?: 'line' | 'bar';
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, color, type = 'line' }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 240;
    const height = 60;
    const margin = { top: 5, right: 5, bottom: 5, left: 5 };

    const xScale = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data) || 1])
      .range([height - margin.bottom, margin.top]);

    if (type === 'line') {
      const line = d3.line<number>()
        .x((d, i) => xScale(i))
        .y(d => yScale(d))
        .curve(d3.curveMonotoneX);

      // Area under line
      const area = d3.area<number>()
        .x((d, i) => xScale(i))
        .y0(height - margin.bottom)
        .y1(d => yScale(d))
        .curve(d3.curveMonotoneX);

      svg.append('path')
        .datum(data)
        .attr('fill', color)
        .attr('opacity', 0.2)
        .attr('d', area);

      svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);
    } else {
      const barWidth = (width - margin.left - margin.right) / data.length - 2;

      svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(i) - barWidth / 2)
        .attr('y', d => yScale(d))
        .attr('width', barWidth)
        .attr('height', d => height - margin.bottom - yScale(d))
        .attr('fill', color);
    }
  }, [data, color, type]);

  return <svg ref={svgRef} width={240} height={60} />;
};
