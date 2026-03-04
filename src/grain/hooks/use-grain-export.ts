import { useCallback } from 'react';
import { useGrainState, useGrainDispatch } from '../state/grain-context';
import { useAppState } from '../../state/app-context';
import type { GrainExportFormat } from '../state/types';

export function useGrainExport(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { exportFormat } = useGrainState();
  const { fileName } = useAppState();
  const dispatch = useGrainDispatch();

  const setFormat = useCallback(
    (format: GrainExportFormat) => {
      dispatch({ type: 'GRAIN_SET_EXPORT_FORMAT', format });
    },
    [dispatch]
  );

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeMap: Record<GrainExportFormat, string> = {
      png: 'image/png',
      jpeg: 'image/jpeg',
      gif: 'image/png', // GIF export not supported via canvas — fallback to PNG
    };

    const extMap: Record<GrainExportFormat, string> = {
      png: '.png',
      jpeg: '.jpg',
      gif: '.png',
    };

    const mime = mimeMap[exportFormat];
    const ext = extMap[exportFormat];
    const quality = exportFormat === 'jpeg' ? 0.92 : undefined;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'grain-export';
        a.href = url;
        a.download = `${baseName}${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      mime,
      quality
    );
  }, [canvasRef, exportFormat, fileName]);

  return { exportFormat, setFormat, download };
}
