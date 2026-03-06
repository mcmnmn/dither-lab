import { useState, useCallback, type RefObject } from 'react';
import { useGraphState } from '../state/context';
import { THEMES } from '../state/themes';
import { ChartRenderer } from './ChartRenderer';

const ZOOM_STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4];

interface GraphPreviewProps {
  svgRef: RefObject<SVGSVGElement | null>;
}

export function GraphPreview({ svgRef }: GraphPreviewProps) {
  const state = useGraphState();
  const [canvasZoom, setCanvasZoom] = useState(1);

  const theme = THEMES[state.activeThemeId] ?? THEMES['Blueberry'];

  const zoomIn = useCallback(() => {
    setCanvasZoom(z => {
      const next = ZOOM_STEPS.find(s => s > z);
      return next ?? z;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasZoom(z => {
      const prev = [...ZOOM_STEPS].reverse().find(s => s < z);
      return prev ?? z;
    });
  }, []);

  const resetZoom = useCallback(() => setCanvasZoom(1), []);

  return (
    <div className="dot-grid flex flex-1 flex-col overflow-hidden bg-(--color-bg)">
      {/* Chart preview area */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4">
        {state.parsedData ? (
          <div
            className="shadow-lg"
            style={{
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center center',
              maxWidth: '100%',
            }}
          >
            <ChartRenderer
              ref={svgRef}
              data={state.parsedData}
              xColumn={state.xColumn}
              yColumns={state.yColumns}
              chartType={state.chartType}
              theme={theme}
              width={state.width}
              height={state.height}
              title={state.title}
              subtitle={state.subtitle}
              paddingTop={state.paddingTop}
              paddingRight={state.paddingRight}
              paddingBottom={state.paddingBottom}
              paddingLeft={state.paddingLeft}
              lineWidth={state.lineWidth}
              lineCap={state.lineCap}
              showLegend={state.showLegend}
              legendPosition={state.legendPosition}
              capitalizeLegend={state.capitalizeLegend}
              xLabel={state.xLabel}
              xFormat={state.xFormat}
              yLabel={state.yLabel}
              showGridlines={state.showGridlines}
              cornerRadius={state.cornerRadius}
              showFrame={state.showFrame}
            />
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-1 font-mono text-lg text-(--color-border)">[ ? ]</div>
            <p className="font-mono text-xs text-(--color-text-secondary)">
              {state.parseError || 'Paste CSV data in the sidebar to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Zoom toolbar */}
      <div className="flex items-center justify-end border-t border-(--color-border) bg-(--color-bg-secondary) px-3 py-2">
        <div className="flex items-center gap-1">
          <button onClick={zoomOut} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">-</button>
          <span className="min-w-[3rem] text-center text-xs tabular-nums text-(--color-text-secondary)">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button onClick={zoomIn} className="border border-(--color-border) px-1.5 py-0.5 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">+</button>
          <button onClick={resetZoom} className="border border-(--color-border) px-2 py-1 text-xs text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)">
            Fit
          </button>
        </div>
      </div>
    </div>
  );
}
