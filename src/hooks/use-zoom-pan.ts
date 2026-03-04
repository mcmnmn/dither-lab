import { useCallback, useRef, type WheelEvent, type MouseEvent } from 'react';
import { useAppState, useAppDispatch } from '../state/app-context';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 32;

export function useZoomPan() {
  const { zoom, panX, panY } = useAppState();
  const dispatch = useAppDispatch();
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * delta));
    dispatch({ type: 'SET_ZOOM', zoom: newZoom });
  }, [zoom, dispatch]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    dispatch({ type: 'SET_PAN', x: panX + dx, y: panY + dy });
  }, [panX, panY, dispatch]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const resetView = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: 1 });
    dispatch({ type: 'SET_PAN', x: 0, y: 0 });
  }, [dispatch]);

  const zoomIn = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: Math.min(MAX_ZOOM, zoom * 1.5) });
  }, [zoom, dispatch]);

  const zoomOut = useCallback(() => {
    dispatch({ type: 'SET_ZOOM', zoom: Math.max(MIN_ZOOM, zoom / 1.5) });
  }, [zoom, dispatch]);

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetView,
    zoomIn,
    zoomOut,
  };
}
