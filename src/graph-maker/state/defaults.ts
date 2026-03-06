import type { GraphState } from './types';
import { DEFAULT_THEME_ID } from './themes';

export const DEMO_CSV = `date,value_a,value_b
2019-01-01,85,78
2020-01-01,100,85
2021-01-01,118,92
2022-01-01,135,105
2023-01-01,142,118
2024-01-01,168,145
2025-01-01,192,165`;

export const graphInitialState: GraphState = {
  rawInput: DEMO_CSV,
  parsedData: null,
  parseError: null,
  xColumn: 'date',
  yColumns: ['value_a', 'value_b'],
  transpose: false,

  title: 'Demo graph',
  subtitle: '',
  width: 760,
  height: 430,
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20,

  chartType: 'line',
  lineWidth: 2,
  lineCap: 'round',
  showLegend: true,
  legendPosition: 'top',
  capitalizeLegend: true,

  xLabel: '',
  xFormat: 'auto',
  yLabel: '',
  showGridlines: true,

  cornerRadius: 0,
  showFrame: false,

  activeThemeId: DEFAULT_THEME_ID,
  customTheme: null,
  showCustomize: false,

  exportFormat: 'png',
};

export const CHART_TYPE_OPTIONS = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'area', label: 'Area' },
];

export const LEGEND_POSITION_OPTIONS = [
  { value: 'top', label: 'Top' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
];

export const X_FORMAT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'date', label: 'Date' },
  { value: 'number', label: 'Number' },
  { value: 'category', label: 'Category' },
];

export const LINE_CAP_OPTIONS = [
  { value: 'butt', label: 'Butt' },
  { value: 'round', label: 'Round' },
  { value: 'square', label: 'Square' },
];
