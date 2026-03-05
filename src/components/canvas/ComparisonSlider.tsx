import { useRef, useState, useCallback, useEffect } from 'react';

interface ComparisonSliderProps {
  original: ImageData;
  result: ImageData;
  zoom: number;
  panX: number;
  panY: number;
  bgColor: string;
}

export function ComparisonSlider({ original, result, zoom, panX, panY, bgColor }: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const resultCanvasRef = useRef<HTMLCanvasElement>(null);
  const [sliderPos, setSliderPos] = useState(0.5);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const isDragging = useRef(false);

  // Draw a single canvas. refW/refH are the "reference" dimensions (result image)
  // so both canvases render at the same visual size regardless of their pixel dimensions.
  const drawCanvas = useCallback((
    canvas: HTMLCanvasElement,
    imageData: ImageData,
    cw: number,
    ch: number,
    refW: number,
    refH: number,
  ) => {
    canvas.width = cw;
    canvas.height = ch;

    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = false;

    const tmp = document.createElement('canvas');
    tmp.width = imageData.width;
    tmp.height = imageData.height;
    tmp.getContext('2d')!.putImageData(imageData, 0, 0);

    // Use reference dimensions so both images draw at the same size
    const drawW = refW * zoom;
    const drawH = refH * zoom;
    const x = (cw - drawW) / 2 + panX;
    const y = (ch - drawH) / 2 + panY;

    ctx.fillStyle = bgColor;
    ctx.fillRect(x, y, drawW, drawH);
    ctx.drawImage(tmp, x, y, drawW, drawH);
  }, [zoom, panX, panY, bgColor]);

  const redraw = useCallback((cw: number, ch: number) => {
    // Use result dimensions as the reference so both images render identically sized
    const refW = result.width;
    const refH = result.height;
    if (originalCanvasRef.current) drawCanvas(originalCanvasRef.current, original, cw, ch, refW, refH);
    if (resultCanvasRef.current) drawCanvas(resultCanvasRef.current, result, cw, ch, refW, refH);
  }, [drawCanvas, original, result]);

  // Draw both canvases when data or zoom/pan changes
  useEffect(() => {
    if (containerSize.w > 0 && containerSize.h > 0) {
      redraw(containerSize.w, containerSize.h);
    }
  }, [containerSize, redraw]);

  // Track container size and redraw on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        setContainerSize({ w, h });
      }
    });
    observer.observe(container);
    // Set initial size
    const rect = container.getBoundingClientRect();
    setContainerSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
    return () => observer.disconnect();
  }, []);

  // Mouse handlers — stopPropagation prevents parent zoom-pan from firing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = true;
  }, []);
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    isDragging.current = false;
  }, []);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);

  // Touch handlers — stopPropagation prevents parent zoom-pan from firing
  const updatePosFromTouch = useCallback((e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (touch) {
      setSliderPos(Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width)));
    }
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = true;
    updatePosFromTouch(e);
  }, [updatePosFromTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    if (!isDragging.current) return;
    updatePosFromTouch(e);
  }, [updatePosFromTouch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    isDragging.current = false;
  }, []);

  const { w, h } = containerSize;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full cursor-col-resize select-none overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { isDragging.current = false; }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Original (full, underneath) — explicit size, no CSS stretching */}
      <canvas
        ref={originalCanvasRef}
        style={{ position: 'absolute', top: 0, left: 0, width: `${w}px`, height: `${h}px` }}
      />

      {/* Result (clipped to slider position) — same canvas size, clipped by parent div */}
      <div
        className="absolute top-0 left-0 overflow-hidden"
        style={{ width: `${sliderPos * w}px`, height: `${h}px` }}
      >
        <canvas
          ref={resultCanvasRef}
          style={{ position: 'absolute', top: 0, left: 0, width: `${w}px`, height: `${h}px` }}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${sliderPos * 100}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black/30 backdrop-blur-sm" />
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white">
        Dithered
      </div>
      <div className="absolute top-2 right-2 border border-white/20 bg-black/60 px-2 py-0.5 text-xs text-white">
        Original
      </div>
    </div>
  );
}
