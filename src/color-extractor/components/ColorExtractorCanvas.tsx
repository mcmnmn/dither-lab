import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useColorExtractorState, useColorExtractorDispatch } from '../state/context';
import { DropZone } from '../../components/common/DropZone';
import { loadImageFile } from '../../utils/image-io';
import { loadSampleImage } from '../../utils/sample-image';
import { rgbToHex } from '../../utils/color';
import { medianCut } from '../../palette/median-cut';

/** Find the pixel in the image closest to the given RGB color. */
function findClosestPixel(imageData: ImageData, rgb: [number, number, number]): { x: number; y: number } {
  const { data, width, height } = imageData;
  let bestDist = Infinity;
  let bestX = 0;
  let bestY = 0;
  const step = Math.max(1, Math.floor(Math.sqrt(width * height) / 100));
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const idx = (y * width + x) * 4;
      const dr = data[idx] - rgb[0];
      const dg = data[idx + 1] - rgb[1];
      const db = data[idx + 2] - rgb[2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        bestX = x;
        bestY = y;
        if (dist === 0) return { x: bestX, y: bestY };
      }
    }
  }
  return { x: bestX, y: bestY };
}

export function ColorExtractorCanvas() {
  const { sourceImage, colors, colorCount, hoveredColor, hoveredPosition } = useColorExtractorState();
  const dispatch = useColorExtractorDispatch();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // Handle file upload
  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const imageData = await loadImageFile(files[0]);
    dispatch({ type: 'CE_SET_SOURCE', imageData, fileName: files[0].name });
  }, [dispatch]);

  // Preload sample image when no source is set
  useEffect(() => {
    if (!sourceImage) {
      loadSampleImage().then(sample => {
        dispatch({ type: 'CE_SET_SOURCE', imageData: sample, fileName: 'sample.jpg' });
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-extract colors when source or count changes
  useEffect(() => {
    if (!sourceImage) return;
    dispatch({ type: 'CE_SET_EXTRACTING', extracting: true });
    const rawColors = medianCut(sourceImage, colorCount);
    const extracted = rawColors.map(rgb => {
      const typedRgb: [number, number, number] = [rgb[0], rgb[1], rgb[2]];
      const pos = findClosestPixel(sourceImage, typedRgb);
      return {
        rgb: typedRgb,
        hex: rgbToHex(rgb[0], rgb[1], rgb[2]),
        locked: false,
        imagePosition: pos,
      };
    });
    dispatch({ type: 'CE_SET_COLORS', colors: extracted });
  }, [sourceImage, colorCount, dispatch]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setCanvasSize({ w: width, h: height });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [sourceImage]);

  // Compute display geometry for image fitting
  const displayGeometry = useMemo(() => {
    if (!sourceImage || canvasSize.w === 0 || canvasSize.h === 0) return null;
    const imgAspect = sourceImage.width / sourceImage.height;
    const containerAspect = canvasSize.w / canvasSize.h;
    let displayW: number, displayH: number;
    if (imgAspect > containerAspect) {
      displayW = canvasSize.w;
      displayH = canvasSize.w / imgAspect;
    } else {
      displayH = canvasSize.h;
      displayW = canvasSize.h * imgAspect;
    }
    const offsetX = (canvasSize.w - displayW) / 2;
    const offsetY = (canvasSize.h - displayH) / 2;
    return { displayW, displayH, offsetX, offsetY };
  }, [sourceImage, canvasSize]);

  // Draw image on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sourceImage || !displayGeometry) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.w * dpr;
    canvas.height = canvasSize.h * dpr;
    canvas.style.width = `${canvasSize.w}px`;
    canvas.style.height = `${canvasSize.h}px`;

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasSize.w, canvasSize.h);

    const { displayW, displayH, offsetX, offsetY } = displayGeometry;

    const tmpCanvas = document.createElement('canvas');
    tmpCanvas.width = sourceImage.width;
    tmpCanvas.height = sourceImage.height;
    const tmpCtx = tmpCanvas.getContext('2d')!;
    tmpCtx.putImageData(sourceImage, 0, 0);
    ctx.drawImage(tmpCanvas, offsetX, offsetY, displayW, displayH);
  }, [sourceImage, canvasSize, displayGeometry]);

  // Map image coords to container-relative screen coords
  const imageToScreen = useCallback((imgX: number, imgY: number) => {
    if (!sourceImage || !displayGeometry) return null;
    const { displayW, displayH, offsetX, offsetY } = displayGeometry;
    const screenX = offsetX + (imgX / sourceImage.width) * displayW;
    const screenY = offsetY + (imgY / sourceImage.height) * displayH;
    return { x: screenX, y: screenY };
  }, [sourceImage, displayGeometry]);

  // Map container-relative mouse position to image coords
  const screenToImage = useCallback((containerX: number, containerY: number) => {
    if (!sourceImage || !displayGeometry) return null;
    const { displayW, displayH, offsetX, offsetY } = displayGeometry;
    const relX = containerX - offsetX;
    const relY = containerY - offsetY;
    if (relX < 0 || relY < 0 || relX >= displayW || relY >= displayH) return null;
    const imgX = Math.floor((relX / displayW) * sourceImage.width);
    const imgY = Math.floor((relY / displayH) * sourceImage.height);
    return { imgX, imgY };
  }, [sourceImage, displayGeometry]);

  const samplePixel = useCallback((imgX: number, imgY: number): [number, number, number] | null => {
    if (!sourceImage) return null;
    const idx = (imgY * sourceImage.width + imgX) * 4;
    return [sourceImage.data[idx], sourceImage.data[idx + 1], sourceImage.data[idx + 2]];
  }, [sourceImage]);

  // Coordinate mapping for mouse events on canvas
  const getImageCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!sourceImage || !canvasRef.current || !displayGeometry) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { displayW, displayH, offsetX, offsetY } = displayGeometry;
    const relX = mouseX - offsetX;
    const relY = mouseY - offsetY;
    if (relX < 0 || relY < 0 || relX >= displayW || relY >= displayH) return null;

    const imgX = Math.floor((relX / displayW) * sourceImage.width);
    const imgY = Math.floor((relY / displayH) * sourceImage.height);
    return { imgX, imgY, screenX: e.clientX, screenY: e.clientY };
  }, [sourceImage, displayGeometry]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null) return; // Don't show hover tooltip while dragging
    const coords = getImageCoords(e);
    if (!coords) {
      dispatch({ type: 'CE_SET_HOVERED_COLOR', rgb: null, position: null });
      return;
    }
    const rgb = samplePixel(coords.imgX, coords.imgY);
    if (rgb) {
      dispatch({ type: 'CE_SET_HOVERED_COLOR', rgb, position: { x: coords.screenX, y: coords.screenY } });
    }
  }, [getImageCoords, samplePixel, dispatch, draggingIndex]);

  const handleMouseLeave = useCallback(() => {
    dispatch({ type: 'CE_SET_HOVERED_COLOR', rgb: null, position: null });
  }, [dispatch]);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingIndex !== null) return; // Don't add color if we just finished dragging
    const coords = getImageCoords(e);
    if (!coords) return;
    const rgb = samplePixel(coords.imgX, coords.imgY);
    if (rgb) {
      dispatch({ type: 'CE_ADD_PICKED_COLOR', rgb, imagePosition: { x: coords.imgX, y: coords.imgY } });
    }
  }, [getImageCoords, samplePixel, dispatch, draggingIndex]);

  // Circle dragging handlers
  const handleCirclePointerDown = useCallback((e: React.PointerEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingIndex(index);
  }, []);

  const handleCirclePointerMove = useCallback((e: React.PointerEvent) => {
    if (draggingIndex === null) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const containerX = e.clientX - rect.left;
    const containerY = e.clientY - rect.top;

    const coords = screenToImage(containerX, containerY);
    if (!coords) return;

    const rgb = samplePixel(coords.imgX, coords.imgY);
    if (rgb) {
      dispatch({
        type: 'CE_UPDATE_COLOR',
        index: draggingIndex,
        rgb,
        imagePosition: { x: coords.imgX, y: coords.imgY },
      });
    }
  }, [draggingIndex, screenToImage, samplePixel, dispatch]);

  const handleCirclePointerUp = useCallback(() => {
    setDraggingIndex(null);
  }, []);

  if (!sourceImage) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <DropZone onFiles={handleFiles} accept="image/*" className="flex h-full w-full cursor-pointer items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-(--color-text-secondary)">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span className="text-xs uppercase tracking-wider">Drop image or click to upload</span>
          </div>
        </DropZone>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div ref={containerRef} className="dot-grid relative flex-1 min-h-0 overflow-hidden bg-(--color-bg)">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />

        {/* Circle markers for each palette color */}
        {colors.map((c, i) => {
          if (!c.imagePosition) return null;
          const screen = imageToScreen(c.imagePosition.x, c.imagePosition.y);
          if (!screen) return null;
          const isDragging = draggingIndex === i;
          return (
            <div
              key={i}
              className={`absolute flex items-center justify-center ${isDragging ? 'z-20 cursor-grabbing' : 'z-10 cursor-grab'}`}
              style={{
                left: screen.x - 16,
                top: screen.y - 16,
                width: 32,
                height: 32,
                touchAction: 'none',
              }}
              onPointerDown={(e) => handleCirclePointerDown(e, i)}
              onPointerMove={handleCirclePointerMove}
              onPointerUp={handleCirclePointerUp}
            >
              <div
                className={`rounded-full border-2 border-white transition-shadow ${isDragging ? 'h-9 w-9 shadow-[0_0_0_2px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.5)]' : 'h-7 w-7 shadow-[0_0_0_1px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.3)]'}`}
                style={{ backgroundColor: c.hex }}
              />
            </div>
          );
        })}

        {/* Hover tooltip */}
        {hoveredColor && hoveredPosition && draggingIndex === null && (
          <div
            className="pointer-events-none fixed z-50 flex items-center gap-2 border border-(--color-border) bg-(--color-bg-secondary) px-2 py-1 shadow-lg"
            style={{ left: hoveredPosition.x + 16, top: hoveredPosition.y + 16 }}
          >
            <div
              className="h-5 w-5 border border-(--color-border)"
              style={{ backgroundColor: rgbToHex(hoveredColor[0], hoveredColor[1], hoveredColor[2]) }}
            />
            <span className="font-mono text-[10px] uppercase text-(--color-text)">
              {rgbToHex(hoveredColor[0], hoveredColor[1], hoveredColor[2])}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
