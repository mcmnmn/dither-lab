import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../state/app-context';
import { Sidebar } from '../sidebar/Sidebar';
import { PreviewCanvas } from '../canvas/PreviewCanvas';
import { BatchPanel } from '../batch/BatchPanel';
import { GrainProvider } from '../../grain/state/grain-context';
import { GrainApp } from '../../grain/components/GrainApp';
import { ColorExtractorProvider } from '../../color-extractor/state/context';
import { ColorExtractorApp } from '../../color-extractor/components/ColorExtractorApp';
import { CampaignGeneratorProvider } from '../../campaign-generator/state/context';
import { CampaignGeneratorApp } from '../../campaign-generator/components/CampaignGeneratorApp';
import { MeshGradientProvider } from '../../mesh-gradient/state/context';
import { MeshGradientApp } from '../../mesh-gradient/components/MeshGradientApp';
import { SvgAnimatorProvider } from '../../svg-animator/state/context';
import { SvgAnimatorApp } from '../../svg-animator/components/SvgAnimatorApp';
import { ResourcesProvider } from '../../resources/state/context';
import { ResourcesApp } from '../../resources/components/ResourcesApp';
import { FeedbackModal } from '../feedback/FeedbackModal';
import type { ThemeId } from '../../state/types';
import { TOOLS, getToolById, isEffectTool, toGrainEffectId } from '../../state/tools';

const THEME_ORDER: ThemeId[] = ['butterlite', 'noir', 'vt320'];
const THEME_LABELS: Record<ThemeId, string> = {
  butterlite: 'ButterLite',
  noir: 'Noir',
  vt320: 'VT320',
};

const base = import.meta.env.BASE_URL;
const THEME_LOGOS: Record<ThemeId, string> = {
  butterlite: `${base}givebutter-logo.svg`,
  noir: `${base}givebutter-logo-noir.svg`,
  vt320: `${base}givebutter-logo-vt320.svg`,
};

const THEME_WORDMARK_COLORS: Record<ThemeId, string> = {
  butterlite: '#1b1b1b',
  noir: '#ffffff',
  vt320: '#ffb000',
};

export function Layout() {
  const state = useAppState();
  const { mode, theme, activeTool } = state;
  const dispatch = useAppDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

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

  const isEffect = isEffectTool(activeTool);

  const toolSwitcher = (
    <div className="border-b border-(--color-border) px-4 py-2">
      <span className="mb-1 block text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Tools</span>
      <div className="flex flex-wrap gap-1">
        {TOOLS.filter(t => t.available).map(tool => (
          <button key={tool.id} onClick={() => { dispatch({ type: 'SET_ACTIVE_TOOL', tool: tool.id }); setSidebarOpen(false); }} className={`px-2 py-1 text-xs font-medium uppercase transition-colors ${activeTool === tool.id ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary)'}`}>
            {tool.shortLabel}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-bg-secondary) px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          {isNarrow && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0 border border-(--color-border) p-1.5 text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}
          <img src={THEME_LOGOS[theme]} alt="Givebutter" width="20" height="20" className="flex-shrink-0" />
          <svg width="64" height="12" viewBox="0 0 64 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-1 flex-shrink-0">
            <path d="M4.64 11.456C3.755 11.456 3.088 11.184 2.64 10.64V11.328H0V0H2.64V3.904C3.12 3.392 3.803 3.136 4.688 3.136C5.83 3.136 6.736 3.51 7.408 4.256C8.08 5.003 8.416 6.016 8.416 7.296C8.416 8.587 8.075 9.605 7.392 10.352C6.72 11.088 5.803 11.456 4.64 11.456ZM2.96 8.688C3.27 9.04 3.675 9.216 4.176 9.216C4.677 9.216 5.077 9.04 5.376 8.688C5.685 8.336 5.84 7.872 5.84 7.296C5.84 6.72 5.685 6.256 5.376 5.904C5.077 5.552 4.677 5.376 4.176 5.376C3.675 5.376 3.27 5.552 2.96 5.904C2.651 6.256 2.496 6.72 2.496 7.296C2.496 7.872 2.651 8.336 2.96 8.688ZM16.95 3.264V11.328H14.31V10.4C13.787 11.104 12.998 11.456 11.942 11.456C11.035 11.456 10.31 11.19 9.766 10.656C9.222 10.112 8.95 9.392 8.95 8.496V3.264H11.59V7.776C11.59 8.181 11.702 8.507 11.926 8.752C12.161 8.997 12.465 9.12 12.838 9.12C13.82 9.12 14.31 8.347 14.31 6.8V3.264H16.95ZM23.132 11.232C22.716 11.381 22.274 11.456 21.804 11.456C20.823 11.456 20.028 11.2 19.42 10.688C18.823 10.176 18.524 9.44 18.524 8.48V5.44H17.292V3.264H18.524V.96H21.164V3.264H23.068V5.44H21.164V8.064C21.164 8.395 21.244 8.661 21.404 8.864C21.564 9.056 21.783 9.152 22.06 9.152C22.412 9.152 22.706 9.093 22.94 8.976L23.132 11.232ZM28.801 11.232C28.385 11.381 27.942 11.456 27.473 11.456C26.492 11.456 25.697 11.2 25.089 10.688C24.492 10.176 24.193 9.44 24.193 8.48V5.44H22.961V3.264H24.193V.96H26.833V3.264H28.737V5.44H26.833V8.064C26.833 8.395 26.913 8.661 27.073 8.864C27.233 9.056 27.452 9.152 27.729 9.152C28.081 9.152 28.374 9.093 28.609 8.976L28.801 11.232ZM36.985 7.136C36.985 7.52 36.974 7.84 36.953 8.096H31.369C31.593 8.885 32.142 9.28 33.017 9.28C33.347 9.28 33.63 9.205 33.865 9.056C34.11 8.896 34.275 8.677 34.361 8.4L36.841 9.088C36.595 9.835 36.126 10.416 35.433 10.832C34.739 11.248 33.907 11.456 32.937 11.456C32.243 11.456 31.619 11.333 31.065 11.088C30.51 10.832 30.067 10.501 29.737 10.096C29.406 9.68 29.15 9.232 28.969 8.752C28.798 8.272 28.713 7.787 28.713 7.296C28.713 6.795 28.787 6.31 28.937 5.84C29.097 5.36 29.331 4.917 29.641 4.512C29.95 4.096 30.371 3.765 30.905 3.52C31.449 3.264 32.067 3.136 32.761 3.136C33.486 3.136 34.131 3.264 34.697 3.52C35.262 3.765 35.705 4.096 36.025 4.512C36.345 4.917 36.585 5.344 36.745 5.792C36.905 6.24 36.985 6.688 36.985 7.136ZM31.353 6.272H34.137C34.115 5.91 33.987 5.616 33.753 5.392C33.529 5.168 33.198 5.056 32.761 5.056C32.014 5.056 31.545 5.461 31.353 6.272ZM43.164 5.808C42.908 5.68 42.572 5.616 42.156 5.616C41.59 5.616 41.116 5.84 40.732 6.288C40.348 6.736 40.156 7.461 40.156 8.464V11.328H37.516V3.264H40.156V4.592C40.326 4.187 40.636 3.845 41.084 3.568C41.542 3.28 42.012 3.136 42.492 3.136C42.822 3.136 43.1 3.179 43.324 3.264L43.164 5.808ZM43.544 11.328V0H46.184V11.328H43.544ZM50.303 3.136C51.476 3.136 52.399 3.435 53.071 4.032C53.753 4.619 54.095 5.493 54.095 6.656V11.328H51.535V10.416C51.3 10.725 50.985 10.976 50.591 11.168C50.196 11.36 49.796 11.456 49.391 11.456C48.623 11.456 47.988 11.227 47.487 10.768C46.985 10.299 46.735 9.723 46.735 9.04C46.735 7.483 47.86 6.581 50.111 6.336L51.535 6.176C51.535 5.824 51.423 5.552 51.199 5.36C50.985 5.157 50.687 5.056 50.303 5.056C49.972 5.056 49.695 5.157 49.471 5.36C49.247 5.552 49.119 5.819 49.087 6.16L46.783 5.744C46.921 4.955 47.321 4.325 47.983 3.856C48.644 3.376 49.417 3.136 50.303 3.136ZM50.079 9.616C50.527 9.616 50.884 9.451 51.151 9.12C51.417 8.779 51.545 8.405 51.535 8L50.047 8.192C49.791 8.224 49.593 8.315 49.455 8.464C49.316 8.603 49.247 8.763 49.247 8.944C49.247 9.136 49.316 9.296 49.455 9.424C49.604 9.552 49.812 9.616 50.079 9.616ZM59.662 11.456C58.777 11.456 58.11 11.184 57.662 10.64V11.328H55.022V0H57.662V3.904C58.142 3.392 58.825 3.136 59.71 3.136C60.851 3.136 61.758 3.51 62.43 4.256C63.102 5.003 63.438 6.016 63.438 7.296C63.438 8.587 63.097 9.605 62.414 10.352C61.742 11.088 60.825 11.456 59.662 11.456ZM57.982 8.688C58.291 9.04 58.697 9.216 59.198 9.216C59.699 9.216 60.099 9.04 60.398 8.688C60.707 8.336 60.862 7.872 60.862 7.296C60.862 6.72 60.707 6.256 60.398 5.904C60.099 5.552 59.699 5.376 59.198 5.376C58.697 5.376 58.291 5.552 57.982 5.904C57.673 6.256 57.518 6.72 57.518 7.296C57.518 7.872 57.673 8.336 57.982 8.688Z" fill={THEME_WORDMARK_COLORS[theme]} />
          </svg>
          {!isNarrow && (
            <nav className="flex overflow-x-auto">
              {TOOLS.filter(t => t.available).map(tool => (
                <button
                  key={tool.id}
                  onClick={() => dispatch({ type: 'SET_ACTIVE_TOOL', tool: tool.id })}
                  className={`whitespace-nowrap px-3 py-1 text-xs font-medium uppercase transition-colors ${
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
            <h1 className="text-xs font-bold uppercase tracking-widest text-(--color-text) truncate">
              {getToolById(activeTool).shortLabel}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Theme cycle */}
          <button
            onClick={() => {
              const idx = THEME_ORDER.indexOf(theme);
              const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
              dispatch({ type: 'SET_THEME', theme: next });
            }}
            className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
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

          <button
            onClick={() => setFeedbackOpen(true)}
            className="border border-(--color-border) px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-(--color-text-secondary) transition-colors hover:bg-(--color-bg-tertiary) hover:text-(--color-text)"
          >
            Feedback
          </button>
        </div>

        <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </header>

      {/* Main content */}
      {activeTool === 'resources' ? (
        <ResourcesProvider>
          <ResourcesApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </ResourcesProvider>
      ) : activeTool === 'svg-animator' ? (
        <SvgAnimatorProvider>
          <SvgAnimatorApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </SvgAnimatorProvider>
      ) : activeTool === 'mesh-gradient' ? (
        <MeshGradientProvider>
          <MeshGradientApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </MeshGradientProvider>
      ) : activeTool === 'campaign-generator' ? (
        <CampaignGeneratorProvider>
          <CampaignGeneratorApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </CampaignGeneratorProvider>
      ) : activeTool === 'color-extractor' ? (
        <ColorExtractorProvider>
          <ColorExtractorApp
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </ColorExtractorProvider>
      ) : isEffect ? (
        <GrainProvider>
          <GrainApp
            effectId={toGrainEffectId(activeTool)}
            isNarrow={isNarrow}
            sidebarOpen={sidebarOpen}
            onCloseSidebar={() => setSidebarOpen(false)}
            toolSwitcher={toolSwitcher}
          />
        </GrainProvider>
      ) : isNarrow ? (
        <div className="relative flex flex-1 flex-col overflow-hidden">
          <main className="flex-1 overflow-hidden">
            {mode === 'single' ? <PreviewCanvas /> : <BatchPanel />}
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
                {toolSwitcher}
                <Sidebar />
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            {mode === 'single' ? <PreviewCanvas /> : <BatchPanel />}
          </main>
        </div>
      )}
    </div>
  );
}
