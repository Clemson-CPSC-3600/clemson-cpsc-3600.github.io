# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages site for interactive networking visualizations teaching networking concepts. It's designed as a multi-page web application built with Vite.

## Development Commands

### Initial Setup
```bash
npm create vite@latest my-networking-viz -- --template vanilla
cd my-networking-viz
npm install --save-dev gh-pages
```

### Common Commands
```bash
npm run dev       # Start development server with hot reload
npm run build     # Build for production
npm run preview   # Preview production build locally
npm run deploy    # Deploy to GitHub Pages (via gh-pages)
```

## Architecture

### Project Structure
- **Multi-page site**: Each directory with an `index.html` becomes a route
- **Vite configuration**: Auto-discovers HTML files for multi-page builds
- **Canvas-based visualizations**: Uses HTML5 Canvas API for interactive networking demos
- **Deployment**: GitHub Pages via gh-pages branch

### Key Components

#### Base Classes (shared/js/network-base.js)
- `NetworkNode`: Represents network nodes with position, connections, and rendering
- `Packet`: Animated data packets that travel between nodes
- `NetworkSimulation`: Base simulation class with animation loop, event handling, and viewport management

#### Reusable Components
- **Navigation System** (shared/js/navigation.js): Auto-generates site navigation
- **Code Viewer** (shared/js/code-viewer.js): Enhanced code display with line numbers and copy functionality
- **Tutorial System** (shared/js/tutorial-system.js): Step-by-step tutorial framework

#### Canvas Utilities (shared/js/canvas-utils.js)
- Drawing helpers (arrows, text with background)
- Animation utilities (easing functions, lerp, distance calculations)
- Performance optimizations (object pooling, viewport culling, batch rendering)

### Directory Organization
```
├── demos/        # Interactive demonstrations
├── tutorials/    # Educational content  
├── examples/     # Code examples
├── shared/       # Reusable components
│   ├── styles/   # Global CSS
│   ├── js/       # Shared JavaScript modules
│   └── templates/# Page templates
└── assets/       # Static resources
```

## GitHub Pages Deployment

1. Configure `vite.config.js` with correct base path:
   ```javascript
   base: '/your-repo-name/'
   ```

2. Deploy manually:
   ```bash
   npm run deploy
   ```

3. Or use GitHub Actions (see `.github/workflows/deploy.yml`)

## Important Configuration

### Vite Config Requirements
- Must set `base` to match repository name for GitHub Pages
- Multi-page build requires proper input configuration in rollupOptions
- Auto-discovery function scans for all `index.html` files

### Meta Files
Each content directory should include `meta.json` with:
- title, description, keywords
- difficulty level
- prerequisites
- estimated time
- category and order

## Performance Considerations
- Use `requestAnimationFrame` for smooth 60fps animations
- Implement object pooling for frequently created objects
- Add viewport culling for off-screen elements
- Handle high-DPI displays with proper canvas scaling

## Development Guidelines
- Follow component-based architecture with clear separation of concerns
- Test on multiple browsers including mobile
- Ensure keyboard navigation and accessibility
- Optimize images and bundle size
- Keep frame rate at 60fps for animations