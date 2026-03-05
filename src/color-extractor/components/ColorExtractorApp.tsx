import { useRef, useCallback, useEffect } from 'react';
import { ColorExtractorCanvas } from './ColorExtractorCanvas';
import { ColorExtractorSidebar } from './ColorExtractorSidebar';
import { SettingsPanel } from './panels/SettingsPanel';
import { PalettePanel } from './panels/PalettePanel';
import { ExportPanel } from './panels/ExportPanel';
import { useColorExtractorPersistence } from '../hooks/use-color-extractor-persistence';
import { useColorExtractorDispatch } from '../state/context';
import { loadImageFile } from '../../utils/image-io';

interface ColorExtractorAppProps {
  isNarrow: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  toolSwitcher: React.ReactNode;
  onRegisterReplace: (handler: () => void) => void;
}

export function ColorExtractorApp({ isNarrow, sidebarOpen, onCloseSidebar, toolSwitcher, onRegisterReplace }: ColorExtractorAppProps) {
  useColorExtractorPersistence();
  const dispatch = useColorExtractorDispatch();
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleReplaceClick = useCallback(() => {
    replaceInputRef.current?.click();
  }, []);

  // Register the replace handler with the parent Layout
  useEffect(() => {
    onRegisterReplace(handleReplaceClick);
  }, [onRegisterReplace, handleReplaceClick]);

  const handleReplaceInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const imageData = await loadImageFile(files[0]);
      dispatch({ type: 'CE_SET_SOURCE', imageData, fileName: files[0].name });
    }
    e.target.value = '';
  }, [dispatch]);

  const replaceInput = (
    <input
      ref={replaceInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={handleReplaceInput}
    />
  );

  if (isNarrow) {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {replaceInput}
        <main className="flex-1 overflow-hidden">
          <ColorExtractorCanvas />
        </main>
        {sidebarOpen && (
          <>
            <div className="absolute inset-0 z-40 bg-black/30" onClick={onCloseSidebar} />
            <div className="absolute inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto border-t-2 border-(--color-border) bg-(--color-bg-secondary)">
              <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-(--color-text-secondary)">Settings</span>
                <button onClick={onCloseSidebar} className="border border-(--color-border) p-1 text-(--color-text-secondary) hover:text-(--color-text)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              {toolSwitcher}
              <div className="flex flex-col gap-4 p-4">
                <SettingsPanel />
                <PalettePanel />
                <ExportPanel />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {replaceInput}
      <ColorExtractorSidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <ColorExtractorCanvas />
      </main>
    </div>
  );
}
