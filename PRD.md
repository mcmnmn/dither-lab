# Dither Lab — Product Requirements Document

## Context

The creative team needs an internal tool for applying dithering effects to images. Currently, team members rely on a patchwork of Photoshop actions, outdated desktop utilities, and manual workflows. This tool consolidates dithering into a single, browser-based application that requires no installation, runs entirely client-side, and supports the full range of dithering techniques the team uses — from retro pixel art aesthetics to print-ready color reduction.

---

## Goals

- **Zero friction** — open a URL, drag an image, start dithering. No accounts, no servers, no installs.
- **Full algorithm coverage** — every major dithering algorithm, plus the ability to define custom matrices.
- **Real-time preview** — instant visual feedback as parameters change.
- **Batch capability** — process dozens of images with the same settings in one go.
- **Client-side only** — all processing happens in the browser. No images leave the machine.

---

## Key Decisions

| Decision | Choice | Notes |
|---|---|---|
| Deployment | Static hosting (Vercel/Netlify/S3) | Push to deploy, accessible via URL |
| Theme | Light + dark toggle | Respects system preference, toggle in header |
| Persistence | Full (localStorage) | Settings, custom palettes, custom matrices, recent files |
| Team size | Small (2-10) | No analytics or feature flags needed |
| Large image handling | Downscaled preview, full-res export | Preview capped for speed; export always full resolution |
| Default comparison view | Slider wipe | Most intuitive for before/after |
| Algorithm selector | Grouped dropdown | Categories: Error Diffusion, Ordered, Other |
| Custom matrix I/O | Clipboard JSON + file import/export | Both methods supported |
| Batch settings | Same settings for all images | Single global configuration per batch run |
| Onboarding | Sample image + tooltips | Pre-loaded sample on first visit, tooltips on key controls |
| Batch file naming | Original name + suffix | e.g., `photo_floyd-steinberg_4color.png` |
| Accessibility | Basic | Keyboard nav, sufficient contrast, semantic HTML |

---

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **React 18 + TypeScript** | Mature ecosystem, concurrent rendering, strong typing |
| Build | **Vite** | Fast dev server, optimized production builds |
| Styling | **Tailwind CSS** | Rapid UI development, consistent design tokens |
| Image processing | **Canvas API + OffscreenCanvas** | Error-diffusion algorithms are sequential; Canvas is the right fit |
| Background processing | **Web Workers (pool)** | Non-blocking batch processing across multiple workers |
| GIF export | **gifenc** | 5KB, maintained, designed for palette-indexed images |
| ZIP (batch export) | **fflate** | 8KB gzipped, 2-5x faster than JSZip |
| State management | **useReducer + Context** | Single clear state shape; no external library needed |

---

## Architecture

### File Structure

```
src/
  algorithms/
    error-diffusion/
      common.ts           # Shared error-diffusion loop with configurable kernel
      floyd-steinberg.ts   # Kernel definition + export
      atkinson.ts
      stucki.ts
      burkes.ts
      sierra.ts
      jarvis-judice-ninke.ts
    ordered/
      bayer.ts             # Generates Bayer matrices of any size
      ordered-dither.ts    # Applies ordered dithering with a given matrix
    threshold.ts
    random.ts
    types.ts               # Shared algorithm interfaces
    index.ts               # Registry: maps algorithm names to implementations

  palette/
    median-cut.ts          # Color quantization
    presets.ts             # Built-in palette definitions
    types.ts

  services/
    dither-engine.ts       # Orchestrates: takes image + settings, returns result
    worker-pool.ts         # Manages Web Worker lifecycle and job queue
    dither.worker.ts       # Web Worker entry point

  components/
    app/          App.tsx, Layout.tsx
    sidebar/      Sidebar.tsx, AlgorithmSelector.tsx, PaletteControls.tsx, OutputSettings.tsx
    canvas/       PreviewCanvas.tsx, ComparisonSlider.tsx
    batch/        BatchPanel.tsx
    matrix-editor/ MatrixEditorModal.tsx, MatrixGrid.tsx
    common/       DropZone.tsx

  state/          app-reducer.ts, app-context.tsx, types.ts
  hooks/          use-dither.ts, use-zoom-pan.ts, use-persistence.ts, use-keyboard-shortcuts.ts
  utils/          image-io.ts, color.ts, export.ts
```

### Key Patterns

- All error-diffusion algorithms share one loop in `common.ts`. Each algorithm file only exports its kernel.
- State managed via `useReducer` + Context with undo/redo history stack (max 50 entries).
- Preview uses downscaled images (max 1024px); export always processes full resolution.
- CSS custom properties (`--color-*`) for theming, toggled via `.dark` class on `<html>`.

---

## UI Layout

```
+---------------------------------------------------------------+
|  [Logo] Dither Lab                    [Single] [Batch]  [?]   |
+----------------+----------------------------------------------+
|                |                                              |
|  ALGORITHM     |                                              |
|  [dropdown]    |                                              |
|                |           CANVAS PREVIEW                     |
|  PALETTE       |        (before / after)                      |
|  [controls]    |                                              |
|                |                                              |
|  OUTPUT        |                                              |
|  [settings]    |                                              |
|                |                                              |
|  [Download]    |   [side-by-side] [slider] [toggle] [zoom]    |
+----------------+----------------------------------------------+
```

- **Header**: Logo, Single/Batch mode toggle, theme toggle (light/dark)
- **Left sidebar** (280px): grouped algorithm dropdown, palette controls, output settings, download button
- **Main area**: canvas preview with comparison controls in a bottom toolbar
- **Batch mode** replaces the main area with a file queue + thumbnail grid

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + V` | Paste image from clipboard |
| `Ctrl/Cmd + Z` | Undo settings change |
| `Ctrl/Cmd + Shift + Z` | Redo settings change |
| `Ctrl/Cmd + S` | Download current result |
| `Space` | Toggle before/after |
| `1-9` | Quick-select algorithm |
| `+` / `-` | Zoom in/out |
| `0` | Fit to view |

---

## Tasks

### Core Improvements
- [x] Add EGA 64-color palette preset to src/palette/presets.ts (currently missing from the 9 presets — PRD specifies it)
- [x] Add sample image that pre-loads on first visit so the tool isn't empty — generate a colorful gradient test image procedurally in src/components/canvas/PreviewCanvas.tsx and auto-load it when there's no source image and localStorage has no prior session
- [x] Add tooltips on key controls (algorithm dropdown, palette mode buttons, scale buttons) using a lightweight Tooltip component — show on hover with a brief description of what each control does
- [x] Add image size warning when loaded image exceeds 4096x4096 — show a dismissible banner above the canvas. Hard-reject images above 8192x8192
- [x] Add a side-by-side comparison mode that renders original and dithered canvases next to each other horizontally (currently the state and toggle exist but only slider and toggle modes actually render differently)
- [x] Move batch processing to Web Workers using src/services/worker-pool.ts and src/services/dither.worker.ts — currently batch processes on the main thread which blocks the UI. Create the worker pool that spawns navigator.hardwareConcurrency workers (min 2, max 8) with round-robin job assignment
- [x] Add GIF export support using the gifenc library (already installed) — for 1-bit and indexed color outputs, export as actual GIF format instead of falling back to PNG
- [x] Add responsive layout — when viewport is narrower than 768px, collapse the sidebar into a bottom sheet that can be swiped up/down

### Polish & UX
- [x] Add thumbnail previews in the batch queue — show a small dithered thumbnail next to each file name once processing is complete
- [x] Persist custom dithering matrices to localStorage separately (key: dither-lab-custom-matrices) and show a "Saved Matrices" dropdown in the MatrixEditorModal that lists previously saved matrices for quick loading
- [x] Add a "Recent Palettes" section in PaletteControls that shows the last 5 custom manual palettes used, stored in localStorage
- [x] Improve the comparison slider by adding touch support for mobile devices (onTouchStart, onTouchMove, onTouchEnd handlers mirroring the mouse handlers)
- [x] Add a loading skeleton/placeholder in the canvas area while the dither engine is processing, instead of just the "Processing..." overlay text

### Stretch Features
- [ ] Add WebGL renderer for ordered dithering algorithms (Bayer 2x2/4x4/8x8) — these are embarrassingly parallel and can run as a fragment shader for 10-100x speedup on large images
- [ ] Add video/GIF input support — accept .gif and .mp4 files, dither each frame, and reassemble as an animated GIF output using gifenc
- [ ] Add halftone simulation algorithm — circular dot patterns at configurable angles and frequencies for screen printing workflows
- [ ] Add palette extraction from reference images — upload a reference image and extract its dominant colors via median-cut to use as the dithering palette ("dither like this photo")
- [ ] Add shareable presets — export current settings (algorithm, palette, strength, etc.) as a base64-encoded URL parameter so team members can share exact configurations via links

---

## Verification

1. `npm run build` — must pass with zero errors
2. `npm run dev` — open in browser, drag an image, verify real-time preview
3. Each algorithm produces visually distinct output
4. Batch mode: queue 10+ images, process, download ZIP
5. Custom matrix: create 4x4 matrix, apply, verify output differs from presets
6. Performance: 2048x2048 image dithers in <2s
7. Export as PNG, WebP — verify files open correctly
8. Theme toggle works, persists across reload
9. Responsive: sidebar collapses at 768px
