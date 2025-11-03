# Project Foundation Development Guide

Building the Infrastructure for Interactive Networking Visualizations

## Table of Contents

### Part 1: Getting Started
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)

### Part 2: Setup & Deployment
- [Creating Your Project](#creating-your-project)
  - [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
  - [Step 2: Initialize with Vite](#step-2-initialize-with-vite)
  - [Step 3: Install Dependencies](#step-3-install-dependencies)
  - [Step 4: Configure for Multi-Page Sites](#step-4-configure-for-multi-page-sites)
  - [Step 5: Configure package.json](#step-5-configure-packagejson)
- [Deployment](#deployment)
  - [Manual Deployment with gh-pages](#manual-deployment-with-gh-pages)
  - [Automated Deployment with GitHub Actions](#automated-deployment-with-github-actions)
  - [Configuring GitHub Pages](#configuring-github-pages)
- [Development Workflow](#development-workflow)

### Part 3: Architecture & Design
- [Project Structure](#project-structure)
- [Design Principles](#design-principles)
- [Code Organization Guidelines](#code-organization-guidelines)
  - [File Structure](#file-structure)
  - [Naming Conventions](#naming-conventions)
  - [Style Guide](#style-guide)
- [Page Templates](#page-templates)
  - [Standard Page Structure](#standard-page-structure)
  - [Meta Files](#meta-files)

### Part 4: Foundation Components
- [Canvas Base Architecture](#canvas-base-architecture)
  - [Base Classes](#base-classes)
  - [Animation Patterns](#animation-patterns)
  - [User Interactions](#user-interactions)
  - [Performance Optimization](#performance-optimization)
- [Reusable Site Components](#reusable-site-components)
  - [Navigation System](#navigation-system)
  - [Code Viewer Component](#code-viewer-component)
  - [Tutorial System](#tutorial-system)

### Part 5: Reference
- [Common Utilities](#common-utilities)
- [Testing Guidelines](#testing-guidelines)
- [Troubleshooting](#troubleshooting)
- [Development Checklist](#development-checklist)
- [Resources](#resources)

---

## Part 1: Getting Started

### Overview

This guide helps you build the foundation and infrastructure for interactive multi-page web applications that teach networking concepts. It covers:
- Project setup and configuration
- Deployment to GitHub Pages
- Reusable base components and utilities
- Site architecture and organization

**Note:** This guide focuses on building the foundation. For specific networking visualization implementations (TCP handshake, routing algorithms, packet switching, etc.), refer to the separate content implementation guides:
- `CONTENT_TCP.md` - TCP protocol visualizations
- `CONTENT_ROUTING.md` - Routing algorithm visualizations
- `CONTENT_SWITCHING.md` - Packet switching demonstrations
- `CONTENT_PROTOCOLS.md` - Various protocol implementations

### Prerequisites

1. **Node.js and npm** (v16.13.2 or higher):
   ```bash
   node --version
   npm --version
   ```

2. **Git** (v2.29.1 or higher):
   ```bash
   git --version
   ```

3. **GitHub account** for hosting

4. **Basic knowledge of**:
   - JavaScript/HTML/CSS
   - Canvas API basics
   - Git version control

### Tech Stack

- **Core**: HTML5 Canvas + Vanilla JavaScript
- **Build Tool**: Vite (fast, multi-page support out of the box)
- **Deployment**: GitHub Pages via gh-pages npm package
- **Animation**: requestAnimationFrame for 60fps
- **Optional**: React components where needed

### Quick Start

```bash
# Clone or create new project
npm create vite@latest my-networking-viz -- --template vanilla
cd my-networking-viz

# Install dependencies
npm install --save-dev gh-pages

# Start development
npm run dev
```

---

## Part 2: Setup & Deployment

### Creating Your Project

#### Step 1: GitHub Repository Setup

1. Sign into GitHub
2. Create new repository at https://github.com/new
3. Settings:
   - **Name**: Any name (or `{username}.github.io` for user site)
   - **Privacy**: Public (required for free GitHub Pages)
   - **Initialize**: Leave empty (no README, .gitignore, or LICENSE)

#### Step 2: Initialize with Vite

```bash
# Create new Vite project
npm create vite@latest networking-visualizations -- --template vanilla

# Or initialize existing directory
npm init -y

cd networking-visualizations
```

#### Step 3: Install Dependencies

```bash
# Development dependencies
npm install --save-dev vite gh-pages

# Optional: Canvas utilities
npm install --save-dev @types/node
```

#### Step 4: Configure for Multi-Page Sites

Create `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Auto-discover all HTML files for multi-page build
function getHtmlEntries() {
  const entries = {};
  
  function scanDir(dir, prefix = '') {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const path = `${dir}/${file}`;
      const key = prefix ? `${prefix}/${file}` : file;
      
      if (fs.statSync(path).isDirectory()) {
        scanDir(path, key);
      } else if (file === 'index.html') {
        const entryName = prefix || 'main';
        entries[entryName] = resolve(__dirname, path);
      }
    });
  }
  
  scanDir('.');
  return entries;
}

export default defineConfig({
  base: '/your-repo-name/',  // IMPORTANT: Update this!
  build: {
    rollupOptions: {
      input: getHtmlEntries()
    },
    outDir: 'dist'
  },
  server: {
    open: true,
    port: 3000
  }
});
```

#### Step 5: Configure package.json

```json
{
  "name": "networking-visualizations",
  "version": "1.0.0",
  "homepage": "https://{username}.github.io/{repo-name}",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "gh-pages": "^6.0.0"
  }
}
```

### Deployment

#### Manual Deployment with gh-pages

1. **Add remote repository**:
   ```bash
   git remote add origin https://github.com/{username}/{repo-name}.git
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   # Or with custom message
   npm run deploy -- -m "Add TCP visualization"
   ```

3. **Push source code** (optional but recommended):
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

#### Automated Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

#### Configuring GitHub Pages

1. Go to repository Settings → Pages
2. Set Source: "Deploy from a branch"
3. Select Branch: `gh-pages` and folder: `/ (root)`
4. Save and wait for deployment

Your site will be available at: `https://{username}.github.io/{repo-name}`

### Development Workflow

```bash
# 1. Start development server with hot reload
npm run dev

# 2. Create new pages/features
# Add HTML files in appropriate directories
# Vite auto-detects them for builds

# 3. Test production build locally
npm run build
npm run preview

# 4. Deploy to GitHub Pages
npm run deploy

# 5. Check deployment
# Visit https://{username}.github.io/{repo-name}
```

---

## Part 3: Architecture & Design

### Project Structure

```
networking-visualizations/
├── index.html                    # Landing page
├── vite.config.js               # Build configuration
├── package.json                 # Dependencies & scripts
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions
├── shared/                      # Reusable components
│   ├── styles/
│   │   ├── main.css            # Global styles
│   │   └── components.css      # Component styles
│   ├── js/
│   │   ├── navigation.js       # Site navigation
│   │   ├── canvas-utils.js     # Canvas helpers
│   │   └── network-base.js     # Base classes
│   └── templates/
│       └── page-template.html  # Page boilerplate
├── demos/                       # Interactive demonstrations
│   ├── index.html              # Demo hub
│   └── tcp-handshake/
│       ├── index.html
│       ├── simulation.js
│       ├── styles.css
│       └── meta.json
├── tutorials/                   # Educational content
│   ├── index.html              # Tutorial hub
│   └── tcp-basics/
│       ├── index.html
│       ├── assets/
│       └── meta.json
├── examples/                    # Code examples
│   ├── index.html              # Examples hub
│   └── socket-programming/
│       ├── index.html
│       └── meta.json
└── assets/                      # Static assets
    ├── images/
    ├── fonts/
    └── data/
```

### Design Principles

1. **Progressive Enhancement**
   - Start with basic HTML
   - Enhance with CSS
   - Add interactivity with JavaScript

2. **Component-Based Architecture**
   - Reusable, self-contained components
   - Clear separation of concerns
   - Consistent interfaces

3. **Performance First**
   - Optimize Canvas rendering
   - Lazy load resources
   - Minimize bundle size

4. **Accessibility**
   - Keyboard navigation
   - Screen reader support
   - Clear visual feedback

### Code Organization Guidelines

#### File Structure

- **One component per file**
- **Logical grouping** by feature
- **Consistent naming** patterns
- **Clear dependencies**

#### Naming Conventions

```javascript
// Files: kebab-case
network-simulation.js
tcp-handshake.html

// Classes: PascalCase
class NetworkNode { }
class PacketSimulation { }

// Functions/Variables: camelCase
function drawPacket() { }
const packetSpeed = 0.02;

// Constants: UPPER_SNAKE_CASE
const MAX_PACKETS = 100;
const DEFAULT_PORT = 8080;

// CSS Classes: kebab-case
.navigation-menu { }
.demo-container { }
```

#### Style Guide

**Colors Palette**:
```css
:root {
  --color-primary: #3498db;    /* Blue - Interactive elements */
  --color-success: #2ecc71;    /* Green - Success states */
  --color-warning: #f39c12;    /* Orange - Warnings */
  --color-danger: #e74c3c;     /* Red - Errors */
  --color-node: #4a90e2;        /* Network nodes */
  --color-packet: #2ecc71;      /* Data packets */
  --color-background: #f8f9fa;  /* Light backgrounds */
  --color-text: #2c3e50;        /* Primary text */
}
```

**Typography**:
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }
```

### Page Templates

#### Standard Page Structure

Every page should follow this template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="[Page description for SEO]">
  <title>[Page Title] - Networking Visualizations</title>
  
  <!-- Global styles -->
  <link rel="stylesheet" href="/shared/styles/main.css">
  <!-- Page-specific styles -->
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <!-- Navigation auto-inserted via JS -->
  
  <main>
    <div class="container">
      <!-- Page content -->
    </div>
  </main>
  
  <footer class="site-footer">
    <p>© 2024 Networking Visualizations | 
       <a href="/about/">About</a> | 
       <a href="https://github.com/[username]/[repo]">GitHub</a>
    </p>
  </footer>
  
  <!-- Global scripts -->
  <script src="/shared/js/navigation.js"></script>
  <!-- Page-specific scripts -->
  <script type="module" src="./main.js"></script>
</body>
</html>
```

#### Meta Files

Each content directory should include `meta.json`:

```json
{
  "title": "TCP Three-Way Handshake",
  "description": "Interactive visualization of TCP connection establishment",
  "keywords": ["tcp", "handshake", "networking", "protocols"],
  "difficulty": "beginner",
  "prerequisites": ["basic-networking"],
  "estimatedTime": "10 minutes",
  "category": "protocols",
  "order": 1
}
```

---

## Part 4: Foundation Components

This section covers the reusable foundation components that all networking visualizations can build upon. For specific networking visualization implementations (TCP handshake, routing algorithms, etc.), see the separate content implementation guides.

### Canvas Base Architecture

#### Base Classes

Create reusable base classes that all networking visualizations can extend:

```javascript
// shared/js/network-base.js

export class NetworkNode {
  constructor(x, y, id, label) {
    this.x = x;
    this.y = y;
    this.id = id;
    this.label = label;
    this.radius = 30;
    this.color = '#4a90e2';
    this.connections = new Set();
  }
  
  draw(ctx) {
    // Draw node circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.strokeStyle = '#2e5c8a';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw label
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label, this.x, this.y);
  }
  
  containsPoint(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

export class Packet {
  constructor(startNode, endNode, data = {}) {
    this.start = startNode;
    this.end = endNode;
    this.data = data;
    this.progress = 0;
    this.speed = 0.02;
    this.color = '#2ecc71';
    this.size = 10;
  }
  
  update(deltaTime = 1) {
    this.progress = Math.min(1, this.progress + this.speed * deltaTime);
    return this.progress < 1; // Return true if still moving
  }
  
  getCurrentPosition() {
    const t = this.easeInOutQuad(this.progress);
    return {
      x: this.start.x + (this.end.x - this.start.x) * t,
      y: this.start.y + (this.end.y - this.start.y) * t
    };
  }
  
  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  
  draw(ctx) {
    const pos = this.getCurrentPosition();
    
    // Draw packet
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Draw data label if exists
    if (this.data.label) {
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.data.label, pos.x, pos.y - 20);
    }
  }
}

export class NetworkSimulation {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.packets = [];
    this.connections = [];
    this.animationId = null;
    this.lastTime = 0;
    
    this.setupCanvas();
    this.bindEvents();
  }
  
  setupCanvas() {
    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }
  
  start() {
    this.lastTime = performance.now();
    this.animate();
  }
  
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  animate(currentTime = 0) {
    const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
    this.lastTime = currentTime;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Update and draw
    this.update(deltaTime);
    this.draw();
    
    // Continue animation
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }
  
  update(deltaTime) {
    // Update packets
    this.packets = this.packets.filter(packet => packet.update(deltaTime));
  }
  
  draw() {
    // Draw connections
    this.drawConnections();
    
    // Draw packets
    this.packets.forEach(packet => packet.draw(this.ctx));
    
    // Draw nodes (on top)
    this.nodes.forEach(node => node.draw(this.ctx));
  }
  
  drawConnections() {
    this.ctx.strokeStyle = '#95a5a6';
    this.ctx.lineWidth = 2;
    
    this.connections.forEach(([node1, node2]) => {
      this.ctx.beginPath();
      this.ctx.moveTo(node1.x, node1.y);
      this.ctx.lineTo(node2.x, node2.y);
      this.ctx.stroke();
    });
  }
  
  bindEvents() {
    // Will be overridden by subclasses
  }
  
  addNode(x, y, id, label) {
    const node = new NetworkNode(x, y, id, label);
    this.nodes.push(node);
    return node;
  }
  
  connectNodes(node1, node2) {
    this.connections.push([node1, node2]);
    node1.connections.add(node2);
    node2.connections.add(node1);
  }
  
  sendPacket(from, to, data = {}) {
    const packet = new Packet(from, to, data);
    this.packets.push(packet);
    return packet;
  }
}
```

#### Animation Patterns

Best practices for smooth animations:

```javascript
// Use time-based animations for consistency across devices
class AnimationController {
  constructor() {
    this.animations = new Map();
  }
  
  add(id, animation) {
    this.animations.set(id, animation);
  }
  
  update(deltaTime) {
    for (const [id, animation] of this.animations) {
      if (!animation.update(deltaTime)) {
        this.animations.delete(id);
        animation.onComplete?.();
      }
    }
  }
}

// Easing functions for natural movement
const Easing = {
  linear: t => t,
  easeInQuad: t => t * t,
  easeOutQuad: t => t * (2 - t),
  easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: t => t * t * t,
  easeOutCubic: t => (--t) * t * t + 1,
  easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

// Particle trail effect
class PacketTrail {
  constructor(maxLength = 10) {
    this.positions = [];
    this.maxLength = maxLength;
  }
  
  update(position) {
    this.positions.push({...position});
    if (this.positions.length > this.maxLength) {
      this.positions.shift();
    }
  }
  
  draw(ctx) {
    this.positions.forEach((pos, i) => {
      const opacity = (i + 1) / this.positions.length * 0.5;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
}
```

#### User Interactions

Handle mouse and keyboard events:

```javascript
class InteractiveSimulation extends NetworkSimulation {
  constructor(canvasId) {
    super(canvasId);
    this.selectedNode = null;
    this.hoveredNode = null;
    this.isDragging = false;
  }
  
  bindEvents() {
    // Mouse events
    this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
    
    // Keyboard events
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }
  
  getMousePos(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  
  onMouseMove(event) {
    const pos = this.getMousePos(event);
    
    // Update hovered node
    this.hoveredNode = this.nodes.find(node => node.containsPoint(pos.x, pos.y));
    
    // Update cursor
    this.canvas.style.cursor = this.hoveredNode ? 'pointer' : 'default';
    
    // Handle dragging
    if (this.isDragging && this.selectedNode) {
      this.selectedNode.x = pos.x;
      this.selectedNode.y = pos.y;
    }
  }
  
  onClick(event) {
    const pos = this.getMousePos(event);
    const clickedNode = this.nodes.find(node => node.containsPoint(pos.x, pos.y));
    
    if (clickedNode) {
      this.onNodeClick(clickedNode);
    }
  }
  
  onNodeClick(node) {
    // Override in subclass
    console.log('Node clicked:', node.id);
  }
  
  onKeyDown(event) {
    switch(event.key) {
      case ' ':
        this.togglePause();
        break;
      case 'r':
        this.reset();
        break;
      case 'Delete':
        if (this.selectedNode) {
          this.removeNode(this.selectedNode);
        }
        break;
    }
  }
}
```

#### Performance Optimization

```javascript
// Object pooling for frequently created objects
class ObjectPool {
  constructor(createFn, resetFn, maxSize = 100) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    this.maxSize = maxSize;
  }
  
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  
  release(obj) {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }
}

// Viewport culling for large networks
class ViewportCuller {
  constructor(padding = 50) {
    this.padding = padding;
  }
  
  isVisible(obj, viewport) {
    return obj.x + obj.radius >= -this.padding &&
           obj.x - obj.radius <= viewport.width + this.padding &&
           obj.y + obj.radius >= -this.padding &&
           obj.y - obj.radius <= viewport.height + this.padding;
  }
  
  filterVisible(objects, viewport) {
    return objects.filter(obj => this.isVisible(obj, viewport));
  }
}

// Batch drawing operations
class BatchRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.operations = [];
  }
  
  add(operation) {
    this.operations.push(operation);
  }
  
  render() {
    // Group by style
    const grouped = this.groupByStyle(this.operations);
    
    // Render each group
    for (const [style, ops] of grouped) {
      this.applyStyle(style);
      ops.forEach(op => op.draw(this.ctx));
    }
    
    this.operations = [];
  }
  
  groupByStyle(operations) {
    const groups = new Map();
    operations.forEach(op => {
      const key = JSON.stringify(op.style);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(op);
    });
    return groups;
  }
}
```

### Reusable Site Components

#### Navigation System

```javascript
// shared/js/navigation.js

class SiteNavigation {
  constructor() {
    this.currentPath = window.location.pathname;
    this.navItems = [
      { path: '/', label: 'Home', icon: '🏠' },
      { path: '/demos/', label: 'Demos', icon: '🎮' },
      { path: '/tutorials/', label: 'Tutorials', icon: '📚' },
      { path: '/examples/', label: 'Examples', icon: '💻' }
    ];
  }
  
  render() {
    const nav = document.createElement('nav');
    nav.className = 'site-navigation';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    
    const ul = document.createElement('ul');
    
    this.navItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.path;
      a.textContent = `${item.icon} ${item.label}`;
      a.className = this.isActive(item.path) ? 'active' : '';
      
      if (this.isActive(item.path)) {
        a.setAttribute('aria-current', 'page');
      }
      
      li.appendChild(a);
      ul.appendChild(li);
    });
    
    nav.appendChild(ul);
    return nav;
  }
  
  isActive(path) {
    if (path === '/') {
      return this.currentPath === '/';
    }
    return this.currentPath.startsWith(path);
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  const nav = new SiteNavigation();
  document.body.insertBefore(nav.render(), document.body.firstChild);
});
```

#### Code Viewer Component

```javascript
// shared/js/code-viewer.js

class CodeViewer {
  constructor(element) {
    this.element = element;
    this.config = {
      language: element.dataset.language || 'javascript',
      filename: element.dataset.filename,
      highlights: element.dataset.highlights?.split(',').map(Number) || [],
      showLineNumbers: element.dataset.lineNumbers !== 'false'
    };
    
    this.enhance();
  }
  
  enhance() {
    this.addHeader();
    if (this.config.showLineNumbers) {
      this.addLineNumbers();
    }
    this.highlightLines();
    this.addCopyButton();
  }
  
  addHeader() {
    const header = document.createElement('div');
    header.className = 'code-header';
    
    if (this.config.filename) {
      const filename = document.createElement('span');
      filename.className = 'code-filename';
      filename.textContent = this.config.filename;
      header.appendChild(filename);
    }
    
    const language = document.createElement('span');
    language.className = 'code-language';
    language.textContent = this.config.language;
    header.appendChild(language);
    
    this.element.insertBefore(header, this.element.firstChild);
  }
  
  addLineNumbers() {
    const code = this.element.querySelector('code');
    const lines = code.textContent.split('\n');
    
    const wrapper = document.createElement('div');
    wrapper.className = 'code-wrapper';
    
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lineNumbers.setAttribute('aria-hidden', 'true');
    
    lines.forEach((_, i) => {
      const num = document.createElement('div');
      num.textContent = i + 1;
      if (this.config.highlights.includes(i + 1)) {
        num.className = 'highlighted';
      }
      lineNumbers.appendChild(num);
    });
    
    wrapper.appendChild(lineNumbers);
    code.parentElement.insertBefore(wrapper, code);
    wrapper.appendChild(code.parentElement.removeChild(code));
  }
  
  highlightLines() {
    if (this.config.highlights.length === 0) return;
    
    const code = this.element.querySelector('code');
    const lines = code.innerHTML.split('\n');
    
    const highlighted = lines.map((line, i) => {
      if (this.config.highlights.includes(i + 1)) {
        return `<span class="highlight-line">${line}</span>`;
      }
      return line;
    }).join('\n');
    
    code.innerHTML = highlighted;
  }
  
  addCopyButton() {
    const button = document.createElement('button');
    button.className = 'code-copy-btn';
    button.textContent = '📋 Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    
    button.addEventListener('click', () => this.copyCode());
    
    const header = this.element.querySelector('.code-header');
    header.appendChild(button);
  }
  
  async copyCode() {
    const code = this.element.querySelector('code').textContent;
    const button = this.element.querySelector('.code-copy-btn');
    
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = '✅ Copied!';
      setTimeout(() => {
        button.textContent = '📋 Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      button.textContent = '❌ Failed';
    }
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-component="code-viewer"]').forEach(el => {
    new CodeViewer(el);
  });
});
```

#### Tutorial System

```javascript
// shared/js/tutorial-system.js

class TutorialSystem {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sections = [];
    this.currentSection = 0;
    this.progress = 0;
    
    this.init();
  }
  
  init() {
    this.loadSections();
    this.createProgressBar();
    this.createNavigation();
    this.bindEvents();
  }
  
  loadSections() {
    this.sections = Array.from(
      this.container.querySelectorAll('.tutorial-section')
    );
  }
  
  createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'tutorial-progress';
    progressBar.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: 0%"></div>
      </div>
      <div class="progress-text">
        <span class="current-step">1</span> / 
        <span class="total-steps">${this.sections.length}</span>
      </div>
    `;
    
    this.container.insertBefore(progressBar, this.container.firstChild);
    this.progressBar = progressBar.querySelector('.progress-fill');
  }
  
  createNavigation() {
    const nav = document.createElement('div');
    nav.className = 'tutorial-nav';
    nav.innerHTML = `
      <button class="nav-prev" disabled>← Previous</button>
      <button class="nav-next">Next →</button>
    `;
    
    this.container.appendChild(nav);
    this.prevBtn = nav.querySelector('.nav-prev');
    this.nextBtn = nav.querySelector('.nav-next');
  }
  
  bindEvents() {
    this.prevBtn.addEventListener('click', () => this.goToPrevious());
    this.nextBtn.addEventListener('click', () => this.goToNext());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.goToPrevious();
      if (e.key === 'ArrowRight') this.goToNext();
    });
  }
  
  updateProgress() {
    this.progress = ((this.currentSection + 1) / this.sections.length) * 100;
    this.progressBar.style.width = `${this.progress}%`;
    
    document.querySelector('.current-step').textContent = this.currentSection + 1;
    
    // Update button states
    this.prevBtn.disabled = this.currentSection === 0;
    this.nextBtn.disabled = this.currentSection === this.sections.length - 1;
    
    // Update section visibility
    this.sections.forEach((section, i) => {
      section.style.display = i === this.currentSection ? 'block' : 'none';
    });
  }
  
  goToNext() {
    if (this.currentSection < this.sections.length - 1) {
      this.currentSection++;
      this.updateProgress();
      this.scrollToTop();
    }
  }
  
  goToPrevious() {
    if (this.currentSection > 0) {
      this.currentSection--;
      this.updateProgress();
      this.scrollToTop();
    }
  }
  
  scrollToTop() {
    this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

---

## Part 5: Reference

### Common Utilities

```javascript
// shared/js/canvas-utils.js

export function drawArrow(ctx, fromX, fromY, toX, toY, color = '#333') {
  const headLength = 10;
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  // Draw line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  
  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

export function drawTextWithBackground(ctx, text, x, y, options = {}) {
  const {
    padding = 5,
    backgroundColor = 'rgba(255, 255, 255, 0.9)',
    textColor = 'black',
    font = '12px Arial'
  } = options;
  
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const textHeight = parseInt(font);
  
  // Draw background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(
    x - metrics.width / 2 - padding,
    y - textHeight / 2 - padding,
    metrics.width + padding * 2,
    textHeight + padding * 2
  );
  
  // Draw text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

export function lerp(start, end, t) {
  return start + (end - start) * t;
}

export function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

export function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

export function randomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
```

### Testing Guidelines

1. **Unit Testing** (if using a framework):
   ```javascript
   // tests/network-node.test.js
   import { NetworkNode } from '../shared/js/network-base.js';
   
   describe('NetworkNode', () => {
     test('should detect point containment', () => {
       const node = new NetworkNode(100, 100, 'test', 'Test');
       expect(node.containsPoint(100, 100)).toBe(true);
       expect(node.containsPoint(200, 200)).toBe(false);
     });
   });
   ```

2. **Visual Testing**:
   - Take screenshots of key states
   - Compare against baseline images
   - Test on different screen sizes

3. **Performance Testing**:
   ```javascript
   // Monitor frame rate
   let frameCount = 0;
   let lastTime = performance.now();
   
   function measureFPS() {
     frameCount++;
     const currentTime = performance.now();
     
     if (currentTime - lastTime >= 1000) {
       console.log(`FPS: ${frameCount}`);
       frameCount = 0;
       lastTime = currentTime;
     }
     
     requestAnimationFrame(measureFPS);
   }
   ```

4. **Browser Testing**:
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)
   - Different viewport sizes

### Troubleshooting

#### Common Issues and Solutions

1. **Site not appearing on GitHub Pages**
   - Check Settings → Pages → Source is set to gh-pages branch
   - Verify `base` in vite.config.js matches repository name
   - Wait 5-10 minutes for initial deployment
   - Check Actions tab for deployment errors

2. **404 errors for assets**
   - Ensure paths start with `/` for absolute paths
   - Check `base` configuration in vite.config.js
   - Verify build output structure matches expectations

3. **Canvas blurry on high-DPI displays**
   ```javascript
   // Fix for retina displays
   const dpr = window.devicePixelRatio || 1;
   canvas.width = canvas.clientWidth * dpr;
   canvas.height = canvas.clientHeight * dpr;
   ctx.scale(dpr, dpr);
   ```

4. **Animation performance issues**
   - Use `requestAnimationFrame` instead of `setInterval`
   - Implement object pooling for frequently created objects
   - Add viewport culling for off-screen elements
   - Reduce particle counts on mobile devices

5. **Build failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Check for syntax errors
   npm run build
   ```

### Development Checklist

Before deploying new content:

- [ ] **Code Quality**
  - [ ] No console errors or warnings
  - [ ] ESLint/Prettier passes (if configured)
  - [ ] Code follows project conventions
  - [ ] Comments added for complex logic

- [ ] **Testing**
  - [ ] Tested on desktop browsers
  - [ ] Tested on mobile devices
  - [ ] Keyboard navigation works
  - [ ] Touch interactions work on mobile

- [ ] **Performance**
  - [ ] Page loads in < 3 seconds
  - [ ] Animations run at 60fps
  - [ ] No memory leaks (check DevTools)
  - [ ] Images optimized

- [ ] **Accessibility**
  - [ ] Keyboard navigation available
  - [ ] ARIA labels where appropriate
  - [ ] Color contrast passes WCAG AA
  - [ ] Focus indicators visible

- [ ] **Content**
  - [ ] Page has meta description
  - [ ] meta.json file created/updated
  - [ ] Links to related content added
  - [ ] README updated if needed

- [ ] **Deployment**
  - [ ] Build succeeds locally
  - [ ] Preview works correctly
  - [ ] Pushed to repository
  - [ ] Deployment successful

### Resources

#### Documentation
- [Vite Documentation](https://vitejs.dev/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [gh-pages npm package](https://github.com/tschaub/gh-pages)

#### Learning Resources
- [Canvas Tutorial - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Networking Fundamentals](https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/)
- [TCP/IP Illustrated](https://www.amazon.com/TCP-Illustrated-Vol-Addison-Wesley-Professional/dp/0321336313)

#### Tools
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance auditing
- [WAVE](https://wave.webaim.org/) - Accessibility testing
- [Can I Use](https://caniuse.com/) - Browser compatibility

#### Network Protocol References
- [RFC 793 - TCP](https://www.ietf.org/rfc/rfc793.txt)
- [RFC 791 - IP](https://www.ietf.org/rfc/rfc791.txt)
- [RFC 2616 - HTTP/1.1](https://www.ietf.org/rfc/rfc2616.txt)

---

## Important Notes

### Multi-Page Site Behavior
- Vite automatically detects all `index.html` files
- Each directory with index.html becomes a route
- Directory structure is preserved in build output
- All assets are bundled and optimized

### Branch Management
- Source code stays on `main` or `master` branch
- Built files deploy to `gh-pages` branch (automatic)
- Never edit `gh-pages` branch directly
- Use meaningful commit messages for deployments

### Repository Configuration
- **Project sites**: Any repository name → `https://username.github.io/repo-name`
- **User sites**: Must be named `username.github.io` → `https://username.github.io`
- Public repositories required for free GitHub Pages
- Private repositories need GitHub Pro

### Best Practices
1. Always test locally before deploying
2. Use semantic versioning for releases
3. Keep sensitive data out of repository
4. Optimize images before committing
5. Document your code and APIs
6. Follow accessibility guidelines
7. Monitor performance metrics

---

*Last updated: 2024*
*Version: 2.0.0*