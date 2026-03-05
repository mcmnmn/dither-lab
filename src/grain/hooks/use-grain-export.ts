import { useCallback } from 'react';
import { useAppState } from '../../state/app-context';
import type { ExportFormat } from '../../state/types';

export function useGrainExport(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const { fileName, exportFormat, exportScale } = useAppState();

  const download = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mimeMap: Record<ExportFormat, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      webp: 'image/webp',
      gif: 'image/png', // GIF export not natively supported — fallback to PNG
    };

    const extMap: Record<ExportFormat, string> = {
      png: '.png',
      jpg: '.jpg',
      webp: '.webp',
      gif: '.png',
    };

    const mime = mimeMap[exportFormat];
    const ext = extMap[exportFormat];
    const quality = (exportFormat === 'jpg' || exportFormat === 'webp') ? 0.92 : undefined;
    const baseName = fileName ? fileName.replace(/\.[^.]+$/, '') : 'effect-export';

    // Apply export scale
    if (exportScale > 1) {
      const scaled = document.createElement('canvas');
      scaled.width = canvas.width * exportScale;
      scaled.height = canvas.height * exportScale;
      const ctx = scaled.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);

      scaled.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
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
    } else {
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
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
    }
  }, [canvasRef, exportFormat, exportScale, fileName]);

  return { download };
}
