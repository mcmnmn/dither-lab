export type ChartType = 'line' | 'bar' | 'area';
export type LegendPosition = 'top' | 'right' | 'bottom' | 'left';
export type XFormat = 'auto' | 'date' | 'number' | 'category';
export type LineCap = 'butt' | 'round' | 'square';
export type GraphOutputFormat = 'png' | 'svg';

export interface GraphTheme {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  grid: string;
  axis: string;
  series: string[];
  accent: string;
}

export interface ParsedData {
  headers: string[];
  rows: (string | number)[][];
}

export interface GraphState {
  // Data
  rawInput: string;
  parsedData: ParsedData | null;
  parseError: string | null;
  xColumn: string;
  yColumns: string[];
  transpose: boolean;

  // General
  title: string;
  subtitle: string;
  width: number;
  height: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;

  // Chart
  chartType: ChartType;
  lineWidth: number;
  lineCap: LineCap;
  showLegend: boolean;
  legendPosition: LegendPosition;
  capitalizeLegend: boolean;

  // Axes
  xLabel: string;
  xFormat: XFormat;
  yLabel: string;
  showGridlines: boolean;

  // Style
  cornerRadius: number;
  showFrame: boolean;

  // Theme
  activeThemeId: string;
  customTheme: GraphTheme | null;
  showCustomize: boolean;

  // Output
  exportFormat: GraphOutputFormat;
}

export type GraphAction =
  | { type: 'GM_SET_RAW_INPUT'; input: string }
  | { type: 'GM_SET_PARSED_DATA'; data: ParsedData | null; error: string | null }
  | { type: 'GM_SET_X_COLUMN'; column: string }
  | { type: 'GM_SET_Y_COLUMNS'; columns: string[] }
  | { type: 'GM_TOGGLE_Y_COLUMN'; column: string }
  | { type: 'GM_SET_TRANSPOSE'; transpose: boolean }
  | { type: 'GM_SET_TITLE'; title: string }
  | { type: 'GM_SET_SUBTITLE'; subtitle: string }
  | { type: 'GM_SET_WIDTH'; width: number }
  | { type: 'GM_SET_HEIGHT'; height: number }
  | { type: 'GM_SET_PADDING'; side: 'top' | 'right' | 'bottom' | 'left'; value: number }
  | { type: 'GM_SET_CHART_TYPE'; chartType: ChartType }
  | { type: 'GM_SET_LINE_WIDTH'; lineWidth: number }
  | { type: 'GM_SET_LINE_CAP'; lineCap: LineCap }
  | { type: 'GM_SET_SHOW_LEGEND'; show: boolean }
  | { type: 'GM_SET_LEGEND_POSITION'; position: LegendPosition }
  | { type: 'GM_SET_CAPITALIZE_LEGEND'; capitalize: boolean }
  | { type: 'GM_SET_X_LABEL'; label: string }
  | { type: 'GM_SET_X_FORMAT'; format: XFormat }
  | { type: 'GM_SET_Y_LABEL'; label: string }
  | { type: 'GM_SET_SHOW_GRIDLINES'; show: boolean }
  | { type: 'GM_SET_CORNER_RADIUS'; radius: number }
  | { type: 'GM_SET_SHOW_FRAME'; show: boolean }
  | { type: 'GM_SET_ACTIVE_THEME'; themeId: string }
  | { type: 'GM_SET_CUSTOM_THEME'; theme: GraphTheme }
  | { type: 'GM_SET_SHOW_CUSTOMIZE'; show: boolean }
  | { type: 'GM_SET_EXPORT_FORMAT'; format: GraphOutputFormat }
  | { type: 'GM_LOAD_STATE'; state: Partial<GraphState> };
