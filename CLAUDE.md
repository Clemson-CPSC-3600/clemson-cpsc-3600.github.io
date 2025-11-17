# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Pages site for CPSC 3600: Computer Networks at Clemson University. It's designed as a module-based course website with interactive networking visualizations, built with Vite.

**Current Status**: Undergoing module-based refactoring (see [REFACTORING_PLAN.md](REFACTORING_PLAN.md))
- Phase 1 & 2: Complete (directory structure, core infrastructure)
- Academic Redesign: Complete (traditional academic aesthetic)
- Phase 3: In Progress (Module 1 migration)

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

### Directory Organization (New Module-Based Structure)
```
├── modules/                      # 6 course modules
│   ├── module1-big-picture/      # Module 1: The Big Picture
│   │   ├── index.html            # Module landing page
│   │   ├── module1.js            # Module-specific JS
│   │   ├── module1.css           # Module-specific styles
│   │   ├── lessons/              # 4 lesson subdirectories
│   │   ├── demos/                # 3 demo subdirectories
│   │   └── practice/             # Practice activities
│   ├── module2-application/      # Module 2: Application Layer
│   ├── module3-transport/        # Module 3: Transport Layer
│   ├── module4-network/          # Module 4: Network Layer
│   ├── module5-link/             # Module 5: Link Layer
│   └── module6-security/         # Module 6: Network Security
├── shared/                       # Reusable components
│   ├── styles/                   # Global CSS
│   │   ├── main.css              # Design system (95+ CSS variables)
│   │   ├── module.css            # Module landing page styles
│   │   ├── lesson.css            # Lesson page styles
│   │   ├── demo.css              # Demo page styles
│   │   ├── practice.css          # Practice page styles
│   │   └── components.css        # Reusable UI components
│   ├── components/               # JavaScript components
│   │   ├── ModuleCard.js         # Dynamic module cards
│   │   ├── Breadcrumb.js         # Navigation breadcrumbs
│   │   ├── ProgressTracker.js    # localStorage-based tracking
│   │   ├── LessonNavigator.js    # Lesson navigation
│   │   └── ActivityList.js       # Activity list component
│   ├── constants/                # Shared constants
│   │   ├── modules.js            # Module configuration (270+ lines)
│   │   └── colors.js             # Color palette
│   ├── js/                       # Legacy shared JS (to be updated)
│   └── utils/                    # Utility classes
├── demos/                        # Legacy demos (being migrated)
├── index.html                    # Course home page (academic design)
├── main.js                       # Home page JavaScript
├── style.css                     # Home page styles
└── assets/                       # Static resources
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

## Design & Style Guidelines

### Style Guide (IMPORTANT)
**All new pages must conform to [STYLE_GUIDE.md](STYLE_GUIDE.md)**

The style guide provides:
- **Design Principles**: Academic aesthetic, neutral colors, professional appearance
- **Color System**: Neutral palette for UI, module-specific colors for content
- **Typography**: Major Third scale (1.250), font sizes, weights, line heights
- **Spacing & Layout**: Reduced spacing scale, container widths, responsive breakpoints
- **Components**: Complete HTML/CSS for cards, lists, buttons, breadcrumbs
- **Page Templates**: Boilerplates for home, module, lesson, demo, practice pages
- **Accessibility**: WCAG AA requirements, ARIA labels, keyboard navigation
- **Do's and Don'ts**: Quick reference for consistent implementation

### Key Design Decisions
1. **Academic Aesthetic** - Traditional course website, not marketing-style
2. **Neutral Colors** - Gray/white palette, no colorful accents on home page
3. **Formal Language** - "View Module" not "Start Module", "Demonstrations" not "Demos"
4. **Accessibility First** - Skip links, ARIA labels, keyboard navigation, screen reader support
5. **Module Colors** - Reserved for content pages only (not home page)

See [DESIGN_CHANGES_APPLIED.md](DESIGN_CHANGES_APPLIED.md) for academic redesign rationale.

## Development Guidelines
- **Style Conformance**: Follow [STYLE_GUIDE.md](STYLE_GUIDE.md) for all new pages
- **Component Reuse**: Use shared components (ModuleCard, Breadcrumb, etc.)
- **Module Configuration**: Update [shared/constants/modules.js](shared/constants/modules.js) for new content
- **Accessibility**: WCAG AA compliance required (ARIA labels, keyboard nav, focus indicators)
- **Color Usage**: Use CSS variables (`--color-text`, `--color-module`, etc.)
- **Responsive Design**: Mobile-first approach, test on 320px-2560px
- **Performance**: 60fps animations, viewport culling, object pooling
- **Testing**: Multiple browsers including mobile, keyboard navigation

## Project Documentation

### Planning & Architecture
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Complete refactoring plan (50+ pages)
- [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) - Task tracking
- [STYLE_GUIDE.md](STYLE_GUIDE.md) - Design system & theming (comprehensive)

### Design & History
- [DESIGN_CHANGES_APPLIED.md](DESIGN_CHANGES_APPLIED.md) - Academic redesign documentation
- [DESIGN_IMPROVEMENTS.md](DESIGN_IMPROVEMENTS.md) - Original design plan (superseded)

### Configuration
- [shared/constants/modules.js](shared/constants/modules.js) - All 6 modules defined here
- [shared/constants/colors.js](shared/constants/colors.js) - Color palette constants
- [vite.config.js](vite.config.js) - Build configuration with auto-discovery