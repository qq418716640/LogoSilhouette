# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LogoSilhouette is a browser-based Logo Silhouette Generator that converts raster images into clean SVG vector logos. It's a pure frontend SPA with all image processing happening client-side using Web Workers.

## Commands

- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - TypeScript compilation + Vite production build
- `npm run lint` - ESLint check
- `npm run preview` - Preview production build locally

## Architecture

### Tech Stack
- React 19 + TypeScript 5.9 + Vite 5.4
- Tailwind CSS 4 for styling
- Zustand 5 for state management
- imagetracerjs for SVG tracing
- Comlink for Web Worker communication

### Key Directories
- `/src/components/EmbeddedApp/` - Main tool interface (uploader, preview, settings, export)
- `/src/core/pipeline/` - Image processing orchestration with caching
- `/src/core/steps/` - Individual processing steps (resize, threshold, denoise, crop, trace, clean)
- `/src/store/` - Zustand global state
- `/src/presets/` - Three processing presets (Clean Silhouette [default], Minimal Logo, Keep Details)
- `/src/workers/` - Web Worker for async processing
- `/src/export/` - SVG/PNG/JPG export utilities

### Data Flow
1. Image upload → Zustand store (`setSourceImage`)
2. Parameter change → dependency check → determine which pipeline step to restart from
3. Processing via Web Worker → 6-step pipeline: resize → bw → denoise → crop → trace → clean
4. Result stored → Preview renders → Export ready

### Pipeline Design
- **Incremental computation**: Only reruns affected steps based on parameter changes
- **Caching**: Intermediate results cached to avoid recomputation
- **Timeout**: 15-second limit to prevent browser freeze
- **Fallback**: Main thread fallback if Web Worker unavailable

### Key Parameters
- **qtres/ltres**: Tracing tolerance (higher = smoother curves, fewer nodes)
- **pathomit**: Minimum path points for noise filtering
- **Denoise levels**: off → low → medium → high (morphological operations)

## Path Alias
`@/*` maps to `./src/*` (configured in tsconfig.app.json)

## Documentation
Technical specs are in `/doc/` (in Chinese):
- `LogoSilhouette_技术实现方案.md` - Technical design
- `Parameters_Control_Logic.md` - Parameter behavior details
