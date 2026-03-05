import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { Sidebar } from '../sidebar/Sidebar';
import { PreviewCanvas } from '../canvas/PreviewCanvas';
import { BatchPanel } from '../batch/BatchPanel';
import { ToolPlaceholder } from './ToolPlaceholder';
import { GrainProvider } from '../../grain/state/grain-context';
import { GrainApp } from '../../grain/components/GrainApp';
import { loadImageFile } from '../../utils/image-io';
import { detectMediaType, loadVideoFile, MEDIA_ACCEPT } from '../../utils/media-io';
import type { ThemeId } from '../../state/types';
import { TOOLS, getToolById } from '../../state/tools';

const THEME_ORDER: ThemeId[] = ['butterlite', 'noir', 'vt320', 'cassette'];
const THEME_LABELS: Record<ThemeId, string> = {
  butterlite: 'ButterLite',
  noir: 'Noir',
  vt320: 'VT320',
  cassette: 'Cassette',
};

const base = import.meta.env.BASE_URL;
const THEME_LOGOS: Record<ThemeId, string> = {
  butterlite: `${base}givebutter-logo.svg`,
  noir: `${base}givebutter-logo-noir.svg`,
  vt320: `${base}givebutter-logo-vt320.svg`,
  cassette: `${base}givebutter-logo-cassette.svg`,
};

export function Layout() {
  const state = useAppState();
  const { mode, theme, activeTool } = state;
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsNarrow(e.matches);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close sidebar when switching to wide layout
  useEffect(() => {
    if (!isNarrow) setSidebarOpen(false);
  }, [isNarrow]);

  const handleReplaceClick = useCallback(() => {
    replaceInputRef.current?.click();
  }, []);

  const handleReplaceInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const file = files[0];
      const mediaType = detectMediaType(file);
      if (mediaType === 'video') {
        const videoElement = await loadVideoFile(file);
        dispatch({ type: 'SET_VIDEO_SOURCE', videoElement, file, fileName: file.name });
      } else if (mediaType === 'glb') {
        const glbUrl = URL.createObjectURL(file);
        dispatch({ type: 'SET_GLB_SOURCE', glbUrl, file, fileName: file.name });
      } else {
        const imageData = await loadImageFile(file);
        dispatch({ type: 'SET_SOURCE', imageData, file, fileName: file.name });
      }
    }
    e.target.value = '';
  }, [dispatch]);

  return (
    <div className="flex h-full flex-col">
      {/* Hidden file input for Replace */}
      <input
        ref={replaceInputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        className="hidden"
        onChange={handleReplaceInput}
      />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-bg-secondary) px-4 py-2">
        <div className="flex items-center gap-3">
          {isNarrow && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="border border-(--color-border) p-1.5 text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <img src={THEME_LOGOS[theme]} alt="Givebutter" width="20" height="20" />
          {!isNarrow && (
            <nav className="flex">
              {TOOLS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: tool.id })}
                  className={`px-3 py-1 text-xs font-medium uppercase transition-colors ${
                    activeTool === tool.id
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {tool.shortLabel}
                </button>
              ))}
            </nav>
          )}
          {isNarrow && (
            <h1 className="text-xs font-bold uppercase tracking-widest text-(--color-text)">
              {getToolById(activeTool).shortLabel}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle (dither only) */}
          {activeTool === 'dither' && (
            <div className="flex border border-(--color-border)">
              {(['single', 'batch'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => dispatch({ type: 'SET_MODE', mode: m })}
                  className={`px-3 py-1 text-xs font-medium uppercase transition-colors ${
                    mode === m
                      ? 'bg-(--color-accent) text-(--color-accent-text)'
                      : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* Replace image button */}
          {(activeTool === 'dither' || activeTool === 'grain') && (
            <button
              onClick={handleReplaceClick}
              className="border border-(--color-border) px-3 py-1 text-xs font-medium uppercase text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
              title="Replace image"
            >
              Replace
            </button>
          )}

          {/* Theme cycle */}
          <button
            onClick={() => {
              const idx = THEME_ORDER.indexOf(theme);
              const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
              dispatch({ type: 'SET_THEME', theme: next });
            }}
            className="border border-(--color-border) p-1.5 text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
            title={`Theme: ${THEME_LABELS[theme]}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5"/>
              <circle cx="17.5" cy="10.5" r="2.5"/>
              <circle cx="8.5" cy="7.5" r="2.5"/>
              <circle cx="6.5" cy="12.5" r="2.5"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      {activeTool === 'grain' ? (
        <GrainProvider>
          <GrainApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={
              <div className="border-b border-(--color-border) px-4 py-2">
                <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Tools</span>
                <div className="flex gap-2">
                  {TOOLS.map(tool => (
                    <button key={tool.id} onClick={() => { dispatch({ type: 'SET_ACTIVE_TOOL', tool: tool.id }); setSidebarOpen(false); }} className={`px-3 py-1 text-xs font-medium uppercase transition-colors ${activeTool === tool.id ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'}`}>
                      {tool.shortLabel}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
        </GrainProvider>
      ) : isNarrow ? (
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden">
            {activeTool === 'dither'
              ? (mode === 'single' ? <PreviewCanvas /> : <BatchPanel />)
              : <ToolPlaceholder toolId={activeTool} />
            }
          </main>
          {sidebarOpen && (
            <>
              <div className="absolute inset-0 z-40 bg-black/30" onClick={() => setSidebarOpen(false)} />
              <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t-2 border-(--color-border) bg-(--color-bg-secondary)">
                <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text-secondary)">Settings</span>
                  <button onClick={() => setSidebarOpen(false)} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
                <div className="border-b border-(--color-border) px-4 py-2">
                  <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Tools</span>
                  <div className="flex gap-2">
                    {TOOLS.map(tool => (
                      <button key={tool.id} onClick={() => { dispatch({ type: 'SET_ACTIVE_TOOL', tool: tool.id }); setSidebarOpen(false); }} className={`px-3 py-1 text-xs font-medium uppercase transition-colors ${activeTool === tool.id ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'}`}>
                        {tool.shortLabel}
                      </button>
                    ))}
                  </div>
                </div>
                {activeTool === 'dither' && <Sidebar />}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {activeTool === 'dither' && <Sidebar />}
          <main className="flex-1 overflow-hidden">
            {activeTool === 'dither'
              ? (mode === 'single' ? <PreviewCanvas /> : <BatchPanel />)
              : <ToolPlaceholder toolId={activeTool} />
            }
          </main>
        </div>
      )}
    </div>
  );
}
