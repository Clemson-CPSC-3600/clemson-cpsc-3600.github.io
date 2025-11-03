# Implementation Checklist
## CPSC 3600 Module-Based Refactoring

**Reference**: See `REFACTORING_PLAN.md` for detailed specifications

---

## Phase 1: Preparation ✓ COMPLETE

### Directory Structure
- [x] Create `modules/` directory structure for all 6 modules
- [x] Create `modules/module1-big-picture/` subdirectories (lessons, demos, practice)
- [x] Create `shared/components/` directory
- [x] Create `shared/templates/` directory
- [x] Create `assets/images/module-icons/` directory

### Configuration
- [x] Update `vite.config.js` to scan `modules/` directory
- [ ] Update `.gitignore` if needed (not required)
- [x] Create `shared/constants/modules.js` configuration file

### Version Control
- [x] Create feature branch: `refactor/module-based-structure`
- [x] Create backup tag: `backup-before-refactor`
- [x] Push branch to remote (will push after Phase 2)

---

## Phase 2: Core Infrastructure ✓ COMPLETE

### Shared Constants
- [x] Create `shared/constants/modules.js` with all module definitions (Phase 1)
- [x] Update `shared/constants/colors.js` with module-specific colors

### Shared Styles
- [x] Update `shared/styles/main.css` (global styles, typography, layout)
- [x] Create `shared/styles/module.css` (module landing page styles)
- [x] Create `shared/styles/lesson.css` (lesson page styles)
- [x] Create `shared/styles/demo.css` (demo page styles)
- [x] Create `shared/styles/practice.css` (practice page styles)
- [x] Create `shared/styles/components.css` (reusable component styles)
- [x] Create utilities in main.css (flexbox, grid, spacing - integrated into main.css)

### Shared Components
- [x] Create `shared/components/ModuleCard.js`
- [x] Create `shared/components/Breadcrumb.js`
- [x] Create `shared/components/ProgressTracker.js`
- [x] Create `shared/components/LessonNavigator.js`
- [x] Create `shared/components/ActivityList.js`
- [ ] Update `shared/js/navigation.js` for new structure (optional - will do if needed)

### Templates
- [ ] HTML templates (skipped - will create pages directly as needed)

### New Home Page
- [x] Create new `index.html`
- [x] Create `main.js` for home page
- [x] Create `style.css` for home page
- [ ] Test responsive design (will test after deployment)

---

## Phase 3: Module 1 Migration ☐

### Module 1 Landing Page
- [ ] Create `modules/module1-big-picture/index.html`
- [ ] Create `modules/module1-big-picture/module1.js`
- [ ] Create `modules/module1-big-picture/module1.css`
- [ ] Test navigation from home page

### Migrate Existing Demos

#### Packet Journey
- [ ] Copy files from `demos/packet-journey/` to `modules/module1-big-picture/demos/packet-journey/`
- [ ] Update `index.html` (paths, navigation, breadcrumbs)
- [ ] Update `styles.css` (module 1 color scheme)
- [ ] Test functionality
- [ ] Test navigation links

#### Ladder Diagram
- [ ] Copy files from `demos/ladder-diagram/` to `modules/module1-big-picture/demos/ladder-diagram/`
- [ ] Update `index.html` (paths, navigation, breadcrumbs)
- [ ] Update `styles.css` (module 1 color scheme)
- [ ] Test functionality
- [ ] Test navigation links

#### Latency Calculator (Practice)
- [ ] Copy files from `demos/latency-practice/` to `modules/module1-big-picture/practice/latency-calculator/`
- [ ] Update `index.html` (paths, navigation, breadcrumbs)
- [ ] Update `styles.css` (module 1 color scheme)
- [ ] Test functionality
- [ ] Test navigation links

### Create Module 1 Lessons

#### Lesson 1: Internet Structure
- [ ] Create directory: `lessons/01-internet-structure/`
- [ ] Create `index.html` from template
- [ ] Write lesson content (or add placeholder)
- [ ] Create diagrams (or add placeholders)
- [ ] Add learning objectives
- [ ] Add check understanding questions
- [ ] Create `lesson.js` for interactivity
- [ ] Test navigation

#### Lesson 2: Protocol Layers
- [ ] Create directory: `lessons/02-protocol-layers/`
- [ ] Create `index.html` from template
- [ ] Write lesson content (or add placeholder)
- [ ] Create diagrams (or add placeholders)
- [ ] Add learning objectives
- [ ] Add check understanding questions
- [ ] Create `lesson.js` for interactivity
- [ ] Test navigation

#### Lesson 3: Network Performance
- [ ] Create directory: `lessons/03-network-performance/`
- [ ] Create `index.html` from template
- [ ] Write lesson content (or add placeholder)
- [ ] Create diagrams (or add placeholders)
- [ ] Add learning objectives
- [ ] Add check understanding questions
- [ ] Create `lesson.js` for interactivity
- [ ] Test navigation

#### Lesson 4: Delay & Throughput
- [ ] Create directory: `lessons/04-delay-throughput/`
- [ ] Create `index.html` from template
- [ ] Write lesson content (or add placeholder)
- [ ] Create diagrams (or add placeholders)
- [ ] Add learning objectives
- [ ] Add check understanding questions
- [ ] Create `lesson.js` for interactivity
- [ ] Test navigation

### Module 1 Testing
- [ ] Test all lesson links from module page
- [ ] Test all demo links from module page
- [ ] Test practice link from module page
- [ ] Test breadcrumb navigation throughout
- [ ] Test previous/next navigation
- [ ] Test responsive design
- [ ] Verify module 1 color scheme applied consistently

---

## Phase 4: Modules 2-6 Structure ☐

### Module 2: Application Layer

#### Landing Page
- [ ] Create `modules/module2-application/index.html`
- [ ] Create `modules/module2-application/module2.js`
- [ ] Create `modules/module2-application/module2.css`

#### Lesson Placeholders
- [ ] Create `lessons/01-architectures/index.html` (placeholder)
- [ ] Create `lessons/02-http/index.html` (placeholder)
- [ ] Create `lessons/03-dns/index.html` (placeholder)
- [ ] Create `lessons/04-bittorrent/index.html` (placeholder)

#### Demo Placeholders
- [ ] Create `demos/http-request-response/index.html` (placeholder)
- [ ] Create `demos/dns-resolution/index.html` (placeholder)
- [ ] Create `demos/peer-to-peer/index.html` (placeholder)

#### Practice Placeholder
- [ ] Create `practice/http-dns-problems/index.html` (placeholder)

### Module 3: Transport Layer

#### Landing Page
- [ ] Create `modules/module3-transport/index.html`
- [ ] Create `modules/module3-transport/module3.js`
- [ ] Create `modules/module3-transport/module3.css`

#### Lesson Placeholders
- [ ] Create `lessons/01-transport-services/index.html` (placeholder)
- [ ] Create `lessons/02-udp/index.html` (placeholder)
- [ ] Create `lessons/03-rdt-principles/index.html` (placeholder)
- [ ] Create `lessons/04-tcp/index.html` (placeholder)

#### Demo Placeholders
- [ ] Create `demos/udp-vs-tcp/index.html` (placeholder)
- [ ] Create `demos/rdt-protocols/index.html` (placeholder)
- [ ] Create `demos/tcp-handshake/index.html` (placeholder)
- [ ] Create `demos/tcp-congestion/index.html` (placeholder)

#### Practice Placeholder
- [ ] Create `practice/tcp-scenarios/index.html` (placeholder)

### Module 4: Network Layer

#### Landing Page
- [ ] Create `modules/module4-network/index.html`
- [ ] Create `modules/module4-network/module4.js`
- [ ] Create `modules/module4-network/module4.css`

#### Lesson Placeholders
- [ ] Create `lessons/01-network-layer-overview/index.html` (placeholder)
- [ ] Create `lessons/02-ipv4-ipv6/index.html` (placeholder)
- [ ] Create `lessons/03-nat-dhcp/index.html` (placeholder)
- [ ] Create `lessons/04-routing-principles/index.html` (placeholder)
- [ ] Create `lessons/05-queuing/index.html` (placeholder)

#### Demo Placeholders
- [ ] Create `demos/ip-forwarding/index.html` (placeholder)
- [ ] Create `demos/routing-algorithms/index.html` (placeholder)
- [ ] Create `demos/nat-translation/index.html` (placeholder)
- [ ] Create `demos/queue-management/index.html` (placeholder)

#### Practice Placeholders
- [ ] Create `practice/subnetting/index.html` (placeholder)
- [ ] Create `practice/routing-tables/index.html` (placeholder)

### Module 5: Link Layer

#### Landing Page
- [ ] Create `modules/module5-link/index.html`
- [ ] Create `modules/module5-link/module5.js`
- [ ] Create `modules/module5-link/module5.css`

#### Lesson Placeholders
- [ ] Create `lessons/01-link-layer-overview/index.html` (placeholder)
- [ ] Create `lessons/02-ethernet/index.html` (placeholder)
- [ ] Create `lessons/03-switches-spanning-tree/index.html` (placeholder)
- [ ] Create `lessons/04-collision-management/index.html` (placeholder)
- [ ] Create `lessons/05-encoding-framing/index.html` (placeholder)
- [ ] Create `lessons/06-arp/index.html` (placeholder)
- [ ] Create `lessons/07-wifi/index.html` (placeholder)

#### Demo Placeholders
- [ ] Create `demos/ethernet-frame/index.html` (placeholder)
- [ ] Create `demos/switch-learning/index.html` (placeholder)
- [ ] Create `demos/spanning-tree/index.html` (placeholder)
- [ ] Create `demos/csma-cd/index.html` (placeholder)
- [ ] Create `demos/arp-resolution/index.html` (placeholder)

#### Practice Placeholder
- [ ] Create `practice/link-layer-scenarios/index.html` (placeholder)

### Module 6: Network Security

#### Landing Page
- [ ] Create `modules/module6-security/index.html`
- [ ] Create `modules/module6-security/module6.js`
- [ ] Create `modules/module6-security/module6.css`

#### Lesson Placeholders
- [ ] Create `lessons/01-security-basics/index.html` (placeholder)
- [ ] Create `lessons/02-encryption/index.html` (placeholder)
- [ ] Create `lessons/03-authentication/index.html` (placeholder)

#### Demo Placeholders
- [ ] Create `demos/symmetric-encryption/index.html` (placeholder)
- [ ] Create `demos/public-key/index.html` (placeholder)
- [ ] Create `demos/tls-handshake/index.html` (placeholder)

#### Practice Placeholder
- [ ] Create `practice/security-scenarios/index.html` (placeholder)

### Test Module Structure
- [ ] Test navigation from home to all 6 modules
- [ ] Test breadcrumb navigation in all modules
- [ ] Test module-to-module navigation (prev/next)
- [ ] Verify all placeholder pages load correctly
- [ ] Verify module color schemes are distinct

---

## Phase 5: Build Priority Demos ☐

### High Priority Demos (Build First)

#### Module 1: Network Topology Explorer
- [ ] Create demo structure (index.html, main.js, styles.css)
- [ ] Implement network hierarchy visualization
- [ ] Add interactive topology builder
- [ ] Add packet path animation
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 2: HTTP Request/Response
- [ ] Create demo structure
- [ ] Implement request builder form
- [ ] Implement message formatter
- [ ] Add response simulator
- [ ] Add header/body visualization
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 2: DNS Resolution
- [ ] Create demo structure
- [ ] Implement DNS hierarchy visualization
- [ ] Add query animation (iterative and recursive)
- [ ] Add caching demonstration
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 3: TCP Handshake
- [ ] Create demo structure
- [ ] Implement connection establishment animation
- [ ] Add segment details display
- [ ] Add timing diagram view
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 3: TCP Congestion Control
- [ ] Create demo structure
- [ ] Implement cwnd evolution graph
- [ ] Add algorithm phase visualization
- [ ] Add packet loss introduction controls
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 4: IP Forwarding
- [ ] Create demo structure
- [ ] Implement forwarding table display
- [ ] Add longest prefix matching visualization
- [ ] Add packet trace animation
- [ ] Test functionality
- [ ] Write "How it works" section

#### Module 4: Routing Algorithms
- [ ] Create demo structure
- [ ] Implement network topology builder
- [ ] Add Dijkstra's algorithm animation
- [ ] Add Distance Vector animation
- [ ] Add routing table display
- [ ] Test functionality
- [ ] Write "How it works" section

### Medium Priority Demos (Build Later)
- [ ] Module 2: P2P File Sharing
- [ ] Module 3: UDP vs TCP Comparison
- [ ] Module 3: RDT Protocols
- [ ] Module 4: NAT Translation
- [ ] Module 4: Queue Management
- [ ] Module 5: Switch Learning
- [ ] Module 5: CSMA/CD Simulation
- [ ] Module 5: ARP Resolution

### Low Priority Demos (Build Last)
- [ ] Module 5: Ethernet Frame Explorer
- [ ] Module 5: Spanning Tree Protocol
- [ ] Module 6: Symmetric Encryption
- [ ] Module 6: Public Key Cryptography
- [ ] Module 6: TLS Handshake

---

## Phase 6: Content Development ☐

### Module 1 Lessons (Flesh Out)
- [ ] Lesson 1: Write complete content
- [ ] Lesson 1: Create diagrams
- [ ] Lesson 2: Write complete content
- [ ] Lesson 2: Create diagrams
- [ ] Lesson 3: Write complete content
- [ ] Lesson 3: Create diagrams
- [ ] Lesson 4: Write complete content
- [ ] Lesson 4: Create diagrams

### Module 2 Lessons
- [ ] Lesson 1: Application Architectures
- [ ] Lesson 2: HTTP
- [ ] Lesson 3: DNS
- [ ] Lesson 4: BitTorrent

### Module 3 Lessons
- [ ] Lesson 1: Transport Services
- [ ] Lesson 2: UDP
- [ ] Lesson 3: RDT Principles
- [ ] Lesson 4: TCP

### Module 4 Lessons
- [ ] Lesson 1: Network Layer Overview
- [ ] Lesson 2: IPv4, IPv6, CIDR
- [ ] Lesson 3: NAT, DHCP
- [ ] Lesson 4: Routing Principles
- [ ] Lesson 5: Queuing

### Module 5 Lessons
- [ ] Lesson 1: Link Layer Overview
- [ ] Lesson 2: Ethernet
- [ ] Lesson 3: Switches & Spanning Tree
- [ ] Lesson 4: Collision Management
- [ ] Lesson 5: Encoding & Framing
- [ ] Lesson 6: ARP
- [ ] Lesson 7: WiFi

### Module 6 Lessons
- [ ] Lesson 1: Security Basics
- [ ] Lesson 2: Encryption
- [ ] Lesson 3: Authentication

### Practice Problem Sets
- [ ] Module 2: HTTP & DNS Problems
- [ ] Module 3: TCP Scenarios
- [ ] Module 4: Subnetting Calculator
- [ ] Module 4: Routing Table Problems
- [ ] Module 5: Link Layer Scenarios
- [ ] Module 6: Security Scenarios

---

## Phase 7: Polish & Optimization ☐

### Design Consistency
- [ ] Review all pages for consistent styling
- [ ] Verify module color schemes applied correctly
- [ ] Check typography consistency
- [ ] Check spacing consistency
- [ ] Test responsive design on all page types
- [ ] Test on mobile devices (iOS and Android)

### Performance Optimization
- [ ] Optimize all images (compress, correct format)
- [ ] Minify CSS in production build
- [ ] Minify JavaScript in production build
- [ ] Test page load times (< 2 seconds target)
- [ ] Test demo performance (60 fps target)
- [ ] Check for memory leaks in long-running demos
- [ ] Implement lazy loading for images

### Accessibility
- [ ] Add alt text to all images
- [ ] Verify heading hierarchy (h1 → h2 → h3)
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Test keyboard navigation
- [ ] Add visible focus indicators
- [ ] Add ARIA labels where needed
- [ ] Add skip links to main content
- [ ] Test with screen reader (basic)

### Browser Testing
- [ ] Test on Chrome (desktop)
- [ ] Test on Firefox (desktop)
- [ ] Test on Safari (desktop)
- [ ] Test on Edge (desktop)
- [ ] Test on Chrome Mobile (Android)
- [ ] Test on Safari Mobile (iOS)

### Link Validation
- [ ] Check all internal links (no 404s)
- [ ] Check all breadcrumb links
- [ ] Check all navigation links
- [ ] Check all lesson-to-demo links
- [ ] Run automated link checker

---

## Phase 8: Documentation ☐

### Update README.md
- [ ] Document new module-based structure
- [ ] Update directory organization section
- [ ] Update development commands
- [ ] Add content creation guidelines
- [ ] Update deployment instructions

### Update CLAUDE.md
- [ ] Document new structure for Claude Code
- [ ] Update component architecture section
- [ ] Update file organization guidance
- [ ] Add template locations

### Create Contributing Guide (Optional)
- [ ] How to contribute new content
- [ ] Content style guide
- [ ] Code style guide
- [ ] Pull request process

---

## Phase 9: Deployment ☐

### Pre-deployment
- [ ] Clean build: `rm -rf dist && npm run build`
- [ ] Verify build output in `dist/`
- [ ] Test built site locally: `npm run preview`
- [ ] Check all routes work in production build
- [ ] Verify asset paths are correct
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

### Deploy to GitHub Pages
- [ ] Deploy: `npm run deploy`
- [ ] Verify deployment succeeded
- [ ] Check live site URL
- [ ] Test all modules on live site
- [ ] Test all demos on live site
- [ ] Check for console errors
- [ ] Check for 404 errors

### Post-deployment
- [ ] Verify all functionality on live site
- [ ] Test on multiple devices
- [ ] Share with colleague for review
- [ ] Document any issues found

### Merge to Main
- [ ] Merge feature branch: `git merge refactor/module-based-structure`
- [ ] Push to main: `git push origin main`
- [ ] Tag release: `git tag v2.0.0-module-structure`
- [ ] Push tag: `git push origin v2.0.0-module-structure`

### Cleanup
- [ ] Delete old structure files (demos/index.html, tutorials/index.html, examples/index.html)
- [ ] Archive old demos directory (optional: keep as backup)
- [ ] Update any documentation references to old structure

---

## Testing Checklist ☐

### Functionality Tests
- [ ] Home page module cards work
- [ ] All module landing pages load
- [ ] All lesson navigation works
- [ ] All demo controls function
- [ ] All practice problem sets work
- [ ] Breadcrumb navigation works everywhere
- [ ] Prev/Next navigation works everywhere

### Responsive Design Tests
- [ ] Mobile (320px-480px) - all pages
- [ ] Tablet (481px-768px) - all pages
- [ ] Desktop (769px+) - all pages

### Performance Tests
- [ ] All pages load in < 2 seconds
- [ ] All demos run at 60 fps
- [ ] No memory leaks

### Accessibility Tests
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility (basic)
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible

---

## Progress Summary

**Phase 1: Preparation** - ✓ Complete
**Phase 2: Core Infrastructure** - ✓ Complete
**Phase 3: Module 1 Migration** - ☐ Not Started
**Phase 4: Modules 2-6 Structure** - ☐ Not Started
**Phase 5: Build Priority Demos** - ☐ Not Started
**Phase 6: Content Development** - ☐ Not Started
**Phase 7: Polish & Optimization** - ☐ Not Started
**Phase 8: Documentation** - ☐ Not Started
**Phase 9: Deployment** - ☐ Not Started

**Overall Progress**: 22% Complete (Phases 1-2 of 9)

---

**Last Updated**: 2025-11-03
**Current Phase**: Phase 3 - Module 1 Migration
**Next Milestone**: Migrate existing demos and create Module 1 structure
