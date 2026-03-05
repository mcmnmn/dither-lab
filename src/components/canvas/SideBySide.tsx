import { useRef, useCallback, useEffect } from 'react';

interface SideBySideProps {
  original: ImageData;
  result: ImageData;
  zoom: number;
  panX: number;
  panY: number;
  bgColor: string;
}

export function SideBySide({ original, result, zoom, panX, panY, bgColor }: SideBySideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = useCallback((canvas: HTMLCanvasElement, imageData: ImageData, containerWidth: number, containerHeight: number) => {
    canvas.width = containerWidth;
    canvas.height = containerHeight;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const tmp = document.createElement('canvas');
    tmp.width = imageData.width;
    tmp.height = imageData.height;
    tmp.getContext('2d')!.putImageData(imageData, 0, 0);

    const drawW = imageData.width * zoom;
    const drawH = imageData.height * zoom;
    const x = (containerWidth - drawW) / 2 + panX;
    const y = (containerHeight - drawH) / 2 + panY;

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, drawW, drawH);
    ctx.drawImage(tmp, x, y, drawW, drawH);
  }, [zoom, panX, panY, bgColor]);

  const redraw = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const halfW = Math.floor(rect.width / 2) - 1;

    if (leftCanvasRef.current) drawCanvas(leftCanvasRef.current, original, halfW, rect.height);
    if (rightCanvasRef.current) drawCanvas(rightCanvasRef.current, result, halfW, rect.height);
  }, [original, result, drawCanvas]);

  useEffect(() => { redraw(); }, [redraw]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(redraw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redraw]);

  return (
    <div ref={containerRef} className="flex h-full w-full gap-0.5">
      <div className="relative flex-1">
        <canvas ref={leftCanvasRef} className="absolute inset-0" />
        <div className="absolute top-2 left-2 border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white">
          Original
        </div>
      </div>
      <div className="w-px bg-(--color-border)" />
      <div className="relative flex-1">
        <canvas ref={rightCanvasRef} className="absolute inset-0" />
        <div className="absolute top-2 right-2 border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white">
          Dithered
        </div>
      </div>
    </div>
  );
}
