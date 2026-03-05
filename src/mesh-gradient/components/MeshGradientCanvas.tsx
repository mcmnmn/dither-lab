import { useRef, useEffect, useCallback } from 'react';
import { useMeshGradientState, useMeshGradientDispatch } from '../state/context';
import { renderMeshGradient } from '../engine/render-mesh';

export function MeshGradientCanvas() {
  const state = useMeshGradientState();
  const dispatch = useMeshGradientDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Render gradient
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    renderMeshGradient(ctx, w, h, state.nodes, state.bgColor, state.effects);
  }, [state.nodes, state.bgColor, state.effects]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        sizeRef.current = { w: Math.floor(width), h: Math.floor(height) };

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(width) * dpr;
        canvas.height = Math.floor(height) * dpr;
        canvas.style.width = `${Math.floor(width)}px`;
        canvas.style.height = `${Math.floor(height)}px`;
        ctx.scale(dpr, dpr);

        renderMeshGradient(ctx, Math.floor(width), Math.floor(height), state.nodes, state.bgColor, state.effects);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [state.nodes, state.bgColor, state.effects]);

  // Drag handlers
  const handlePointerDown = useCallback((nodeId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dispatch({ type: 'MG_PUSH_HISTORY' });
    dispatch({ type: 'MG_SET_DRAGGING', id: nodeId });
  }, [dispatch]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!state.draggingNodeId) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    dispatch({ type: 'MG_UPDATE_NODE_POSITION', id: state.draggingNodeId, x, y });
  }, [state.draggingNodeId, dispatch]);

  const handlePointerUp = useCallback(() => {
    if (!state.draggingNodeId) return;
    dispatch({ type: 'MG_SET_DRAGGING', id: null });
  }, [state.draggingNodeId, dispatch]);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      style={{ background: state.darkPreview ? '#111' : '#eee' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Draggable node handles */}
      {state.nodes.map(node => (
        <div
          key={node.id}
          onPointerDown={e => handlePointerDown(node.id, e)}
          className="absolute z-10 -ml-3 -mt-3 h-6 w-6 cursor-grab rounded-full border-2 border-white/80 shadow-lg active:cursor-grabbing"
          style={{
            left: `${node.x * 100}%`,
            top: `${node.y * 100}%`,
            backgroundColor: node.color,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.3)`,
          }}
          title={node.color}
        />
      ))}
    </div>
  );
}
