import { useCallback } from 'react';
import { SettingsPanel } from './panels/SettingsPanel';
import { PalettePanel } from './panels/PalettePanel';
import { ExportPanel } from './panels/ExportPanel';
import { InputSection } from '../../components/sidebar/InputSection';
import { useColorExtractorDispatch } from '../state/context';
import { loadImageFile } from '../../utils/image-io';

export function ColorExtractorSidebar() {
  const dispatch = useColorExtractorDispatch();

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const imageData = await loadImageFile(file);
    dispatch({ type: 'CE_SET_SOURCE', imageData, fileName: file.name });
  }, [dispatch]);

  return (
    <aside className="flex w-[280px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-(--color-border) bg-(--color-bg-secondary) p-4">
      <InputSection
        onFiles={handleFiles}
        accept="image/*"
        formatHint="PNG, JPG, WebP, GIF"
      />
      <SettingsPanel />
      <PalettePanel />
      <ExportPanel />
    </aside>
  );
}
