# Complete Site Refactoring Plan
## CPSC 3600 Networking Visualizations - Module-Based Rebuild

**Document Version**: 1.1
**Date**: 2025-11-03
**Last Updated**: 2025-11-03
**Approach**: Complete Rebuild (Option B)
**Status**: In Progress - Phases 1 & 2 Complete + Academic Redesign Complete (22% overall)
**Next Phase**: Phase 3 - Module 1 Migration

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Progress Update](#progress-update-november-3-2025)
3. [Current State Analysis](#current-state-analysis)
4. [Target Architecture](#target-architecture)
5. [Directory Structure](#directory-structure)
6. [Content Specifications](#content-specifications)
7. [Component Architecture](#component-architecture)
8. [Design System](#design-system) → See [STYLE_GUIDE.md](STYLE_GUIDE.md) for complete guidelines
9. [Migration Strategy](#migration-strategy)
10. [Implementation Phases](#implementation-phases)
11. [Testing & Validation](#testing--validation)
12. [Deployment Strategy](#deployment-strategy)
13. [Appendices](#appendices)

---

## Executive Summary

### Objective
Transform the current content-type-organized site (demos/tutorials/examples) into a curriculum-aligned, module-based educational platform that mirrors the CPSC 3600 course structure.

### Scope
- **Complete replacement** of existing site structure
- **Preservation** of 3 existing demos and shared infrastructure
- **Creation** of 6 module landing pages
- **Development** of 27 lesson pages, 22 demo pages, 9 practice sets
- **Total**: 56 distinct learning activities across 6 modules

### Success Criteria
- Clear linear progression through 6 modules
- Consistent user experience across all content types
- All existing demos successfully integrated
- Responsive, accessible, and performant
- Maintainable codebase with reusable components

### Timeline Estimate
- **Phase 1** (Core Structure): 3-5 days
- **Phase 2** (Module 1 Complete): 5-7 days
- **Phase 3** (Modules 2-3): 10-14 days
- **Phase 4** (Modules 4-6): 10-14 days
- **Phase 5** (Polish & Testing): 3-5 days
- **Total**: 31-45 days (developer time)

---

## Progress Update (November 3, 2025)

### Completed Work

#### Phase 1: Preparation ✓ COMPLETE
- Created complete directory structure for all 6 modules (60+ directories)
- Updated `vite.config.js` to exclude old structure (demos, tutorials, examples)
- Created `shared/constants/modules.js` with complete module configuration (270+ lines)
- Created feature branch: `refactor/module-based-structure`
- Created backup tag: `backup-before-refactor`
- **Commit**: [Various commits for directory structure and configuration]

#### Phase 2: Core Infrastructure ✓ COMPLETE
- **Shared Constants**: Updated `shared/constants/colors.js` with professional module colors
- **Shared Styles** (6 CSS files, ~1,900 lines total):
  - `main.css` - 95 CSS variables, global design system
  - `module.css` - Module landing page styles
  - `lesson.css` - Lesson page styles
  - `demo.css` - Demo page styles
  - `practice.css` - Practice page styles
  - `components.css` - Reusable UI components
- **Shared Components** (5 JavaScript files, ~600 lines total):
  - `ModuleCard.js` - Dynamic module card generation
  - `Breadcrumb.js` - Auto breadcrumb navigation
  - `ProgressTracker.js` - localStorage-based progress tracking
  - `LessonNavigator.js` - Context-aware navigation
  - `ActivityList.js` - Activity lists with completion indicators
- **New Home Page**:
  - Replaced old `index.html` with new module-based home page
  - Created `main.js` for dynamic module rendering
  - Created `style.css` for home page styles
- **Commit**: [Multiple commits for components and styles]

#### Academic Redesign ✓ COMPLETE
Following user feedback that the initial design was "too marketing-focused" and "inappropriate for an academic page," the home page underwent a complete visual redesign:

**Changes Made**:
- Replaced marketing-style gradient hero with traditional academic header
- Removed promotional language and colorful accents
- Simplified module cards to academic list-style layout
- Changed "Start Module" → "View Module"
- Changed "demos" → "Demonstrations"
- Added formal course header with department information
- Added catalog-style course description
- Maintained all accessibility features (ARIA, keyboard nav, skip links)

**User Feedback**: "Great, much better. Please commit our changes"

**Files Modified**:
- `index.html` - Academic header and structure
- `style.css` - Traditional course header styles
- `shared/styles/module.css` - List-based module card design
- `shared/components/ModuleCard.js` - Simplified component

**Commit**: fabc5fa - "Redesign home page with academic aesthetic"
**Documentation**: See [DESIGN_CHANGES_APPLIED.md](DESIGN_CHANGES_APPLIED.md) for comprehensive details

### Current Status
- **Overall Progress**: 22% complete (Phases 1-2 of 9, plus Academic Redesign)
- **Preview Server**: Running on http://localhost:4175/ with production build
- **Next Milestone**: Phase 3 - Module 1 Migration

### Key Achievements
1. ✅ Complete directory structure for all 6 modules
2. ✅ Comprehensive design system with 95+ CSS variables
3. ✅ Reusable component library (5 components)
4. ✅ Full accessibility implementation (WCAG AA targeted)
5. ✅ Academic-appropriate visual design
6. ✅ Module-based home page with dynamic card generation

### Files Created (Selection)
- [shared/constants/modules.js](shared/constants/modules.js) - 270+ lines of module configuration
- [shared/styles/main.css](shared/styles/main.css) - Global design system
- [shared/styles/module.css](shared/styles/module.css) - Module card styles
- [shared/components/ModuleCard.js](shared/components/ModuleCard.js) - Module card component
- [shared/components/Breadcrumb.js](shared/components/Breadcrumb.js) - Breadcrumb navigation
- [shared/components/ProgressTracker.js](shared/components/ProgressTracker.js) - Progress tracking
- [index.html](index.html) - New home page (academic design)
- [main.js](main.js) - Home page JavaScript
- [style.css](style.css) - Home page styles
- [DESIGN_CHANGES_APPLIED.md](DESIGN_CHANGES_APPLIED.md) - Academic redesign documentation

### Design & Style Guidelines
All new pages must conform to the comprehensive style guide:
- **[STYLE_GUIDE.md](STYLE_GUIDE.md)** - Complete design system, theming guidelines, component templates, and accessibility requirements
- Ensures consistent academic aesthetic across all modules, lessons, demos, and practice activities
- Includes color system, typography, spacing, component patterns, and code examples

### What's Next
Phase 3 will focus on migrating the 3 existing demos to Module 1 structure and creating lesson placeholders. See [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) for detailed task tracking.

---

## Current State Analysis

### Existing Content Inventory

#### Live Demos (3)
1. **Packet Journey** - Network latency visualization
   - Location: `demos/packet-journey/`
   - Files: 14 JavaScript modules, 1 HTML, 1 CSS
   - Status: Production-ready
   - Target: Module 1 - Big Picture

2. **Ladder Diagram** - Packet timing visualization
   - Location: `demos/ladder-diagram/`
   - Files: 15 JavaScript modules, 1 HTML, 1 CSS
   - Status: Production-ready
   - Target: Module 1 - Big Picture

3. **Latency Practice** - Interactive practice problems
   - Location: `demos/latency-practice/`
   - Files: 30+ JavaScript modules, 1 HTML, 1 CSS
   - Status: Production-ready
   - Target: Module 1 - Big Picture (practice section)

#### Shared Infrastructure (Keep)
- `shared/js/network-base.js` - Base classes (NetworkNode, Packet, NetworkSimulation)
- `shared/js/canvas-utils.js` - Drawing utilities and helpers
- `shared/js/navigation.js` - Navigation system (needs update)
- `shared/js/code-viewer.js` - Code display component
- `shared/js/tutorial-system.js` - Tutorial framework (needs update)
- `shared/utils/` - Utility classes (AnimationController, CanvasHelper, DelayCalculator, etc.)
- `shared/constants/` - Global constants (colors, network, sizes)
- `shared/styles/main.css` - Global styles (needs update)

#### Files to Remove
- Current `index.html` (home page)
- `demos/index.html` (demos hub page)
- `tutorials/index.html` (placeholder)
- `examples/index.html` (placeholder)

### Technical Stack
- **Build Tool**: Vite 5.x
- **JavaScript**: ES6+ modules (no framework)
- **Visualization**: HTML5 Canvas and SVG
- **Styling**: CSS3 with CSS Grid and Flexbox
- **Deployment**: GitHub Pages via gh-pages branch

### Current Dependencies
```json
{
  "vite": "^5.0.8",
  "gh-pages": "^6.1.1"
}
```

---

## Target Architecture

### Design Principles

1. **Curriculum-Aligned Organization**
   - Structure mirrors course modules exactly
   - Linear progression through content
   - Clear learning pathways

2. **Consistent Content Types**
   - Lessons: Conceptual explanations
   - Demos: Interactive visualizations
   - Practice: Problem-solving activities

3. **Reusable Components**
   - Template-based page generation
   - Shared UI components
   - Common interaction patterns

4. **Progressive Enhancement**
   - Works without JavaScript (where possible)
   - Graceful degradation
   - Mobile-responsive

5. **Maintainability**
   - Clear file organization
   - Documented code
   - Separation of concerns

### Site Map

```
Home Page (Course Overview)
├── Module 1: The Big Picture
│   ├── Lesson 1: Internet Structure
│   ├── Lesson 2: Protocol Layers
│   ├── Lesson 3: Network Performance
│   ├── Lesson 4: Delay & Throughput
│   ├── Demo: Packet Journey
│   ├── Demo: Ladder Diagram
│   ├── Demo: Network Topology Explorer
│   └── Practice: Latency Calculator
│
├── Module 2: Application Layer
│   ├── Lesson 1: Architectures
│   ├── Lesson 2: HTTP
│   ├── Lesson 3: DNS
│   ├── Lesson 4: BitTorrent
│   ├── Demo: HTTP Request/Response
│   ├── Demo: DNS Resolution
│   ├── Demo: P2P File Sharing
│   └── Practice: HTTP & DNS Problems
│
├── Module 3: Transport Layer
│   ├── Lesson 1: Transport Services
│   ├── Lesson 2: UDP
│   ├── Lesson 3: RDT Principles
│   ├── Lesson 4: TCP
│   ├── Demo: UDP vs TCP
│   ├── Demo: RDT Protocols
│   ├── Demo: TCP Handshake
│   ├── Demo: TCP Congestion Control
│   └── Practice: TCP Scenarios
│
├── Module 4: Network Layer
│   ├── Lesson 1: Network Layer Overview
│   ├── Lesson 2: IPv4, IPv6, CIDR
│   ├── Lesson 3: NAT, DHCP
│   ├── Lesson 4: Routing Principles
│   ├── Lesson 5: Queuing
│   ├── Demo: IP Forwarding
│   ├── Demo: Routing Algorithms
│   ├── Demo: NAT Translation
│   ├── Demo: Queue Management
│   ├── Practice: Subnetting Calculator
│   └── Practice: Routing Tables
│
├── Module 5: Link Layer
│   ├── Lesson 1: Link Layer Overview
│   ├── Lesson 2: Ethernet
│   ├── Lesson 3: Switches & Spanning Tree
│   ├── Lesson 4: Collision Management
│   ├── Lesson 5: Encoding & Framing
│   ├── Lesson 6: ARP
│   ├── Lesson 7: WiFi
│   ├── Demo: Ethernet Frame
│   ├── Demo: Switch Learning
│   ├── Demo: Spanning Tree Protocol
│   ├── Demo: CSMA/CD
│   ├── Demo: ARP Resolution
│   └── Practice: Link Layer Scenarios
│
└── Module 6: Network Security
    ├── Lesson 1: Security Basics
    ├── Lesson 2: Encryption
    ├── Lesson 3: Authentication
    ├── Demo: Symmetric Encryption
    ├── Demo: Public Key Cryptography
    ├── Demo: TLS Handshake
    └── Practice: Security Scenarios
```

---

## Directory Structure

### Complete Directory Tree

```
clemson-cpsc-3600.github.io/
├── index.html                                    # NEW: Course home page
├── main.js                                       # NEW: Home page logic
├── style.css                                     # NEW: Home page styles
│
├── modules/                                      # NEW: Main content directory
│   │
│   ├── module1-big-picture/
│   │   ├── index.html                           # NEW: Module 1 landing
│   │   ├── module1.js                           # NEW: Module 1 logic
│   │   ├── module1.css                          # NEW: Module 1 styles
│   │   │
│   │   ├── lessons/
│   │   │   ├── 01-internet-structure/
│   │   │   │   ├── index.html                   # NEW: Lesson page
│   │   │   │   ├── lesson.js                    # NEW: Lesson interactivity
│   │   │   │   └── diagrams/                    # NEW: Lesson images
│   │   │   │       └── internet-hierarchy.svg
│   │   │   │
│   │   │   ├── 02-protocol-layers/
│   │   │   │   ├── index.html                   # NEW
│   │   │   │   ├── lesson.js                    # NEW
│   │   │   │   └── diagrams/
│   │   │   │       ├── protocol-stack.svg
│   │   │   │       └── encapsulation.svg
│   │   │   │
│   │   │   ├── 03-network-performance/
│   │   │   │   ├── index.html                   # NEW
│   │   │   │   ├── lesson.js                    # NEW
│   │   │   │   └── diagrams/
│   │   │   │
│   │   │   └── 04-delay-throughput/
│   │   │       ├── index.html                   # NEW
│   │   │       ├── lesson.js                    # NEW
│   │   │       └── diagrams/
│   │   │
│   │   ├── demos/
│   │   │   ├── packet-journey/                  # MOVED from demos/
│   │   │   │   ├── index.html                   # UPDATE: New nav
│   │   │   │   ├── main.js                      # KEEP
│   │   │   │   ├── styles.css                   # UPDATE: New theme
│   │   │   │   └── js/                          # KEEP: All modules
│   │   │   │
│   │   │   ├── ladder-diagram/                  # MOVED from demos/
│   │   │   │   ├── index.html                   # UPDATE: New nav
│   │   │   │   ├── main.js                      # KEEP
│   │   │   │   ├── styles.css                   # UPDATE: New theme
│   │   │   │   └── js/                          # KEEP: All modules
│   │   │   │
│   │   │   └── network-topology/               # NEW: Build from scratch
│   │   │       ├── index.html
│   │   │       ├── main.js
│   │   │       ├── styles.css
│   │   │       └── js/
│   │   │           ├── NetworkTopology.js
│   │   │           ├── TopologyBuilder.js
│   │   │           └── InternetStructure.js
│   │   │
│   │   └── practice/
│   │       └── latency-calculator/              # MOVED from demos/latency-practice/
│   │           ├── index.html                   # UPDATE: New nav
│   │           ├── main.js                      # KEEP
│   │           ├── styles.css                   # UPDATE: New theme
│   │           └── js/                          # KEEP: All modules
│   │
│   ├── module2-application/
│   │   ├── index.html                           # NEW
│   │   ├── module2.js                           # NEW
│   │   ├── module2.css                          # NEW
│   │   │
│   │   ├── lessons/
│   │   │   ├── 01-architectures/
│   │   │   │   ├── index.html                   # NEW
│   │   │   │   └── diagrams/
│   │   │   ├── 02-http/
│   │   │   │   ├── index.html                   # NEW
│   │   │   │   └── diagrams/
│   │   │   ├── 03-dns/
│   │   │   │   ├── index.html                   # NEW
│   │   │   │   └── diagrams/
│   │   │   └── 04-bittorrent/
│   │   │       ├── index.html                   # NEW
│   │   │       └── diagrams/
│   │   │
│   │   ├── demos/
│   │   │   ├── http-request-response/          # NEW
│   │   │   │   ├── index.html
│   │   │   │   ├── main.js
│   │   │   │   ├── styles.css
│   │   │   │   └── js/
│   │   │   │       ├── HTTPVisualizer.js
│   │   │   │       ├── RequestBuilder.js
│   │   │   │       └── ResponseParser.js
│   │   │   │
│   │   │   ├── dns-resolution/                  # NEW
│   │   │   │   ├── index.html
│   │   │   │   ├── main.js
│   │   │   │   ├── styles.css
│   │   │   │   └── js/
│   │   │   │       ├── DNSVisualizer.js
│   │   │   │       ├── DNSHierarchy.js
│   │   │   │       └── QueryResolver.js
│   │   │   │
│   │   │   └── peer-to-peer/                   # NEW
│   │   │       ├── index.html
│   │   │       ├── main.js
│   │   │       ├── styles.css
│   │   │       └── js/
│   │   │           ├── P2PSimulation.js
│   │   │           ├── PeerNetwork.js
│   │   │           └── FileDistribution.js
│   │   │
│   │   └── practice/
│   │       └── http-dns-problems/              # NEW
│   │           ├── index.html
│   │           ├── main.js
│   │           ├── styles.css
│   │           └── js/
│   │               ├── ProblemEngine.js
│   │               └── problems/
│   │                   ├── http-problems.js
│   │                   └── dns-problems.js
│   │
│   ├── module3-transport/
│   │   ├── index.html                           # NEW
│   │   ├── module3.js                           # NEW
│   │   ├── module3.css                          # NEW
│   │   │
│   │   ├── lessons/
│   │   │   ├── 01-transport-services/
│   │   │   │   └── index.html                   # NEW
│   │   │   ├── 02-udp/
│   │   │   │   └── index.html                   # NEW
│   │   │   ├── 03-rdt-principles/
│   │   │   │   └── index.html                   # NEW
│   │   │   └── 04-tcp/
│   │   │       └── index.html                   # NEW
│   │   │
│   │   ├── demos/
│   │   │   ├── udp-vs-tcp/                     # NEW
│   │   │   │   └── [standard demo structure]
│   │   │   ├── rdt-protocols/                  # NEW
│   │   │   │   └── [standard demo structure]
│   │   │   ├── tcp-handshake/                  # NEW
│   │   │   │   └── [standard demo structure]
│   │   │   └── tcp-congestion/                 # NEW
│   │   │       └── [standard demo structure]
│   │   │
│   │   └── practice/
│   │       └── tcp-scenarios/                  # NEW
│   │           └── [standard practice structure]
│   │
│   ├── module4-network/
│   │   ├── index.html                           # NEW
│   │   ├── module4.js                           # NEW
│   │   ├── module4.css                          # NEW
│   │   │
│   │   ├── lessons/
│   │   │   ├── 01-network-layer-overview/      # NEW
│   │   │   ├── 02-ipv4-ipv6/                   # NEW
│   │   │   ├── 03-nat-dhcp/                    # NEW
│   │   │   ├── 04-routing-principles/          # NEW
│   │   │   └── 05-queuing/                     # NEW
│   │   │
│   │   ├── demos/
│   │   │   ├── ip-forwarding/                  # NEW
│   │   │   ├── routing-algorithms/             # NEW
│   │   │   ├── nat-translation/                # NEW
│   │   │   └── queue-management/               # NEW
│   │   │
│   │   └── practice/
│   │       ├── subnetting/                     # NEW
│   │       └── routing-tables/                 # NEW
│   │
│   ├── module5-link/
│   │   ├── index.html                           # NEW
│   │   ├── module5.js                           # NEW
│   │   ├── module5.css                          # NEW
│   │   │
│   │   ├── lessons/
│   │   │   ├── 01-link-layer-overview/         # NEW
│   │   │   ├── 02-ethernet/                    # NEW
│   │   │   ├── 03-switches-spanning-tree/      # NEW
│   │   │   ├── 04-collision-management/        # NEW
│   │   │   ├── 05-encoding-framing/            # NEW
│   │   │   ├── 06-arp/                         # NEW
│   │   │   └── 07-wifi/                        # NEW
│   │   │
│   │   ├── demos/
│   │   │   ├── ethernet-frame/                 # NEW
│   │   │   ├── switch-learning/                # NEW
│   │   │   ├── spanning-tree/                  # NEW
│   │   │   ├── csma-cd/                        # NEW
│   │   │   └── arp-resolution/                 # NEW
│   │   │
│   │   └── practice/
│   │       └── link-layer-scenarios/           # NEW
│   │
│   └── module6-security/
│       ├── index.html                           # NEW
│       ├── module6.js                           # NEW
│       ├── module6.css                          # NEW
│       │
│       ├── lessons/
│       │   ├── 01-security-basics/             # NEW
│       │   ├── 02-encryption/                  # NEW
│       │   └── 03-authentication/              # NEW
│       │
│       ├── demos/
│       │   ├── symmetric-encryption/           # NEW
│       │   ├── public-key/                     # NEW
│       │   └── tls-handshake/                  # NEW
│       │
│       └── practice/
│           └── security-scenarios/             # NEW
│
├── shared/                                       # KEEP with updates
│   ├── js/
│   │   ├── network-base.js                     # KEEP: Base classes
│   │   ├── canvas-utils.js                     # KEEP: Drawing utilities
│   │   ├── navigation.js                       # UPDATE: New module structure
│   │   ├── code-viewer.js                      # KEEP: Code display
│   │   ├── tutorial-system.js                  # UPDATE: For lessons
│   │   ├── module-navigation.js                # NEW: Module-specific nav
│   │   ├── lesson-template.js                  # NEW: Lesson page framework
│   │   ├── demo-template.js                    # NEW: Demo page framework
│   │   └── practice-template.js                # NEW: Practice page framework
│   │
│   ├── components/                             # NEW: Reusable UI components
│   │   ├── ModuleCard.js                       # NEW: Home page cards
│   │   ├── ProgressTracker.js                  # NEW: Progress indicators
│   │   ├── Breadcrumb.js                       # NEW: Breadcrumb nav
│   │   ├── LessonNavigator.js                  # NEW: Prev/Next lesson
│   │   └── ActivityList.js                     # NEW: Module activity lists
│   │
│   ├── utils/                                   # KEEP existing + new
│   │   ├── AnimationController.js              # KEEP
│   │   ├── CanvasHelper.js                     # KEEP
│   │   ├── DelayCalculator.js                  # KEEP
│   │   ├── NetworkFormatter.js                 # KEEP
│   │   ├── SVGBuilder.js                       # KEEP
│   │   └── ModuleConfig.js                     # NEW: Module metadata
│   │
│   ├── constants/                               # KEEP with updates
│   │   ├── colors.js                           # UPDATE: New color scheme
│   │   ├── network.js                          # KEEP
│   │   ├── sizes.js                            # KEEP
│   │   └── modules.js                          # NEW: Module definitions
│   │
│   ├── styles/                                  # UPDATE existing + new
│   │   ├── main.css                            # UPDATE: Global styles
│   │   ├── module.css                          # NEW: Module page styles
│   │   ├── lesson.css                          # NEW: Lesson page styles
│   │   ├── demo.css                            # NEW: Demo page styles
│   │   ├── practice.css                        # NEW: Practice page styles
│   │   ├── components.css                      # NEW: Component styles
│   │   └── utilities.css                       # NEW: Utility classes
│   │
│   └── templates/                               # NEW: HTML templates
│       ├── module-landing.html                  # NEW: Module template
│       ├── lesson-page.html                     # NEW: Lesson template
│       ├── demo-page.html                       # NEW: Demo template
│       └── practice-page.html                   # NEW: Practice template
│
├── assets/                                       # KEEP + expand
│   ├── images/
│   │   ├── module-icons/                        # NEW: Module icons
│   │   └── logos/                               # NEW: Site branding
│   └── fonts/                                    # NEW: If custom fonts needed
│
├── vite.config.js                               # UPDATE: Scan modules/
├── package.json                                 # KEEP
├── package-lock.json                            # KEEP
├── .gitignore                                   # KEEP
├── README.md                                    # UPDATE: New structure docs
├── CLAUDE.md                                    # UPDATE: New guidance
└── REFACTORING_PLAN.md                         # THIS FILE

# Files to DELETE after migration:
├── demos/index.html                             # DELETE
├── tutorials/index.html                         # DELETE
└── examples/index.html                          # DELETE
```

### File Naming Conventions

- **HTML Files**: Always `index.html` for directory-based routing
- **JavaScript Modules**: PascalCase for classes (e.g., `NetworkTopology.js`)
- **JavaScript Entry Points**: `main.js` for page entry points
- **Stylesheets**: Descriptive names (e.g., `module1.css`, `lesson.css`)
- **Directories**: kebab-case (e.g., `packet-journey`, `http-request-response`)
- **Assets**: Descriptive, lowercase with hyphens (e.g., `internet-hierarchy.svg`)

---

## Content Specifications

### Module 1: The Big Picture

**Learning Objectives**:
- Understand the structure of the Internet (edge, core, access networks)
- Explain protocol layering and service models
- Calculate network performance metrics (delay, throughput, packet loss)
- Analyze latency components in multi-hop networks

#### Lessons (4)

**Lesson 1: Internet Structure**
- File: `modules/module1-big-picture/lessons/01-internet-structure/index.html`
- Topics:
  - Network edge (hosts, clients, servers)
  - Access networks (residential, enterprise, mobile)
  - Network core (packet switching, circuit switching)
  - Internet structure (ISP hierarchy, IXPs, content provider networks)
- Diagrams needed:
  - Internet hierarchy visualization
  - Packet switching vs circuit switching
  - ISP tier structure
- Estimated reading time: 15-20 minutes

**Lesson 2: Protocol Layers**
- File: `modules/module1-big-picture/lessons/02-protocol-layers/index.html`
- Topics:
  - Why protocol layering?
  - Five-layer Internet protocol stack
  - Encapsulation and de-encapsulation
  - OSI model comparison
- Diagrams needed:
  - Protocol stack diagram
  - Encapsulation visualization
  - Layer responsibilities
- Estimated reading time: 15-20 minutes

**Lesson 3: Network Performance**
- File: `modules/module1-big-picture/lessons/03-network-performance/index.html`
- Topics:
  - Performance metrics overview
  - Delay (transmission, propagation, processing, queuing)
  - Throughput and bottleneck links
  - Packet loss causes and effects
- Diagrams needed:
  - Delay components visualization
  - Throughput bottleneck illustration
- Estimated reading time: 15-20 minutes

**Lesson 4: Delay & Throughput Calculations**
- File: `modules/module1-big-picture/lessons/04-delay-throughput/index.html`
- Topics:
  - Calculating transmission delay (L/R)
  - Calculating propagation delay (d/s)
  - End-to-end delay in multi-hop networks
  - Throughput calculations
  - Worked examples
- Diagrams needed:
  - Calculation formula reference
  - Step-by-step example diagrams
- Estimated reading time: 20-25 minutes
- Interactive elements: Inline calculators

#### Demos (3)

**Demo 1: Packet Journey** ✅ EXISTS
- File: `modules/module1-big-picture/demos/packet-journey/index.html`
- Current status: Production-ready, needs migration
- Features:
  - Visualize packet traveling through network
  - Show latency components accumulating
  - Interactive parameter adjustment
  - Multiple network scenarios
- Migration tasks:
  - Move all files from `demos/packet-journey/`
  - Update navigation to module structure
  - Apply new design system
  - Add link to Lesson 4

**Demo 2: Ladder Diagram** ✅ EXISTS
- File: `modules/module1-big-picture/demos/ladder-diagram/index.html`
- Current status: Production-ready, needs migration
- Features:
  - Timing diagram visualization
  - Multi-hop network simulation
  - Playback controls
  - Multiple scenarios
- Migration tasks:
  - Move all files from `demos/ladder-diagram/`
  - Update navigation to module structure
  - Apply new design system
  - Add link to Lesson 4

**Demo 3: Network Topology Explorer** 🆕 NEW
- File: `modules/module1-big-picture/demos/network-topology/index.html`
- Status: To be built
- Features:
  - Visualize Internet structure (edge, core, ISPs)
  - Interactive topology builder
  - Show packet path through ISP hierarchy
  - Demonstrate packet switching vs circuit switching
- Technical approach:
  - Canvas-based visualization
  - Hierarchical network layout
  - Interactive node/link creation
  - Animation of packet routing
- Related to: Lesson 1

#### Practice (1)

**Practice Set: Latency Calculator** ✅ EXISTS
- File: `modules/module1-big-picture/practice/latency-calculator/index.html`
- Current status: Production-ready, needs migration
- Features:
  - 10+ practice problems
  - Progressive hint system
  - Immediate feedback
  - Visual network diagrams
  - Score tracking
- Migration tasks:
  - Move all files from `demos/latency-practice/`
  - Rename directory to `latency-calculator`
  - Update navigation to module structure
  - Apply new design system
  - Add links to Lessons 3 & 4

---

### Module 2: Application Layer

**Learning Objectives**:
- Compare client-server and P2P architectures
- Understand HTTP protocol (requests, responses, methods, headers)
- Explain DNS hierarchy and resolution process
- Describe BitTorrent protocol and P2P file distribution

#### Lessons (4)

**Lesson 1: Application Architectures**
- File: `modules/module2-application/lessons/01-architectures/index.html`
- Topics:
  - Client-server architecture
  - Peer-to-peer (P2P) architecture
  - Hybrid architectures
  - Process communication (sockets, ports)
  - Transport service requirements
- Diagrams: Architecture comparison, socket communication

**Lesson 2: HTTP**
- File: `modules/module2-application/lessons/02-http/index.html`
- Topics:
  - HTTP overview and history
  - HTTP request/response messages
  - Methods (GET, POST, PUT, DELETE)
  - Status codes
  - Headers
  - Cookies and state management
  - HTTP/1.1, HTTP/2, HTTP/3
- Diagrams: HTTP exchange, message structure

**Lesson 3: DNS**
- File: `modules/module2-application/lessons/03-dns/index.html`
- Topics:
  - DNS purpose and services
  - DNS hierarchy (root, TLD, authoritative)
  - Record types (A, AAAA, NS, CNAME, MX)
  - Resolution process (iterative vs recursive)
  - DNS caching
  - DNS security issues
- Diagrams: DNS hierarchy, query resolution

**Lesson 4: BitTorrent**
- File: `modules/module2-application/lessons/04-bittorrent/index.html`
- Topics:
  - P2P file distribution
  - Torrent file and tracker
  - Piece selection strategies
  - Tit-for-tat incentive mechanism
  - Distributed hash tables (DHT)
- Diagrams: BitTorrent architecture, file distribution

#### Demos (3)

**Demo 1: HTTP Request/Response** 🆕 NEW
- File: `modules/module2-application/demos/http-request-response/index.html`
- Features:
  - Build HTTP requests interactively
  - See formatted request message
  - Simulate server response
  - Visualize headers and body
  - Multiple request types (GET, POST, etc.)
- Technical approach:
  - Form-based request builder
  - Syntax-highlighted message display
  - Simulated server responses
  - Status code explanations

**Demo 2: DNS Resolution** 🆕 NEW
- File: `modules/module2-application/demos/dns-resolution/index.html`
- Features:
  - Visualize DNS hierarchy
  - Animate query resolution (iterative and recursive)
  - Show DNS records at each level
  - Demonstrate caching
  - Multiple domain examples
- Technical approach:
  - Canvas or SVG hierarchy visualization
  - Animated query flow
  - Interactive query triggering
  - Cache state visualization

**Demo 3: P2P File Sharing** 🆕 NEW
- File: `modules/module2-application/demos/peer-to-peer/index.html`
- Features:
  - Simulate BitTorrent swarm
  - Visualize piece distribution
  - Show upload/download between peers
  - Demonstrate tit-for-tat
  - Peer arrival/departure
- Technical approach:
  - Canvas-based peer network
  - Animated piece transfers
  - Real-time statistics (upload/download rates)
  - Interactive peer controls

#### Practice (1)

**Practice Set: HTTP & DNS Problems** 🆕 NEW
- File: `modules/module2-application/practice/http-dns-problems/index.html`
- Problem types:
  - Parse HTTP requests/responses
  - Determine correct HTTP methods/status codes
  - Trace DNS resolution steps
  - Identify DNS record types
  - Calculate RTT for HTTP transactions
- Features:
  - 15+ problems
  - Immediate feedback
  - Hint system
  - Score tracking

---

### Module 3: Transport Layer

**Learning Objectives**:
- Understand transport layer services and multiplexing
- Explain UDP characteristics and use cases
- Describe reliable data transfer principles
- Understand TCP features (connection management, flow control, congestion control)

#### Lessons (4)

**Lesson 1: Transport Layer Services**
- File: `modules/module3-transport/lessons/01-transport-services/index.html`
- Topics:
  - Transport layer role
  - Multiplexing and demultiplexing
  - Port numbers
  - Connectionless vs connection-oriented transport
- Diagrams: Multiplexing, socket addressing

**Lesson 2: UDP**
- File: `modules/module3-transport/lessons/02-udp/index.html`
- Topics:
  - UDP characteristics
  - UDP segment structure
  - UDP checksum
  - Use cases for UDP
- Diagrams: UDP segment structure, checksum calculation

**Lesson 3: Reliable Data Transfer Principles**
- File: `modules/module3-transport/lessons/03-rdt-principles/index.html`
- Topics:
  - rdt 1.0, 2.0, 2.1, 2.2, 3.0
  - Sequence numbers and ACKs
  - Timers and retransmission
  - Pipelined protocols (Go-Back-N, Selective Repeat)
- Diagrams: FSM diagrams for each rdt version, sliding window

**Lesson 4: TCP**
- File: `modules/module3-transport/lessons/04-tcp/index.html`
- Topics:
  - TCP segment structure
  - Connection establishment (3-way handshake)
  - Connection teardown
  - Sequence numbers and ACKs
  - Flow control (receive window)
  - Congestion control (AIMD, slow start, fast recovery)
- Diagrams: TCP segment, handshake, congestion window over time

#### Demos (4)

**Demo 1: UDP vs TCP Comparison** 🆕 NEW
- File: `modules/module3-transport/demos/udp-vs-tcp/index.html`
- Features:
  - Side-by-side protocol comparison
  - Visualize UDP (fire and forget)
  - Visualize TCP (reliable, ordered)
  - Packet loss scenarios
  - Performance comparison

**Demo 2: RDT Protocols** 🆕 NEW
- File: `modules/module3-transport/demos/rdt-protocols/index.html`
- Features:
  - Step through rdt 1.0 → 3.0
  - Visualize sender/receiver FSMs
  - Show sequence numbers, ACKs, timeouts
  - Introduce errors and observe recovery
  - Compare Stop-and-Wait, GBN, SR

**Demo 3: TCP 3-Way Handshake** 🆕 NEW
- File: `modules/module3-transport/demos/tcp-handshake/index.html`
- Features:
  - Animate handshake process (SYN, SYN-ACK, ACK)
  - Show segment details (flags, sequence numbers)
  - Visualize connection teardown (FIN, ACK)
  - Demonstrate simultaneous open/close
  - Timing diagram view

**Demo 4: TCP Congestion Control** 🆕 NEW
- File: `modules/module3-transport/demos/tcp-congestion/index.html`
- Features:
  - Visualize cwnd over time
  - Show slow start, congestion avoidance, fast recovery
  - Introduce packet loss and observe reaction
  - AIMD behavior
  - Multiple TCP flows competing

#### Practice (1)

**Practice Set: TCP Scenarios** 🆕 NEW
- File: `modules/module3-transport/practice/tcp-scenarios/index.html`
- Problem types:
  - Calculate sequence numbers and ACKs
  - Determine TCP flags for given scenarios
  - Trace congestion window evolution
  - Calculate effective throughput
  - Analyze timing diagrams

---

### Module 4: Network Layer

**Learning Objectives**:
- Understand forwarding vs routing
- Explain IPv4 and IPv6 addressing
- Describe NAT, DHCP, and ICMP
- Understand routing algorithms (Link State, Distance Vector)
- Explain queuing disciplines

#### Lessons (5)

**Lesson 1: Network Layer Overview**
- File: `modules/module4-network/lessons/01-network-layer-overview/index.html`
- Topics:
  - Forwarding vs routing
  - Router architecture
  - Data plane vs control plane
  - IP service model

**Lesson 2: IPv4, IPv6, CIDR**
- File: `modules/module4-network/lessons/02-ipv4-ipv6/index.html`
- Topics:
  - IPv4 addressing and datagram format
  - Subnetting and CIDR
  - IPv4 address exhaustion
  - IPv6 addressing and datagram format
  - IPv6 transition mechanisms

**Lesson 3: NAT, DHCP**
- File: `modules/module4-network/lessons/03-nat-dhcp/index.html`
- Topics:
  - Network Address Translation (NAT)
  - NAT traversal
  - Dynamic Host Configuration Protocol (DHCP)
  - ICMP protocol

**Lesson 4: Routing Principles**
- File: `modules/module4-network/lessons/04-routing-principles/index.html`
- Topics:
  - Routing algorithms overview
  - Link State (Dijkstra's algorithm)
  - Distance Vector (Bellman-Ford algorithm)
  - Count-to-infinity problem
  - Hierarchical routing and AS
  - BGP basics

**Lesson 5: Queuing**
- File: `modules/module4-network/lessons/05-queuing/index.html`
- Topics:
  - Queuing delay and packet loss
  - Queuing disciplines (FIFO, Priority, Round Robin, WFQ)
  - Active Queue Management (RED)
  - Buffer sizing

#### Demos (4)

**Demo 1: IP Forwarding** 🆕 NEW
- File: `modules/module4-network/demos/ip-forwarding/index.html`
- Features:
  - Visualize forwarding table
  - Show longest prefix matching
  - Trace packet through router
  - Build custom forwarding tables
  - CIDR notation practice

**Demo 2: Routing Algorithms** 🆕 NEW
- File: `modules/module4-network/demos/routing-algorithms/index.html`
- Features:
  - Visualize network topology
  - Animate Dijkstra's algorithm
  - Animate Distance Vector algorithm
  - Show routing table updates
  - Compare convergence times
  - Introduce link failures

**Demo 3: NAT Translation** 🆕 NEW
- File: `modules/module4-network/demos/nat-translation/index.html`
- Features:
  - Visualize NAT table
  - Show address/port translation
  - Trace outbound and inbound packets
  - Demonstrate port forwarding
  - Show NAT benefits and limitations

**Demo 4: Queue Management** 🆕 NEW
- File: `modules/module4-network/demos/queue-management/index.html`
- Features:
  - Visualize packet queues
  - Compare FIFO, Priority, WFQ
  - Show queuing delay and loss
  - Adjust arrival/service rates
  - Real-time statistics

#### Practice (2)

**Practice Set 1: Subnetting Calculator** 🆕 NEW
- File: `modules/module4-network/practice/subnetting/index.html`
- Problem types:
  - Convert between dotted decimal and binary
  - Determine network/host portions
  - Calculate subnet masks
  - Determine number of hosts
  - CIDR notation problems

**Practice Set 2: Routing Table Problems** 🆕 NEW
- File: `modules/module4-network/practice/routing-tables/index.html`
- Problem types:
  - Longest prefix matching
  - Trace routing algorithm execution
  - Calculate shortest paths
  - Determine routing table entries
  - Handle link failures

---

### Module 5: Link Layer

**Learning Objectives**:
- Understand link layer services
- Explain Ethernet protocol and frame structure
- Describe switch learning and spanning tree
- Understand collision detection and management
- Explain ARP and WiFi basics

#### Lessons (7)

**Lesson 1: Link Layer Overview**
- File: `modules/module5-link/lessons/01-link-layer-overview/index.html`
- Topics: Services, error detection, multiple access

**Lesson 2: Ethernet**
- File: `modules/module5-link/lessons/02-ethernet/index.html`
- Topics: Ethernet history, frame structure, standards

**Lesson 3: Switches & Spanning Tree**
- File: `modules/module5-link/lessons/03-switches-spanning-tree/index.html`
- Topics: Self-learning switches, forwarding tables, STP, BPDUs

**Lesson 4: Collision Management**
- File: `modules/module5-link/lessons/04-collision-management/index.html`
- Topics: CSMA, CSMA/CD, binary exponential backoff

**Lesson 5: Encoding & Framing**
- File: `modules/module5-link/lessons/05-encoding-framing/index.html`
- Topics: Manchester encoding, 4B/5B, framing techniques

**Lesson 6: ARP**
- File: `modules/module5-link/lessons/06-arp/index.html`
- Topics: Address Resolution Protocol, ARP table, ARP messages

**Lesson 7: WiFi**
- File: `modules/module5-link/lessons/07-wifi/index.html`
- Topics: WiFi standards, CSMA/CA, hidden terminal problem

#### Demos (5)

**Demo 1: Ethernet Frame Explorer** 🆕 NEW
- Features: Interactive frame structure, field explanations

**Demo 2: Switch Learning** 🆕 NEW
- Features: Visualize MAC learning, forwarding table building, packet forwarding

**Demo 3: Spanning Tree Protocol** 🆕 NEW
- Features: Animate STP algorithm, show BPDU exchange, tree formation

**Demo 4: CSMA/CD Simulation** 🆕 NEW
- Features: Visualize collisions, show backoff algorithm, success/collision statistics

**Demo 5: ARP Resolution** 🆕 NEW
- Features: Show ARP request/reply, visualize ARP table, packet flow

#### Practice (1)

**Practice Set: Link Layer Scenarios** 🆕 NEW
- Problem types: Switch forwarding, collision scenarios, ARP table problems

---

### Module 6: Network Security

**Learning Objectives**:
- Understand basic security principles
- Explain symmetric and asymmetric encryption
- Describe authentication mechanisms
- Understand TLS/SSL handshake

#### Lessons (3)

**Lesson 1: Security Basics**
- File: `modules/module6-security/lessons/01-security-basics/index.html`
- Topics: Confidentiality, integrity, availability, authentication

**Lesson 2: Encryption**
- File: `modules/module6-security/lessons/02-encryption/index.html`
- Topics: Symmetric encryption, public key cryptography, hashing

**Lesson 3: Authentication**
- File: `modules/module6-security/lessons/03-authentication/index.html`
- Topics: Message authentication codes, digital signatures, certificates

#### Demos (3)

**Demo 1: Symmetric Encryption** 🆕 NEW
- Features: Visualize encryption/decryption, key distribution problem

**Demo 2: Public Key Cryptography** 🆕 NEW
- Features: RSA demonstration, key generation, encryption/signing

**Demo 3: TLS Handshake** 🆕 NEW
- Features: Animate TLS handshake, show certificate exchange, key agreement

#### Practice (1)

**Practice Set: Security Scenarios** 🆕 NEW
- Problem types: Encryption problems, authentication scenarios, certificate validation

---

## Component Architecture

### Page Templates

#### 1. Home Page Template

**File**: `index.html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CPSC 3600 - Computer Networks</title>
  <link rel="stylesheet" href="./shared/styles/main.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <header class="site-header">
    <div class="container">
      <h1>CPSC 3600: Computer Networks</h1>
      <p class="subtitle">Interactive Networking Visualizations</p>
    </div>
  </header>

  <main class="container">
    <section class="course-intro">
      <h2>Welcome</h2>
      <p>Learn networking concepts through interactive visualizations...</p>
    </section>

    <section class="modules-grid">
      <!-- Module cards generated by JS or static HTML -->
      <div class="module-card" data-module="1">
        <div class="module-number">Module 1</div>
        <h3>The Big Picture</h3>
        <p>Internet structure, protocol layers, network performance</p>
        <div class="module-stats">
          <span>4 lessons</span>
          <span>3 demos</span>
          <span>1 practice set</span>
        </div>
        <a href="./modules/module1-big-picture/" class="btn-primary">Start Module</a>
      </div>
      <!-- Repeat for modules 2-6 -->
    </section>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 Clemson University - CPSC 3600</p>
  </footer>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

**JavaScript** (`main.js`):
```javascript
// modules/module configuration
import { MODULES } from './shared/constants/modules.js';
import { ModuleCard } from './shared/components/ModuleCard.js';

// Initialize module cards
document.addEventListener('DOMContentLoaded', () => {
  const modulesGrid = document.querySelector('.modules-grid');

  MODULES.forEach(module => {
    const card = ModuleCard.create(module);
    modulesGrid.appendChild(card);
  });
});
```

#### 2. Module Landing Page Template

**File**: `modules/moduleX-name/index.html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module X: Title - CPSC 3600</title>
  <link rel="stylesheet" href="../../shared/styles/main.css">
  <link rel="stylesheet" href="../../shared/styles/module.css">
  <link rel="stylesheet" href="./moduleX.css">
</head>
<body>
  <header class="site-header">
    <nav class="breadcrumb">
      <a href="../../">Home</a> /
      <span>Module X: Title</span>
    </nav>
  </header>

  <main class="container">
    <div class="module-header">
      <div class="module-number">Module X</div>
      <h1>Module Title</h1>
      <p class="module-description">Brief description...</p>
    </div>

    <div class="module-content">
      <section class="content-section">
        <h2>📚 Lessons</h2>
        <ol class="activity-list">
          <li>
            <a href="./lessons/01-topic/">Lesson Title</a>
            <span class="time-estimate">15-20 min</span>
          </li>
          <!-- More lessons -->
        </ol>
      </section>

      <section class="content-section">
        <h2>🎮 Interactive Demos</h2>
        <ul class="activity-list">
          <li>
            <a href="./demos/demo-name/">Demo Title</a>
            <span class="time-estimate">10-15 min</span>
          </li>
          <!-- More demos -->
        </ul>
      </section>

      <section class="content-section">
        <h2>✏️ Practice</h2>
        <ul class="activity-list">
          <li>
            <a href="./practice/problem-set/">Practice Set Title</a>
            <span class="time-estimate">30-45 min</span>
          </li>
          <!-- More practice sets -->
        </ul>
      </section>
    </div>

    <nav class="module-navigation">
      <a href="../moduleX-1-name/" class="btn-secondary">← Previous Module</a>
      <a href="../../" class="btn-secondary">Back to Course Home</a>
      <a href="../moduleX+1-name/" class="btn-primary">Next Module →</a>
    </nav>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 Clemson University - CPSC 3600</p>
  </footer>

  <script type="module" src="./moduleX.js"></script>
</body>
</html>
```

#### 3. Lesson Page Template

**File**: `modules/moduleX-name/lessons/NN-topic/index.html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson Title - Module X - CPSC 3600</title>
  <link rel="stylesheet" href="../../../../shared/styles/main.css">
  <link rel="stylesheet" href="../../../../shared/styles/lesson.css">
</head>
<body>
  <header class="site-header">
    <nav class="breadcrumb">
      <a href="../../../../">Home</a> /
      <a href="../../">Module X</a> /
      <span>Lesson: Title</span>
    </nav>
  </header>

  <main class="container lesson-container">
    <article class="lesson-content">
      <header class="lesson-header">
        <h1>Lesson Title</h1>
        <div class="lesson-meta">
          <span class="reading-time">📖 15-20 min</span>
          <span class="lesson-number">Lesson X.Y</span>
        </div>
      </header>

      <section class="learning-objectives">
        <h2>Learning Objectives</h2>
        <ul>
          <li>Objective 1</li>
          <li>Objective 2</li>
          <li>Objective 3</li>
        </ul>
      </section>

      <section class="lesson-section">
        <h2>Section Title</h2>
        <p>Content goes here...</p>

        <figure class="diagram">
          <img src="./diagrams/diagram-name.svg" alt="Diagram description">
          <figcaption>Figure X.Y: Diagram caption</figcaption>
        </figure>

        <div class="callout callout-info">
          <strong>Key Point:</strong> Important information highlighted.
        </div>

        <div class="callout callout-example">
          <strong>Example:</strong> Worked example or scenario.
        </div>
      </section>

      <!-- More sections -->

      <section class="check-understanding">
        <h2>Check Your Understanding</h2>
        <div class="question">
          <p><strong>Q1:</strong> Question text?</p>
          <button class="reveal-answer">Show Answer</button>
          <div class="answer" hidden>
            <p><strong>A:</strong> Answer text.</p>
          </div>
        </div>
        <!-- More questions -->
      </section>

      <section class="related-content">
        <h3>Related Demos</h3>
        <ul>
          <li><a href="../../demos/demo-name/">Demo Title</a></li>
        </ul>
      </section>
    </article>

    <aside class="lesson-sidebar">
      <nav class="lesson-nav">
        <a href="../NN-1-topic/" class="btn-secondary">← Previous Lesson</a>
        <a href="../../" class="btn-secondary">Module Home</a>
        <a href="../NN+1-topic/" class="btn-primary">Next Lesson →</a>
      </nav>
    </aside>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 Clemson University - CPSC 3600</p>
  </footer>

  <script type="module" src="./lesson.js"></script>
</body>
</html>
```

#### 4. Demo Page Template

**File**: `modules/moduleX-name/demos/demo-name/index.html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Title - Module X - CPSC 3600</title>
  <link rel="stylesheet" href="../../../../shared/styles/main.css">
  <link rel="stylesheet" href="../../../../shared/styles/demo.css">
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <header class="site-header">
    <nav class="breadcrumb">
      <a href="../../../../">Home</a> /
      <a href="../../">Module X</a> /
      <span>Demo: Title</span>
    </nav>
  </header>

  <main class="demo-container">
    <header class="demo-header">
      <h1>Demo Title</h1>
      <p class="demo-description">Brief description of what this demo illustrates.</p>
    </header>

    <div class="demo-layout">
      <aside class="controls-panel">
        <h2>Controls</h2>

        <section class="control-group">
          <h3>Scenarios</h3>
          <select id="scenario-select">
            <option value="scenario1">Scenario 1</option>
            <option value="scenario2">Scenario 2</option>
          </select>
        </section>

        <section class="control-group">
          <h3>Parameters</h3>
          <label>
            Parameter 1:
            <input type="range" id="param1" min="0" max="100" value="50">
            <span id="param1-value">50</span>
          </label>
        </section>

        <section class="control-group">
          <h3>Playback</h3>
          <button id="play-btn">Play</button>
          <button id="pause-btn">Pause</button>
          <button id="reset-btn">Reset</button>
        </section>
      </aside>

      <div class="visualization-area">
        <canvas id="demo-canvas"></canvas>
        <!-- or <div id="demo-svg"></div> for SVG -->
      </div>

      <aside class="info-panel">
        <h2>What You're Seeing</h2>
        <div id="explanation-text">
          <p>Dynamic explanation based on current state...</p>
        </div>

        <details class="how-it-works">
          <summary>How It Works</summary>
          <p>Detailed explanation of the underlying concepts...</p>
        </details>
      </aside>
    </div>

    <nav class="demo-navigation">
      <a href="../../" class="btn-secondary">← Back to Module</a>
      <a href="../../practice/problem-set/" class="btn-primary">Try Practice Problems →</a>
    </nav>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 Clemson University - CPSC 3600</p>
  </footer>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

#### 5. Practice Page Template

**File**: `modules/moduleX-name/practice/problem-set/index.html`

**Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Practice: Title - Module X - CPSC 3600</title>
  <link rel="stylesheet" href="../../../../shared/styles/main.css">
  <link rel="stylesheet" href="../../../../shared/styles/practice.css">
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <header class="site-header">
    <nav class="breadcrumb">
      <a href="../../../../">Home</a> /
      <a href="../../">Module X</a> /
      <span>Practice: Title</span>
    </nav>
  </header>

  <main class="practice-container">
    <header class="practice-header">
      <h1>Practice: Title</h1>
      <div class="practice-stats">
        <span id="score">Score: 0/0</span>
        <span id="streak">Streak: 0</span>
      </div>
    </header>

    <div class="practice-layout">
      <div class="problem-area">
        <div id="problem-container">
          <!-- Problem dynamically loaded here -->
        </div>

        <div class="answer-area">
          <form id="answer-form">
            <!-- Input fields dynamically generated -->
          </form>
          <button id="check-btn" class="btn-primary">Check Answer</button>
          <button id="hint-btn" class="btn-secondary">Get Hint</button>
        </div>

        <div id="feedback" hidden>
          <!-- Feedback shown here -->
        </div>
      </div>

      <aside class="practice-sidebar">
        <section class="reference">
          <h2>Formula Reference</h2>
          <div class="formula-list">
            <!-- Relevant formulas -->
          </div>
        </section>

        <section class="problem-list">
          <h2>Problems</h2>
          <ol id="problem-nav">
            <!-- Problem navigation -->
          </ol>
        </section>
      </aside>
    </div>

    <nav class="practice-navigation">
      <a href="../../" class="btn-secondary">← Back to Module</a>
      <button id="next-problem" class="btn-primary">Next Problem →</button>
    </nav>
  </main>

  <footer class="site-footer">
    <p>&copy; 2025 Clemson University - CPSC 3600</p>
  </footer>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

### Shared Components

#### ModuleCard Component

**File**: `shared/components/ModuleCard.js`

```javascript
export class ModuleCard {
  static create(moduleData) {
    const card = document.createElement('div');
    card.className = 'module-card';
    card.dataset.module = moduleData.number;

    card.innerHTML = `
      <div class="module-number">Module ${moduleData.number}</div>
      <h3>${moduleData.title}</h3>
      <p>${moduleData.description}</p>
      <div class="module-stats">
        <span>${moduleData.lessonCount} lessons</span>
        <span>${moduleData.demoCount} demos</span>
        <span>${moduleData.practiceCount} practice sets</span>
      </div>
      <a href="${moduleData.path}" class="btn-primary">Start Module</a>
    `;

    return card;
  }
}
```

#### Breadcrumb Component

**File**: `shared/components/Breadcrumb.js`

```javascript
export class Breadcrumb {
  static create(path) {
    const nav = document.createElement('nav');
    nav.className = 'breadcrumb';

    const parts = path.split('/').filter(p => p);
    let currentPath = '';

    const links = parts.map((part, index) => {
      currentPath += `/${part}`;
      const isLast = index === parts.length - 1;

      if (isLast) {
        return `<span>${part}</span>`;
      } else {
        return `<a href="${currentPath}">${part}</a>`;
      }
    });

    nav.innerHTML = links.join(' / ');
    return nav;
  }
}
```

#### ProgressTracker Component

**File**: `shared/components/ProgressTracker.js`

```javascript
export class ProgressTracker {
  constructor(moduleNumber) {
    this.moduleNumber = moduleNumber;
    this.storageKey = `module${moduleNumber}-progress`;
    this.progress = this.loadProgress();
  }

  loadProgress() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {
      lessonsCompleted: [],
      demosCompleted: [],
      practiceCompleted: []
    };
  }

  saveProgress() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.progress));
  }

  markComplete(type, id) {
    const key = `${type}Completed`;
    if (!this.progress[key].includes(id)) {
      this.progress[key].push(id);
      this.saveProgress();
    }
  }

  isComplete(type, id) {
    const key = `${type}Completed`;
    return this.progress[key].includes(id);
  }

  getCompletionPercentage() {
    const total = this.getTotalActivities();
    const completed = this.getCompletedActivities();
    return Math.round((completed / total) * 100);
  }

  getTotalActivities() {
    // Would be defined per module
    return 0;
  }

  getCompletedActivities() {
    return this.progress.lessonsCompleted.length +
           this.progress.demosCompleted.length +
           this.progress.practiceCompleted.length;
  }

  render() {
    const container = document.createElement('div');
    container.className = 'progress-tracker';

    const percentage = this.getCompletionPercentage();
    container.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <p class="progress-text">${percentage}% Complete</p>
    `;

    return container;
  }
}
```

### Module Configuration

**File**: `shared/constants/modules.js`

```javascript
export const MODULES = [
  {
    number: 1,
    id: 'big-picture',
    title: 'The Big Picture',
    description: 'Internet structure, protocol layers, network performance',
    path: './modules/module1-big-picture/',
    lessonCount: 4,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Internet structure',
      'Protocol layering',
      'Network performance metrics',
      'Delay and throughput calculations'
    ]
  },
  {
    number: 2,
    id: 'application',
    title: 'Application Layer',
    description: 'Application architectures, HTTP, DNS, BitTorrent',
    path: './modules/module2-application/',
    lessonCount: 4,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Client-server and P2P architectures',
      'HTTP protocol',
      'DNS hierarchy and resolution',
      'BitTorrent protocol'
    ]
  },
  {
    number: 3,
    id: 'transport',
    title: 'Transport Layer',
    description: 'UDP, reliable data transfer, TCP',
    path: './modules/module3-transport/',
    lessonCount: 4,
    demoCount: 4,
    practiceCount: 1,
    topics: [
      'Transport layer services',
      'UDP protocol',
      'Reliable data transfer principles',
      'TCP connection management and congestion control'
    ]
  },
  {
    number: 4,
    id: 'network',
    title: 'Network Layer',
    description: 'IPv4, IPv6, routing, NAT, DHCP',
    path: './modules/module4-network/',
    lessonCount: 5,
    demoCount: 4,
    practiceCount: 2,
    topics: [
      'Forwarding and routing',
      'IPv4 and IPv6 addressing',
      'NAT, DHCP, ICMP',
      'Routing algorithms',
      'Queuing disciplines'
    ]
  },
  {
    number: 5,
    id: 'link',
    title: 'Link Layer',
    description: 'Ethernet, switches, spanning tree, ARP, WiFi',
    path: './modules/module5-link/',
    lessonCount: 7,
    demoCount: 5,
    practiceCount: 1,
    topics: [
      'Link layer services',
      'Ethernet protocol',
      'Self-learning switches',
      'Spanning tree protocol',
      'Collision management',
      'ARP protocol',
      'WiFi basics'
    ]
  },
  {
    number: 6,
    id: 'security',
    title: 'Network Security',
    description: 'Security basics, encryption, authentication',
    path: './modules/module6-security/',
    lessonCount: 3,
    demoCount: 3,
    practiceCount: 1,
    topics: [
      'Security principles',
      'Symmetric and asymmetric encryption',
      'Authentication mechanisms',
      'TLS/SSL handshake'
    ]
  }
];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id);
}

export function getModuleByNumber(number) {
  return MODULES.find(m => m.number === number);
}

export function getNextModule(currentNumber) {
  return MODULES.find(m => m.number === currentNumber + 1);
}

export function getPreviousModule(currentNumber) {
  return MODULES.find(m => m.number === currentNumber - 1);
}
```

---

## Design System

### Color Palette

**File**: `shared/constants/colors.js` (UPDATE)

```javascript
export const COLORS = {
  // Brand colors
  primary: '#3498db',        // Clemson orange alternative (or use actual Clemson orange: #F66733)
  primaryDark: '#2980b9',
  primaryLight: '#5dade2',

  // Module colors (distinct color per module)
  module1: '#3498db',        // Blue
  module2: '#2ecc71',        // Green
  module3: '#9b59b6',        // Purple
  module4: '#e74c3c',        // Red
  module5: '#f39c12',        // Orange
  module6: '#34495e',        // Dark gray

  // Semantic colors
  success: '#2ecc71',
  warning: '#f39c12',
  danger: '#e74c3c',
  info: '#3498db',

  // Network visualization colors
  node: '#4a90e2',
  packet: '#2ecc71',
  link: '#7f8c8d',
  linkActive: '#3498db',

  // UI colors
  background: '#f8f9fa',
  backgroundAlt: '#ffffff',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  border: '#ddd',
  borderDark: '#bdc3c7',

  // Interactive states
  hover: '#5dade2',
  active: '#2980b9',
  disabled: '#95a5a6',

  // Code highlighting
  codeBackground: '#f4f4f4',
  codeBorder: '#ddd',
  codeKeyword: '#d73a49',
  codeString: '#032f62',
  codeComment: '#6a737d',
  codeFunction: '#6f42c1',
};
```

### Typography

```css
/* shared/styles/main.css */

:root {
  /* Font families */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
               'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;

  /* Font sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */

  /* Line heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;

  /* Font weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-normal);
  color: var(--color-text);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-top: 0;
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

code, pre {
  font-family: var(--font-mono);
  font-size: 0.9em;
}
```

### Spacing System

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

### Layout Components

```css
/* shared/styles/main.css */

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-narrow {
  max-width: 800px;
}

.container-wide {
  max-width: 1400px;
}

/* Grid systems */
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-6); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-6); }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}

/* Flexbox utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
```

### Button Styles

```css
/* shared/styles/components.css */

.btn {
  display: inline-block;
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-decoration: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.btn-secondary:hover {
  background-color: var(--color-primary);
  color: white;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}
```

### Card Styles

```css
/* shared/styles/components.css */

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: var(--space-6);
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.card-body {
  margin-bottom: var(--space-4);
}

.card-footer {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}
```

### Module-Specific Styles

```css
/* shared/styles/module.css */

.module-card {
  /* Extends .card */
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg,
    var(--color-module, var(--color-primary)),
    var(--color-module-light, var(--color-primary-light))
  );
}

.module-number {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background-color: var(--color-module, var(--color-primary));
  color: white;
  border-radius: 4px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-3);
}

.module-stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
}

.module-stats span::before {
  content: '• ';
  color: var(--color-module, var(--color-primary));
}
```

---

## Migration Strategy

### Phase 1: Preparation (1 day) ✓ COMPLETE

#### 1.1 Create New Directory Structure
```bash
# Create module directories
mkdir -p modules/module{1..6}-{big-picture,application,transport,network,link,security}

# Create subdirectories for Module 1
mkdir -p modules/module1-big-picture/{lessons,demos,practice}
mkdir -p modules/module1-big-picture/lessons/{01-internet-structure,02-protocol-layers,03-network-performance,04-delay-throughput}
mkdir -p modules/module1-big-picture/demos/{packet-journey,ladder-diagram,network-topology}
mkdir -p modules/module1-big-picture/practice/latency-calculator

# Create shared component directories
mkdir -p shared/components
mkdir -p shared/templates
mkdir -p shared/styles

# Create assets directories
mkdir -p assets/images/module-icons
```

#### 1.2 Update Configuration Files

**Update `vite.config.js`**:
```javascript
function scanDir(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    // Update excludeDirs to include old structure
    const excludeDirs = ['node_modules', 'dist', '.git', 'shared', 'demos', 'tutorials', 'examples'];

    // Rest of function...
  });
}
```

#### 1.3 Create Module Constants

Create `shared/constants/modules.js` with complete module definitions (see Component Architecture section above).

#### 1.4 Git Branch Strategy

```bash
# Create feature branch for refactoring
git checkout -b refactor/module-based-structure

# Create backup tag of current state
git tag backup-before-refactor

# Push branch
git push -u origin refactor/module-based-structure
```

### Phase 2: Core Infrastructure (2-3 days) ✓ COMPLETE

#### 2.1 Build Shared Components

**Priority order**:
1. `shared/constants/modules.js` - Module configuration
2. `shared/styles/main.css` - Updated global styles
3. `shared/styles/module.css` - Module page styles
4. `shared/styles/lesson.css` - Lesson page styles
5. `shared/styles/demo.css` - Demo page styles
6. `shared/styles/practice.css` - Practice page styles
7. `shared/components/ModuleCard.js` - Home page cards
8. `shared/components/Breadcrumb.js` - Navigation
9. `shared/components/ProgressTracker.js` - Progress tracking
10. Update `shared/js/navigation.js` - New structure

#### 2.2 Create Templates

1. `shared/templates/module-landing.html`
2. `shared/templates/lesson-page.html`
3. `shared/templates/demo-page.html`
4. `shared/templates/practice-page.html`

#### 2.3 Build New Home Page

1. Create new `index.html`
2. Create `main.js` for home page logic
3. Create `style.css` for home page styles
4. Test responsive design

### Phase 3: Module 1 Migration (2-3 days)

#### 3.1 Create Module 1 Structure

1. Build `modules/module1-big-picture/index.html` using module template
2. Create `modules/module1-big-picture/module1.js`
3. Create `modules/module1-big-picture/module1.css`

#### 3.2 Migrate Existing Demos

**Packet Journey**:
```bash
# Copy demo files
cp -r demos/packet-journey/* modules/module1-big-picture/demos/packet-journey/

# Update index.html:
# - Update stylesheet links (../../../../shared/styles/main.css)
# - Update navigation breadcrumbs
# - Apply module 1 theme color

# Update styles.css:
# - Import shared demo styles
# - Apply module 1 color scheme

# Test demo functionality
npm run dev
# Navigate to /modules/module1-big-picture/demos/packet-journey/
```

**Ladder Diagram**:
```bash
# Copy demo files
cp -r demos/ladder-diagram/* modules/module1-big-picture/demos/ladder-diagram/

# Same updates as Packet Journey
```

**Latency Practice**:
```bash
# Copy practice files
cp -r demos/latency-practice/* modules/module1-big-picture/practice/latency-calculator/

# Update index.html and styles
```

#### 3.3 Create Module 1 Lessons

For each lesson (01-internet-structure through 04-delay-throughput):

1. Copy `shared/templates/lesson-page.html` to lesson directory
2. Rename to `index.html`
3. Fill in lesson-specific content:
   - Learning objectives
   - Section content
   - Diagrams (create placeholder SVGs)
   - Check understanding questions
   - Related demo links
4. Create `lesson.js` for interactivity (answer reveals, etc.)
5. Create `diagrams/` folder with placeholder diagrams

**Content sources**:
- Use instructor's existing slides/notes
- Reference standard networking textbooks (Kurose & Ross)
- Create simplified, web-friendly versions

#### 3.4 Testing Module 1

- Test all internal links
- Test navigation flow
- Test responsive design on mobile
- Verify existing demos still work correctly
- Test lesson interactivity

### Phase 4: Modules 2-6 Structure (3-5 days)

For each remaining module (2-6):

#### 4.1 Create Module Landing Pages

1. Copy module template
2. Customize for module number and topics
3. Create activity lists (lessons, demos, practice)
4. Add module-specific color scheme

#### 4.2 Create Lesson Placeholders

For each lesson in the module:
1. Create directory structure
2. Copy lesson template
3. Add basic outline (heading and learning objectives only)
4. Mark as "Content coming soon"

#### 4.3 Create Demo Placeholders

For each demo in the module:
1. Create directory structure
2. Copy demo template
3. Add demo title and description
4. Add "Under construction" message with expected topics
5. Basic layout (controls panel, viz area, info panel)

#### 4.4 Create Practice Placeholders

For each practice set:
1. Create directory structure
2. Copy practice template
3. Add practice set title and description
4. Mark as "Coming soon"

### Phase 5: Build Priority Demos (5-7 days)

**Priority order** (based on typical course sequence):

1. **Module 2 - HTTP Request/Response** (Day 1-2)
   - Form-based request builder
   - Message formatting
   - Response simulation

2. **Module 2 - DNS Resolution** (Day 2-3)
   - Hierarchy visualization
   - Query animation
   - Caching demonstration

3. **Module 3 - TCP Handshake** (Day 3-4)
   - Connection establishment animation
   - Segment details display
   - Timing diagram

4. **Module 3 - TCP Congestion Control** (Day 4-5)
   - cwnd evolution graph
   - Algorithm phases visualization
   - Packet loss introduction

5. **Module 4 - IP Forwarding** (Day 5-6)
   - Forwarding table display
   - Longest prefix matching
   - Packet trace

6. **Module 4 - Routing Algorithms** (Day 6-7)
   - Network topology builder
   - Dijkstra animation
   - Distance vector animation

### Phase 6: Content Development (Ongoing)

This phase happens in parallel with demo development or afterward, depending on priorities.

#### 6.1 Lesson Content Writing

For each module, flesh out lesson pages:

1. **Research and outline**:
   - Review instructor slides/notes
   - Identify key concepts
   - Determine diagrams needed

2. **Write content**:
   - Introduce concept
   - Explain with examples
   - Add worked examples where appropriate
   - Write check understanding questions

3. **Create diagrams**:
   - Use vector graphics (SVG)
   - Keep style consistent
   - Ensure accessibility (alt text)

4. **Add interactivity**:
   - Inline calculators
   - Interactive diagrams
   - Answer reveal buttons

#### 6.2 Practice Problem Development

For each practice set:

1. **Design problem types**:
   - Calculation problems
   - Scenario analysis
   - Protocol trace problems
   - Configuration problems

2. **Create problem bank**:
   - Write 15-20 problems per set
   - Vary difficulty
   - Provide hints and solutions

3. **Implement problem engine**:
   - Random problem selection
   - Answer validation
   - Feedback generation
   - Score tracking

### Phase 7: Polish & Optimization (2-3 days)

#### 7.1 Design Consistency

- Review all pages for design consistency
- Ensure module color schemes are applied correctly
- Check typography and spacing
- Verify responsive design across devices

#### 7.2 Performance Optimization

- Optimize images (compress, use appropriate formats)
- Minimize CSS and JavaScript
- Implement lazy loading for images
- Test load times

#### 7.3 Accessibility

- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Check color contrast ratios
- Add skip links

#### 7.4 Browser Testing

- Test on Chrome, Firefox, Safari, Edge
- Test on mobile browsers (iOS Safari, Chrome mobile)
- Fix any browser-specific issues

### Phase 8: Documentation (1 day)

#### 8.1 Update README

Document new structure, including:
- Directory organization
- How to add new modules/lessons/demos
- Development workflow
- Build and deployment process

#### 8.2 Update CLAUDE.md

Update guidance for Claude Code:
- New directory structure
- Module-based organization
- Component architecture
- Where to find templates

#### 8.3 Create Contributing Guide

If applicable:
- How to contribute new content
- Content style guide
- Code style guide
- Pull request process

### Phase 9: Deployment (1 day)

#### 9.1 Final Build

```bash
# Clean build
rm -rf dist
npm run build

# Verify build output
ls -la dist/
```

#### 9.2 Pre-deployment Testing

- Test built site locally: `npm run preview`
- Check all routes work
- Verify asset loading
- Test on multiple devices

#### 9.3 Deploy to GitHub Pages

```bash
# Deploy using gh-pages
npm run deploy

# Or use GitHub Actions workflow
git push origin refactor/module-based-structure
# Trigger deployment workflow
```

#### 9.4 Post-deployment Verification

- Check live site
- Test all modules
- Verify demos work
- Check for 404s
- Test on mobile devices

#### 9.5 Merge to Main

```bash
# Merge feature branch
git checkout main
git merge refactor/module-based-structure
git push origin main

# Tag release
git tag v2.0.0-module-structure
git push origin v2.0.0-module-structure
```

---

## Testing & Validation

### Testing Checklist

#### Functionality Testing

**Home Page**:
- [ ] Module cards display correctly
- [ ] Module cards link to correct module pages
- [ ] Module stats are accurate
- [ ] Responsive design works (mobile, tablet, desktop)

**Module Landing Pages** (for each module):
- [ ] Breadcrumb navigation works
- [ ] All lesson links work
- [ ] All demo links work
- [ ] All practice links work
- [ ] Previous/Next module navigation works
- [ ] Back to home link works
- [ ] Module color scheme applied correctly

**Lesson Pages** (sample from each module):
- [ ] Content displays correctly
- [ ] Diagrams load properly
- [ ] Learning objectives are clear
- [ ] Check understanding questions work
- [ ] Answer reveal buttons work
- [ ] Related demo links work
- [ ] Previous/Next lesson navigation works
- [ ] Breadcrumb navigation works

**Demo Pages** (all existing + new demos):
- [ ] Canvas/SVG renders correctly
- [ ] Controls panel is functional
- [ ] All parameters update visualization
- [ ] Scenario selection works
- [ ] Playback controls work (play, pause, reset)
- [ ] Info panel updates dynamically
- [ ] "How it works" section is expandable
- [ ] Navigation links work
- [ ] Performance is acceptable (60 fps target)

**Practice Pages** (all practice sets):
- [ ] Problems load correctly
- [ ] Answer input works
- [ ] Answer validation is accurate
- [ ] Feedback is helpful
- [ ] Hint system works
- [ ] Score tracking works
- [ ] Problem navigation works
- [ ] Formula reference is visible

#### Cross-browser Testing

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (iOS and Android)
- [ ] Safari Mobile (iOS)

#### Responsive Design Testing

Test on the following viewport sizes:

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Desktop (769px - 1024px)
- [ ] Large Desktop (1025px+)

#### Accessibility Testing

- [ ] All images have alt text
- [ ] Headings are properly structured (h1 → h2 → h3)
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works throughout site
- [ ] Focus indicators are visible
- [ ] ARIA labels are present where needed
- [ ] Skip links are functional
- [ ] Screen reader testing (basic)

#### Performance Testing

- [ ] Home page loads in < 2 seconds
- [ ] Module pages load in < 2 seconds
- [ ] Lesson pages load in < 2 seconds
- [ ] Demo pages load in < 3 seconds
- [ ] Canvas animations maintain 60 fps
- [ ] No memory leaks in long-running demos
- [ ] Images are optimized
- [ ] CSS/JS is minified in production

#### Link Validation

Use automated link checker or manual testing:

- [ ] All internal links work
- [ ] No broken links (404s)
- [ ] All external links work (if any)
- [ ] Breadcrumb links are correct
- [ ] Navigation links are correct

### Testing Tools

**Recommended tools**:

1. **Browser DevTools**: Performance, Network, Console
2. **Lighthouse**: Accessibility, Performance, SEO audits
3. **axe DevTools**: Accessibility testing
4. **BrowserStack**: Cross-browser testing (if available)
5. **WebAIM Contrast Checker**: Color contrast validation
6. **HTML Validator**: W3C Markup Validation Service

### Bug Tracking

Create issues for any bugs found during testing:

- Use descriptive titles
- Include steps to reproduce
- Note browser/device information
- Add screenshots if applicable
- Assign priority (critical, high, medium, low)

---

## Deployment Strategy

### Build Configuration

**Ensure `vite.config.js` is correctly configured**:

```javascript
export default defineConfig({
  base: '/',  // Or '/repo-name/' if not using custom domain
  build: {
    rollupOptions: {
      input: getHtmlEntries()  // Auto-discovers all modules
    },
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,  // Disable for production
    minify: 'terser',  // Minify for production
  },
  server: {
    open: true,
    port: 3000
  }
});
```

### GitHub Pages Deployment

#### Option 1: Manual Deployment with gh-pages

```bash
# Build the site
npm run build

# Deploy to gh-pages branch
npm run deploy
```

Ensure `package.json` has:
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  }
}
```

#### Option 2: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist
          branch: gh-pages
```

### Custom Domain (Optional)

If using a custom domain:

1. Add `CNAME` file to `public/` directory with domain name
2. Configure DNS settings with GitHub Pages IP addresses
3. Update `vite.config.js` base to `/`

### Rollback Plan

If deployment issues occur:

1. **Immediate rollback**:
   ```bash
   git checkout backup-before-refactor
   npm run deploy
   ```

2. **Gradual rollback**:
   - Keep old structure on a separate branch
   - Switch DNS/deployment to point to old branch
   - Debug issues on development branch

3. **Partial deployment**:
   - Deploy only completed modules
   - Keep old structure for incomplete modules
   - Gradually migrate as modules are completed

---

## Appendices

### Appendix A: File Count Summary

| Category | Count | Status |
|----------|-------|--------|
| **Module Landing Pages** | 6 | NEW |
| **Lesson Pages** | 27 | NEW |
| **Demo Pages** | 22 | 3 EXIST, 19 NEW |
| **Practice Pages** | 9 | 1 EXISTS, 8 NEW |
| **Shared Components** | 10+ | UPDATE/NEW |
| **Shared Styles** | 7 | UPDATE/NEW |
| **Total HTML Pages** | 64+ | |

### Appendix B: Estimated Effort

| Phase | Estimated Time | Effort Level |
|-------|---------------|--------------|
| Phase 1: Preparation | 1 day | Low |
| Phase 2: Core Infrastructure | 2-3 days | Medium |
| Phase 3: Module 1 Migration | 2-3 days | Medium |
| Phase 4: Modules 2-6 Structure | 3-5 days | Medium |
| Phase 5: Build Priority Demos | 5-7 days | High |
| Phase 6: Content Development | Ongoing | High |
| Phase 7: Polish & Optimization | 2-3 days | Medium |
| Phase 8: Documentation | 1 day | Low |
| Phase 9: Deployment | 1 day | Low |
| **TOTAL (excluding Phase 6)** | **17-23 days** | |

**Note**: Phase 6 (Content Development) is ongoing and depends on the amount of lesson content to be written and the number of demos to be built from scratch. Estimate 1-2 days per complete demo and 2-4 hours per lesson page.

### Appendix C: Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Build Tool | Vite | 5.x |
| JavaScript | ES6+ Modules | Native |
| Styling | CSS3 | Native |
| Canvas API | HTML5 Canvas | Native |
| SVG | Inline SVG | Native |
| Visualization | Canvas + SVG | Native |
| Deployment | GitHub Pages | - |
| Version Control | Git | - |

### Appendix D: Module Content Matrix

| Module | Lessons | Demos | Practice | Total Activities | Priority |
|--------|---------|-------|----------|------------------|----------|
| Module 1 | 4 | 3 | 1 | 8 | HIGH (75% done) |
| Module 2 | 4 | 3 | 1 | 8 | HIGH |
| Module 3 | 4 | 4 | 1 | 9 | HIGH |
| Module 4 | 5 | 4 | 2 | 11 | MEDIUM |
| Module 5 | 7 | 5 | 1 | 13 | MEDIUM |
| Module 6 | 3 | 3 | 1 | 7 | LOW |

### Appendix E: Demo Complexity Estimates

| Demo | Complexity | Estimated Build Time | Priority |
|------|-----------|---------------------|----------|
| Network Topology Explorer (M1) | Medium | 2-3 days | HIGH |
| HTTP Request/Response (M2) | Low | 1 day | HIGH |
| DNS Resolution (M2) | Medium | 2 days | HIGH |
| P2P File Sharing (M2) | High | 3-4 days | MEDIUM |
| UDP vs TCP (M3) | Low | 1 day | HIGH |
| RDT Protocols (M3) | Medium | 2-3 days | HIGH |
| TCP Handshake (M3) | Medium | 2 days | HIGH |
| TCP Congestion Control (M3) | High | 3 days | HIGH |
| IP Forwarding (M4) | Low | 1 day | HIGH |
| Routing Algorithms (M4) | High | 3-4 days | MEDIUM |
| NAT Translation (M4) | Medium | 2 days | MEDIUM |
| Queue Management (M4) | Medium | 2 days | MEDIUM |
| Ethernet Frame (M5) | Low | 1 day | LOW |
| Switch Learning (M5) | Medium | 2-3 days | MEDIUM |
| Spanning Tree (M5) | High | 3-4 days | LOW |
| CSMA/CD (M5) | Medium | 2 days | MEDIUM |
| ARP Resolution (M5) | Low | 1 day | MEDIUM |
| Symmetric Encryption (M6) | Low | 1 day | LOW |
| Public Key Crypto (M6) | Medium | 2 days | LOW |
| TLS Handshake (M6) | Medium | 2-3 days | LOW |

### Appendix F: Glossary

- **Canvas**: HTML5 Canvas API for raster-based graphics
- **SVG**: Scalable Vector Graphics for vector-based graphics
- **Module**: One of six main curriculum units
- **Lesson**: Conceptual content page with explanations
- **Demo**: Interactive visualization
- **Practice**: Problem-solving activity
- **Component**: Reusable UI or JavaScript module
- **Template**: HTML boilerplate for page types
- **Migration**: Moving existing content to new structure

### Appendix G: References

1. **Kurose & Ross**: "Computer Networking: A Top-Down Approach" (8th Edition)
2. **Vite Documentation**: https://vitejs.dev/
3. **GitHub Pages Documentation**: https://docs.github.com/en/pages
4. **MDN Web Docs**: https://developer.mozilla.org/
5. **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-03 | Claude | Initial comprehensive refactoring plan |

---

**END OF REFACTORING PLAN**
