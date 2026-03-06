import { useState, useMemo, useCallback, useLayoutEffect, useRef } from 'react';
import { useSvgAnimatorState, useSvgAnimatorDispatch } from '../state/context';
import { generateAnimation } from '../engine/animation-generator';
import { generateStandaloneSVG, generateSplitOutput, generateReactComponent, downloadSvgFile } from '../engine/output-generator';

type OutputTab = 'split' | 'standalone' | 'react';

export function OutputModal() {
  const state = useSvgAnimatorState();
  const dispatch = useSvgAnimatorDispatch();
  const {
    showOutputModal, parsedSvg, preset, duration, easing, loop, stagger, staggerDelay,
    staggerMode, intensity, transformOrigin, slideDirection, elementOverrides,
  } = state;
  const [tab, setTab] = useState<OutputTab>('split');
  const [copied, setCopied] = useState<string | null>(null);
  const [componentName, setComponentName] = useState('AnimatedIcon');

  // Hidden SVG for path length measurement
  const measureRef = useRef<HTMLDivElement>(null);
  const [pathLengths, setPathLengths] = useState<Map<number, number>>(new Map());

  const totalElements = parsedSvg?.animatableCount ?? 0;
  const animation = useMemo(() => {
    return generateAnimation({
      preset, duration, easing, loop, stagger, staggerDelay,
      staggerMode, intensity, transformOrigin, slideDirection, elementOverrides, totalElements,
    });
  }, [preset, duration, easing, loop, stagger, staggerDelay, staggerMode, intensity, transformOrigin, slideDirection, elementOverrides, totalElements]);

  // Measure path lengths from hidden SVG
  useLayoutEffect(() => {
    if (!showOutputModal || !parsedSvg || !measureRef.current) return;
    const lengths = new Map<number, number>();
    const allAnimatable = measureRef.current.querySelectorAll(
      'path, circle, rect, line, polyline, polygon, ellipse'
    );
    allAnimatable.forEach((el, i) => {
      if (el.tagName.toLowerCase() === 'path') {
        try {
          lengths.set(i, (el as SVGPathElement).getTotalLength());
        } catch { /* ignore */ }
      }
    });
    setPathLengths(lengths);
  }, [showOutputModal, parsedSvg]);

  const splitOutput = useMemo(() => {
    if (!parsedSvg) return null;
    return generateSplitOutput(parsedSvg.svgString, animation, pathLengths);
  }, [parsedSvg, animation, pathLengths]);

  const standaloneOutput = useMemo(() => {
    if (!parsedSvg) return null;
    return generateStandaloneSVG(parsedSvg.svgString, animation, pathLengths);
  }, [parsedSvg, animation, pathLengths]);

  const reactOutput = useMemo(() => {
    if (!parsedSvg) return null;
    return generateReactComponent(parsedSvg.svgString, animation, pathLengths, componentName);
  }, [parsedSvg, animation, pathLengths, componentName]);

  const handleCopy = useCallback(async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  const handleDownload = useCallback(() => {
    if (standaloneOutput) downloadSvgFile(standaloneOutput);
  }, [standaloneOutput]);

  if (!showOutputModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => dispatch({ type: 'SA_TOGGLE_EXPORT_MODAL' })}>
      <div
        className="flex max-h-[80vh] w-[600px] flex-col border-2 border-(--color-border) bg-(--color-bg)"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text)">Output</span>
          <button
            onClick={() => dispatch({ type: 'SA_TOGGLE_EXPORT_MODAL' })}
            className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-(--color-border)">
          <button
            onClick={() => setTab('split')}
            className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === 'split' ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            SVG + CSS
          </button>
          <button
            onClick={() => setTab('standalone')}
            className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === 'standalone' ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            Standalone SVG
          </button>
          <button
            onClick={() => setTab('react')}
            className={`flex-1 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
              tab === 'react' ? 'bg-(--color-accent) text-(--color-accent-text)' : 'text-(--color-text-secondary) hover:text-(--color-text)'
            }`}
          >
            React
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'split' && splitOutput && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">SVG Markup</span>
                  <button
                    onClick={() => handleCopy(splitOutput.svgMarkup, 'svg')}
                    className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
                  >
                    {copied === 'svg' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={splitOutput.svgMarkup}
                  rows={8}
                  className="w-full resize-none border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1.5 font-mono text-[10px] text-(--color-text) outline-none"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">CSS</span>
                  <button
                    onClick={() => handleCopy(splitOutput.css, 'css')}
                    className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
                  >
                    {copied === 'css' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={splitOutput.css}
                  rows={8}
                  className="w-full resize-none border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1.5 font-mono text-[10px] text-(--color-text) outline-none"
                />
              </div>
            </div>
          )}

          {tab === 'standalone' && standaloneOutput && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Self-contained SVG</span>
                <button
                  onClick={() => handleCopy(standaloneOutput, 'standalone')}
                  className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
                >
                  {copied === 'standalone' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea
                readOnly
                value={standaloneOutput}
                rows={16}
                className="w-full resize-none border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1.5 font-mono text-[10px] text-(--color-text) outline-none"
              />
            </div>
          )}

          {tab === 'react' && reactOutput && (
            <div className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">Component Name</span>
                </div>
                <input
                  type="text"
                  value={componentName}
                  onChange={e => setComponentName(e.target.value.replace(/[^a-zA-Z0-9]/g, '') || 'AnimatedIcon')}
                  className="w-full border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1 font-mono text-[10px] text-(--color-text) outline-none"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-(--color-text-secondary)">React Component</span>
                  <button
                    onClick={() => handleCopy(reactOutput, 'react')}
                    className="border border-(--color-border) px-2 py-0.5 text-[10px] uppercase tracking-wider text-(--color-text-secondary) hover:text-(--color-text)"
                  >
                    {copied === 'react' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={reactOutput}
                  rows={16}
                  className="w-full resize-none border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1.5 font-mono text-[10px] text-(--color-text) outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-(--color-border) px-4 py-3">
          <button
            onClick={handleDownload}
            className="w-full border border-(--color-accent) bg-(--color-accent) px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-(--color-accent-text) hover:opacity-90"
          >
            Download Animated SVG
          </button>
        </div>
      </div>

      {/* Hidden SVG for path length measurement */}
      {parsedSvg && (
        <div
          ref={measureRef}
          style={{ position: 'absolute', left: -9999, top: -9999, visibility: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: parsedSvg.svgString }}
        />
      )}
    </div>
  );
}
