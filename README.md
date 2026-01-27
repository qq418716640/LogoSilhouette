# LogoSilhouette

Free online Logo Silhouette Generator - Convert any logo image into a clean black silhouette SVG. 100% browser-based, your files never leave your device.

## Features

- **Pure Frontend**: All image processing happens client-side using Web Workers
- **SVG Export**: Generate clean vector silhouettes from raster images
- **Multiple Presets**: Clean Silhouette (default), Minimal Logo, Keep Details
- **Advanced Controls**: Fine-tune tracing parameters for perfect results
- **Format Support**: Export as SVG, transparent PNG, or JPG
- **Privacy First**: No server upload, all processing in your browser

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 5.4**
- **Tailwind CSS 4** - Styling
- **Zustand 5** - State management
- **imagetracerjs** - SVG tracing engine
- **Comlink** - Web Worker communication
- **Umami Analytics** - Privacy-friendly analytics

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/LogoSilhouette.git
cd LogoSilhouette

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Environment Configuration

Create environment files (optional):

```bash
# Copy example file
cp .env.example .env.development

# Configure as needed
# - VITE_UMAMI_WEBSITE_ID: Your Umami website ID
# - VITE_UMAMI_SRC: Umami script URL
# - VITE_BASE_PATH: Base path for deployment (e.g., / or /logo-silhouette/)
```

**Key configurations**:
- **Analytics**: See [Analytics Setup Guide](./doc/Analytics_Setup_Guide.md)
- **Base Path**: See [Base Path Configuration](./doc/Base_Path_Configuration.md) for deploying to subdirectories

## Commands

```bash
npm run dev                  # Start Vite dev server with HMR
npm run build                # Build for production (uses .env.production)
npm run build:staging        # Build for staging (uses .env.staging)
npm run build:production     # Build for production (explicit)
npm run lint                 # ESLint check
npm run preview              # Preview last build
npm run preview:staging      # Build and preview staging
npm run preview:production   # Build and preview production
```

## Architecture

### Key Directories

```
src/
├── components/
│   ├── EmbeddedApp/        # Main tool interface
│   ├── Hero/               # Landing hero section
│   ├── Header/             # Site header
│   ├── CaseGallery/        # Example showcase
│   └── Landing/            # Landing page sections
├── core/
│   ├── pipeline/           # Image processing orchestration
│   ├── steps/              # Processing steps (resize, threshold, trace, etc.)
│   └── utils/              # Core utilities
├── workers/                # Web Worker for async processing
├── store/                  # Zustand state management
├── presets/                # Processing presets
├── export/                 # Export utilities (SVG, PNG, JPG)
└── analytics/              # Umami analytics integration
```

### Processing Pipeline

6-step incremental pipeline with caching:

```
Upload → Resize → B&W → Denoise → Crop → Trace → Clean → Export
```

- **Incremental**: Only reruns affected steps on parameter change
- **Worker-based**: Non-blocking processing in Web Worker
- **Timeout protection**: 15s limit with fallback
- **Caching**: Intermediate results cached

## Documentation

- **[Technical Design](./doc/LogoSilhouette_技术实现方案.md)** (Chinese) - Architecture and implementation details
- **[Parameter Control Logic](./doc/Parameters_Control_Logic.md)** (Chinese) - Parameter behavior specs
- **[Analytics Plan](./doc/LogoSilhouette_数据埋点方案.md)** (Chinese) - Data tracking strategy
- **[Analytics Setup](./doc/Analytics_Setup_Guide.md)** (Chinese) - Umami configuration guide
- **[Base Path Configuration](./doc/Base_Path_Configuration.md)** - Deploy to subdirectories guide
- **[Private Deployment Note](./doc/PRIVATE_DEPLOYMENT_NOTE.md)** - Umami private deployment notes
- **[CLAUDE.md](./CLAUDE.md)** - Instructions for Claude Code

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

- [imagetracerjs](https://github.com/jankovicsandras/imagetracerjs) - SVG tracing library
- [Comlink](https://github.com/GoogleChromeLabs/comlink) - Web Worker utilities
- [Umami](https://umami.is) - Privacy-friendly analytics

---

Built with ❤️ for designers and developers who need quick logo silhouettes.
