import { useRef, useEffect, useState, useCallback } from 'react';
import { useAppDispatch } from '../../state/app-context';

interface GlbViewerProps {
  glbUrl: string;
  fileName: string;
}

/** 3D model viewer that renders GLB files and captures snapshots as ImageData */
export function GlbViewer({ glbUrl, fileName }: GlbViewerProps) {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const controlsRef = useRef<any>(null);
  const animIdRef = useRef<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let destroyed = false;

    (async () => {
      try {
        const THREE = await import('three');
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');

        if (destroyed) return;

        const rect = container.getBoundingClientRect();
        const w = rect.width || 800;
        const h = rect.height || 600;

        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
        camera.position.set(0, 1, 3);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controlsRef.current = controls;

        // Lighting
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 1);
        directional.position.set(5, 5, 5);
        scene.add(directional);
        const fill = new THREE.DirectionalLight(0xffffff, 0.3);
        fill.position.set(-3, 2, -5);
        scene.add(fill);

        // Load model
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(glbUrl);
        if (destroyed) return;

        scene.add(gltf.scene);

        // Center and scale model
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 2 / maxDim;
        gltf.scene.scale.setScalar(scale);
        gltf.scene.position.sub(center.multiplyScalar(scale));

        setLoading(false);

        // Render loop
        const animate = () => {
          if (destroyed) return;
          controls.update();
          renderer.render(scene, camera);
          animIdRef.current = requestAnimationFrame(animate);
        };
        animIdRef.current = requestAnimationFrame(animate);

        // Handle resize
        const observer = new ResizeObserver(() => {
          const r = container.getBoundingClientRect();
          if (r.width > 0 && r.height > 0) {
            camera.aspect = r.width / r.height;
            camera.updateProjectionMatrix();
            renderer.setSize(r.width, r.height);
          }
        });
        observer.observe(container);

      } catch (err) {
        if (!destroyed) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    })();

    return () => {
      destroyed = true;
      cancelAnimationFrame(animIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        const canvas = rendererRef.current.domElement;
        canvas.parentElement?.removeChild(canvas);
        rendererRef.current = null;
      }
      controlsRef.current?.dispose();
    };
  }, [glbUrl]);

  const captureSnapshot = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    // Force render
    renderer.render(scene, camera);

    const canvas = renderer.domElement as HTMLCanvasElement;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.canvas.width = w;
    ctx.canvas.height = h;
    ctx.drawImage(canvas, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);

    dispatch({ type: 'SET_SOURCE', imageData, file: null, fileName: fileName.replace('.glb', '.png') });
  }, [dispatch, fileName]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-(--color-bg)/80">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin border-2 border-(--color-accent) border-t-transparent" />
            <span className="text-xs font-medium text-(--color-text)">Loading 3D model...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-(--color-bg)">
          <div className="text-center">
            <div className="mb-2 text-2xl text-(--color-border)">[ ! ]</div>
            <p className="text-xs text-(--color-text-secondary)">Failed to load model: {error}</p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <button
          onClick={captureSnapshot}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 border border-(--color-border) bg-(--color-bg-secondary)/90 px-4 py-1.5 text-xs font-medium uppercase text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-bg-tertiary) transition-colors"
        >
          [ Capture Snapshot ]
        </button>
      )}
    </div>
  );
}
