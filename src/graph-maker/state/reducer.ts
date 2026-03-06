import type { GraphState, GraphAction } from './types';

export function graphReducer(state: GraphState, action: GraphAction): GraphState {
  switch (action.type) {
    case 'GM_SET_RAW_INPUT':
      return { ...state, rawInput: action.input };
    case 'GM_SET_PARSED_DATA':
      return { ...state, parsedData: action.data, parseError: action.error };
    case 'GM_SET_X_COLUMN':
      return { ...state, xColumn: action.column };
    case 'GM_SET_Y_COLUMNS':
      return { ...state, yColumns: action.columns };
    case 'GM_TOGGLE_Y_COLUMN': {
      const has = state.yColumns.includes(action.column);
      return {
        ...state,
        yColumns: has
          ? state.yColumns.filter(c => c !== action.column)
          : [...state.yColumns, action.column],
      };
    }
    case 'GM_SET_TRANSPOSE':
      return { ...state, transpose: action.transpose };
    case 'GM_SET_TITLE':
      return { ...state, title: action.title };
    case 'GM_SET_SUBTITLE':
      return { ...state, subtitle: action.subtitle };
    case 'GM_SET_WIDTH':
      return { ...state, width: action.width };
    case 'GM_SET_HEIGHT':
      return { ...state, height: action.height };
    case 'GM_SET_PADDING':
      return { ...state, [`padding${action.side[0].toUpperCase()}${action.side.slice(1)}`]: action.value };
    case 'GM_SET_CHART_TYPE':
      return { ...state, chartType: action.chartType };
    case 'GM_SET_LINE_WIDTH':
      return { ...state, lineWidth: action.lineWidth };
    case 'GM_SET_LINE_CAP':
      return { ...state, lineCap: action.lineCap };
    case 'GM_SET_SHOW_LEGEND':
      return { ...state, showLegend: action.show };
    case 'GM_SET_LEGEND_POSITION':
      return { ...state, legendPosition: action.position };
    case 'GM_SET_CAPITALIZE_LEGEND':
      return { ...state, capitalizeLegend: action.capitalize };
    case 'GM_SET_X_LABEL':
      return { ...state, xLabel: action.label };
    case 'GM_SET_X_FORMAT':
      return { ...state, xFormat: action.format };
    case 'GM_SET_Y_LABEL':
      return { ...state, yLabel: action.label };
    case 'GM_SET_SHOW_GRIDLINES':
      return { ...state, showGridlines: action.show };
    case 'GM_SET_CORNER_RADIUS':
      return { ...state, cornerRadius: action.radius };
    case 'GM_SET_SHOW_FRAME':
      return { ...state, showFrame: action.show };
    case 'GM_SET_ACTIVE_THEME':
      return { ...state, activeThemeId: action.themeId };
    case 'GM_SET_CUSTOM_THEME':
      return { ...state, customTheme: action.theme };
    case 'GM_SET_SHOW_CUSTOMIZE':
      return { ...state, showCustomize: action.show };
    case 'GM_SET_EXPORT_FORMAT':
      return { ...state, exportFormat: action.format };
    case 'GM_LOAD_STATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}
