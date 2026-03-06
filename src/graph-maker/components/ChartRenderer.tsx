import React, { useMemo, forwardRef } from 'react';
import type { ParsedData, GraphTheme, ChartType, LegendPosition, XFormat, LineCap } from '../state/types';

const FONT = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif";

interface ChartProps {
  data: ParsedData;
  xColumn: string;
  yColumns: string[];
  chartType: ChartType;
  theme: GraphTheme;
  width: number;
  height: number;
  title: string;
  subtitle: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  lineWidth: number;
  lineCap: LineCap;
  showLegend: boolean;
  legendPosition: LegendPosition;
  capitalizeLegend: boolean;
  xLabel: string;
  xFormat: XFormat;
  yLabel: string;
  showGridlines: boolean;
  cornerRadius: number;
  showFrame: boolean;
}

interface Series {
  name: string;
  values: number[];
}

interface Layout {
  plotX: number;
  plotY: number;
  plotW: number;
  plotH: number;
}

// ─── Nice tick generation ───────────────────────────────────────────────
function niceNum(range: number, round: boolean): number {
  if (range === 0) return 1;
  const exp = Math.floor(Math.log10(Math.abs(range)));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) {
    nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  } else {
    nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  }
  return nice * Math.pow(10, exp);
}

function generateTicks(min: number, max: number, count = 6): number[] {
  if (min === max) { min -= 1; max += 1; }
  const range = niceNum(max - min, false);
  const step = niceNum(range / (count - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step * 0.01; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  return ticks;
}

// ─── Date formatting ────────────────────────────────────────────────────
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isDateLike(val: string | number): boolean {
  if (typeof val === 'number') return false;
  return /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(val);
}

function formatDate(val: string | number): string {
  if (typeof val === 'number') return String(val);
  const d = new Date(val);
  if (isNaN(d.getTime())) return String(val);
  return `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

// ─── Data processing ────────────────────────────────────────────────────
function processData(data: ParsedData, xColumn: string, yColumns: string[]): { xLabels: (string | number)[]; series: Series[] } {
  const xIdx = data.headers.indexOf(xColumn);
  const yIndices = yColumns.map(c => data.headers.indexOf(c)).filter(i => i >= 0);

  if (xIdx < 0 || yIndices.length === 0) {
    return { xLabels: [], series: [] };
  }

  const xLabels = data.rows.map(row => row[xIdx]);
  const series: Series[] = yIndices.map(idx => ({
    name: data.headers[idx],
    values: data.rows.map(row => {
      const v = row[idx];
      return typeof v === 'number' ? v : parseFloat(String(v)) || 0;
    }),
  }));

  return { xLabels, series };
}

// ─── Main component ─────────────────────────────────────────────────────
export const ChartRenderer = forwardRef<SVGSVGElement, ChartProps>(function ChartRenderer(props, ref) {
  const {
    data, xColumn, yColumns, chartType, theme,
    width, height, title, subtitle,
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    lineWidth, lineCap, showLegend, legendPosition, capitalizeLegend,
    xLabel, xFormat, yLabel, showGridlines, cornerRadius, showFrame,
  } = props;

  const { xLabels, series } = useMemo(
    () => processData(data, xColumn, yColumns),
    [data, xColumn, yColumns],
  );

  // Determine X format
  const effectiveXFormat = useMemo(() => {
    if (xFormat !== 'auto') return xFormat;
    if (xLabels.length > 0 && isDateLike(xLabels[0])) return 'date' as const;
    if (xLabels.every(v => typeof v === 'number')) return 'number' as const;
    return 'category' as const;
  }, [xFormat, xLabels]);

  const formatX = (val: string | number) => {
    if (effectiveXFormat === 'date') return formatDate(val);
    return String(val);
  };

  // Compute layout
  const layout = useMemo((): Layout => {
    const titleH = title ? 28 : 0;
    const subtitleH = subtitle ? 18 : 0;
    const headerH = titleH + subtitleH + (title || subtitle ? 8 : 0);

    const legendH = showLegend && (legendPosition === 'top' || legendPosition === 'bottom') ? 28 : 0;
    const legendW = showLegend && (legendPosition === 'left' || legendPosition === 'right') ? 100 : 0;

    const yAxisW = 50;
    const xAxisH = 40;
    const xLabelH = xLabel ? 22 : 0;
    const yLabelW = yLabel ? 22 : 0;

    const plotX = paddingLeft + yLabelW + yAxisW + (legendPosition === 'left' ? legendW : 0);
    const plotY = paddingTop + headerH + (legendPosition === 'top' ? legendH : 0);
    const plotW = width - plotX - paddingRight - (legendPosition === 'right' ? legendW : 0);
    const plotH = height - plotY - paddingBottom - xAxisH - xLabelH - (legendPosition === 'bottom' ? legendH : 0);

    return { plotX, plotY, plotW: Math.max(plotW, 40), plotH: Math.max(plotH, 40) };
  }, [width, height, title, subtitle, paddingTop, paddingRight, paddingBottom, paddingLeft, showLegend, legendPosition, xLabel, yLabel]);

  // Y scale
  const { yMin, yMax, yTicks } = useMemo(() => {
    if (series.length === 0) return { yMin: 0, yMax: 100, yTicks: [0, 20, 40, 60, 80, 100] };
    const allValues = series.flatMap(s => s.values);
    let min = Math.min(...allValues);
    let max = Math.max(...allValues);
    if (min === max) { min -= 10; max += 10; }
    const ticks = generateTicks(min, max);
    return { yMin: ticks[0], yMax: ticks[ticks.length - 1], yTicks: ticks };
  }, [series]);

  const yScale = (v: number) => {
    if (yMax === yMin) return layout.plotH / 2;
    return layout.plotH - ((v - yMin) / (yMax - yMin)) * layout.plotH;
  };

  // X positions
  const xPositions = useMemo(() => {
    const n = xLabels.length;
    if (n === 0) return [];
    if (chartType === 'bar') {
      const bandW = layout.plotW / n;
      return xLabels.map((_, i) => bandW * i + bandW / 2);
    }
    if (n === 1) return [layout.plotW / 2];
    return xLabels.map((_, i) => (i / (n - 1)) * layout.plotW);
  }, [xLabels, layout.plotW, chartType]);

  // Build line/area paths
  const linePaths = useMemo(() => {
    return series.map(s => {
      const points = s.values.map((v, i) => ({ x: xPositions[i], y: yScale(v) }));
      if (points.length === 0) return '';
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
    });
  }, [series, xPositions, yScale]);

  const areaPaths = useMemo(() => {
    return series.map(s => {
      const points = s.values.map((v, i) => ({ x: xPositions[i], y: yScale(v) }));
      if (points.length === 0) return '';
      const linePart = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
      const bottom = layout.plotH;
      return `${linePart} L${points[points.length - 1].x.toFixed(2)},${bottom} L${points[0].x.toFixed(2)},${bottom} Z`;
    });
  }, [series, xPositions, yScale, layout.plotH]);

  // Bar geometry
  const barWidth = useMemo(() => {
    if (xLabels.length === 0 || series.length === 0) return 0;
    const bandW = layout.plotW / xLabels.length;
    const groupW = bandW * 0.7;
    return groupW / series.length;
  }, [xLabels.length, series.length, layout.plotW]);

  // Legend
  const legendItems = series.map((s, i) => ({
    name: capitalizeLegend ? s.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : s.name,
    color: theme.series[i % theme.series.length],
  }));

  // Legend position calculation
  const legendX = legendPosition === 'left' ? paddingLeft + 8 :
    legendPosition === 'right' ? layout.plotX + layout.plotW + 16 :
    layout.plotX;
  const legendY = legendPosition === 'top' ? layout.plotY - 28 :
    legendPosition === 'bottom' ? layout.plotY + layout.plotH + 52 :
    layout.plotY;

  if (series.length === 0 || xLabels.length === 0) {
    return (
      <svg ref={ref} width={width} height={height} style={{ fontFamily: FONT }}>
        <rect width={width} height={height} rx={cornerRadius} fill={theme.background} />
        <text x={width / 2} y={height / 2} textAnchor="middle" fill={theme.mutedText} fontSize={14}>
          No data to display
        </text>
      </svg>
    );
  }

  return (
    <svg ref={ref} width={width} height={height} style={{ fontFamily: FONT }}>
      {/* Background */}
      <rect width={width} height={height} rx={cornerRadius} fill={theme.background} />

      {/* Frame */}
      {showFrame && (
        <rect x={1} y={1} width={width - 2} height={height - 2} rx={cornerRadius} fill="none" stroke={theme.accent} strokeWidth={2} />
      )}

      {/* Title */}
      {title && (
        <text x={layout.plotX} y={paddingTop + 22} fill={theme.text} fontSize={18} fontWeight={700}>
          {title}
        </text>
      )}

      {/* Subtitle */}
      {subtitle && (
        <text x={layout.plotX} y={paddingTop + (title ? 42 : 18)} fill={theme.mutedText} fontSize={12}>
          {subtitle}
        </text>
      )}

      {/* Legend */}
      {showLegend && (legendPosition === 'top' || legendPosition === 'bottom') && (
        <g transform={`translate(${legendX}, ${legendY})`}>
          {legendItems.reduce<{ elements: React.ReactElement[]; x: number }>((acc, item, i) => {
            const el = (
              <g key={i} transform={`translate(${acc.x}, 0)`}>
                <circle cx={5} cy={6} r={4} fill={item.color} />
                <text x={14} y={10} fill={theme.mutedText} fontSize={11}>{item.name}</text>
              </g>
            );
            const textWidth = item.name.length * 6.5 + 24;
            return { elements: [...acc.elements, el], x: acc.x + textWidth };
          }, { elements: [], x: legendPosition === 'top' || legendPosition === 'bottom' ? layout.plotW - legendItems.reduce((w, it) => w + it.name.length * 6.5 + 24, 0) : 0 }).elements}
        </g>
      )}

      {showLegend && (legendPosition === 'left' || legendPosition === 'right') && (
        <g transform={`translate(${legendX}, ${legendY})`}>
          {legendItems.map((item, i) => (
            <g key={i} transform={`translate(0, ${i * 22})`}>
              <circle cx={5} cy={6} r={4} fill={item.color} />
              <text x={14} y={10} fill={theme.mutedText} fontSize={11}>{item.name}</text>
            </g>
          ))}
        </g>
      )}

      {/* Plot area group */}
      <g transform={`translate(${layout.plotX}, ${layout.plotY})`}>
        {/* Gridlines */}
        {showGridlines && yTicks.map((tick, i) => (
          <line
            key={i}
            x1={0} y1={yScale(tick)}
            x2={layout.plotW} y2={yScale(tick)}
            stroke={theme.grid} strokeWidth={1}
          />
        ))}

        {/* Y axis line */}
        <line x1={0} y1={0} x2={0} y2={layout.plotH} stroke={theme.axis} strokeWidth={1} />

        {/* Y axis ticks + labels */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line x1={-4} y1={yScale(tick)} x2={0} y2={yScale(tick)} stroke={theme.axis} strokeWidth={1} />
            <text
              x={-8} y={yScale(tick) + 4}
              textAnchor="end" fill={theme.mutedText} fontSize={11}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* X axis line */}
        <line x1={0} y1={layout.plotH} x2={layout.plotW} y2={layout.plotH} stroke={theme.axis} strokeWidth={1} />

        {/* X axis ticks + labels */}
        {xLabels.map((label, i) => (
          <g key={i}>
            <line x1={xPositions[i]} y1={layout.plotH} x2={xPositions[i]} y2={layout.plotH + 4} stroke={theme.axis} strokeWidth={1} />
            <text
              x={xPositions[i]} y={layout.plotH + 18}
              textAnchor="middle" fill={theme.mutedText} fontSize={11}
            >
              {formatX(label)}
            </text>
          </g>
        ))}

        {/* Series rendering */}
        {chartType === 'area' && series.map((_, i) => (
          <path
            key={`area-${i}`}
            d={areaPaths[i]}
            fill={theme.series[i % theme.series.length]}
            opacity={0.15}
          />
        ))}

        {(chartType === 'line' || chartType === 'area') && series.map((_, i) => (
          <path
            key={`line-${i}`}
            d={linePaths[i]}
            fill="none"
            stroke={theme.series[i % theme.series.length]}
            strokeWidth={lineWidth}
            strokeLinecap={lineCap}
            strokeLinejoin="round"
          />
        ))}

        {(chartType === 'line' || chartType === 'area') && series.map((s, si) => (
          s.values.map((v, vi) => (
            <circle
              key={`dot-${si}-${vi}`}
              cx={xPositions[vi]}
              cy={yScale(v)}
              r={lineWidth + 1}
              fill={theme.series[si % theme.series.length]}
            />
          ))
        ))}

        {chartType === 'bar' && series.map((s, si) => (
          s.values.map((v, vi) => {
            const bandW = layout.plotW / xLabels.length;
            const groupW = bandW * 0.7;
            const groupX = xPositions[vi] - groupW / 2;
            const bx = groupX + si * barWidth;
            const by = yScale(Math.max(v, yMin));
            const bh = layout.plotH - by;
            return (
              <rect
                key={`bar-${si}-${vi}`}
                x={bx}
                y={by}
                width={barWidth - 1}
                height={Math.max(bh, 0)}
                fill={theme.series[si % theme.series.length]}
                rx={1}
              />
            );
          })
        ))}
      </g>

      {/* X axis label */}
      {xLabel && (
        <text
          x={layout.plotX + layout.plotW / 2}
          y={layout.plotY + layout.plotH + 38}
          textAnchor="middle" fill={theme.mutedText} fontSize={12}
        >
          {xLabel}
        </text>
      )}

      {/* Y axis label */}
      {yLabel && (
        <text
          x={paddingLeft + 14}
          y={layout.plotY + layout.plotH / 2}
          textAnchor="middle" fill={theme.mutedText} fontSize={12}
          transform={`rotate(-90, ${paddingLeft + 14}, ${layout.plotY + layout.plotH / 2})`}
        >
          {yLabel}
        </text>
      )}
    </svg>
  );
});
