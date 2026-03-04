import { imageDataToBlob, downloadBlob } from './image-io';
import { imageDataToGifBlob } from './gif-export';
import { zipSync } from 'fflate';
import type { ExportFormat } from '../state/types';

function exportBlob(imageData: ImageData, format: ExportFormat, scale: number): Promise<Blob> {
  if (format === 'gif') {
    return Promise.resolve(imageDataToGifBlob(imageData, scale));
  }
  return imageDataToBlob(imageData, format, scale);
}

/**
 * Export a single dithered image.
 */
export async function exportSingle(
  imageData: ImageData,
  fileName: string,
  format: ExportFormat,
  scale: number,
  algorithmId: string,
  colorCount: number
) {
  const blob = await exportBlob(imageData, format, scale);
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const outName = `${baseName}_${algorithmId}_${colorCount}color.${format}`;
  downloadBlob(blob, outName);
}

/**
 * Export batch results as a ZIP file.
 */
export async function exportBatchAsZip(
  results: { fileName: string; imageData: ImageData }[],
  format: ExportFormat,
  scale: number,
  algorithmId: string,
  colorCount: number
) {
  const files: Record<string, Uint8Array> = {};

  for (const { fileName, imageData } of results) {
    const blob = await exportBlob(imageData, format, scale);
    const buffer = await blob.arrayBuffer();
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const outName = `${baseName}_${algorithmId}_${colorCount}color.${format}`;
    files[outName] = new Uint8Array(buffer);
  }

  const zipped = zipSync(files);
  const zipBlob = new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' });
  downloadBlob(zipBlob, `dither-lab-batch-${Date.now()}.zip`);
}
