# CPSC 3600 Website Style Guide
## Design System & Theming Guidelines

**Version**: 1.0
**Date**: November 3, 2025
**Purpose**: Ensure consistent design across all modules, lessons, demos, and practice activities

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Page Templates](#page-templates)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Code Examples](#code-examples)

---

## Design Principles

### Academic Aesthetic
The site follows a **traditional academic course website** aesthetic, prioritizing:

1. **Content Clarity** - Information is presented clearly without distracting visual elements
2. **Professional Appearance** - Neutral colors, clean typography, minimal decoration
3. **Accessibility First** - Full keyboard navigation, screen reader support, WCAG AA compliance
4. **Consistency** - Uniform styling across all page types (home, modules, lessons, demos, practice)
5. **Conservative Design** - Avoid marketing-style elements (gradients, bold colors, promotional language)

### Key Characteristics
- ✅ Neutral gray and white color palette
- ✅ Formal academic language
- ✅ Traditional page headers with borders
- ✅ List-based content organization
- ✅ Minimal hover effects
- ❌ No gradient backgrounds
- ❌ No colorful accents or badges
- ❌ No promotional language
- ❌ No emoji icons (except in specific content sections)

---

## Color System

### Primary Colors (Neutral)

```css
/* Main UI colors - Academic neutral palette */
--color-background: #f8fafc;      /* Page background */
--color-background-alt: #ffffff;  /* Card backgrounds */
--color-text: #1e293b;            /* Primary text (slate) */
--color-text-light: #64748b;      /* Secondary text (slate gray) */
--color-text-muted: #94a3b8;      /* Tertiary text (light slate) */
--color-border: #e2e8f0;          /* Borders and dividers */
--color-border-dark: #cbd5e1;     /* Emphasized borders */
```

### Module Colors (Reserved for Content)

Module colors are **only used within module content pages** (not on home page):

```css
/* Module 1: The Big Picture */
--color-module1: #2563eb;  /* Deep Blue */

/* Module 2: Application Layer */
--color-module2: #059669;  /* Forest Green */

/* Module 3: Transport Layer */
--color-module3: #7c3aed;  /* Deep Purple */

/* Module 4: Network Layer */
--color-module4: #dc2626;  /* Professional Red */

/* Module 5: Link Layer */
--color-module5: #ea580c;  /* Burnt Orange */

/* Module 6: Network Security */
--color-module6: #1e293b;  /* Slate */
```

**Usage Rules:**
- Module colors appear in: module headers, activity list accents, section headings
- Module colors **do not** appear in: home page module cards, navigation, general UI
- Use `--color-module` CSS variable for dynamic module-specific styling

### Interactive States

```css
--color-hover: #5dade2;      /* Link/button hover */
--color-active: #2980b9;     /* Active state */
--color-disabled: #95a5a6;   /* Disabled elements */
--color-focus: #3498db;      /* Focus indicator */
```

### Semantic Colors

```css
--color-success: #059669;    /* Success messages */
--color-warning: #ea580c;    /* Warnings */
--color-danger: #dc2626;     /* Errors */
--color-info: #2563eb;       /* Info messages */
```

---

## Typography

### Font Families

```css
/* Sans-serif for all UI */
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
             'Helvetica Neue', Arial, sans-serif;

/* Monospace for code */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
```

### Font Sizes (Major Third Scale - 1.250)

```css
--font-size-xs: 0.64rem;    /* 10.24px - Labels */
--font-size-sm: 0.8rem;     /* 12.8px - Metadata, captions */
--font-size-base: 1rem;     /* 16px - Body text */
--font-size-lg: 1.25rem;    /* 20px - Large body text */
--font-size-xl: 1.563rem;   /* 25px - Subheadings */
--font-size-2xl: 1.953rem;  /* 31.25px - Section headings */
--font-size-3xl: 2.441rem;  /* 39px - Page titles */
--font-size-4xl: 3.052rem;  /* 48.8px - Large titles */
--font-size-5xl: 2.5rem;    /* 40px - Hero text (limited use) */
```

### Font Weights

```css
--font-weight-normal: 400;      /* Body text */
--font-weight-medium: 500;      /* Emphasized text */
--font-weight-semibold: 600;    /* Subheadings */
--font-weight-bold: 700;        /* Headings */
--font-weight-extrabold: 800;   /* Rare, hero text only */
```

### Line Heights

```css
--line-height-tight: 1.25;      /* Headings */
--line-height-normal: 1.5;      /* Body text */
--line-height-relaxed: 1.75;    /* Long-form content */
```

### Typography Usage

**Page Titles (h1)**
```css
font-size: var(--font-size-3xl);
font-weight: var(--font-weight-bold);
color: var(--color-text);
margin-bottom: var(--space-2);
```

**Section Headings (h2)**
```css
font-size: var(--font-size-2xl);
font-weight: var(--font-weight-bold);
color: var(--color-text);
border-bottom: 2px solid var(--color-border-dark);
padding-bottom: var(--space-3);
margin-bottom: var(--space-6);
```

**Subsection Headings (h3)**
```css
font-size: var(--font-size-xl);
font-weight: var(--font-weight-semibold);
color: var(--color-text);
margin-bottom: var(--space-3);
```

**Body Text (p)**
```css
font-size: var(--font-size-base);
line-height: var(--line-height-normal);
color: var(--color-text);
margin-bottom: var(--space-4);
```

---

## Spacing & Layout

### Spacing Scale (Reduced for Efficiency)

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 0.75rem;   /* 12px */
--space-5: 1rem;      /* 16px */
--space-6: 1rem;      /* 16px */
--space-8: 1.5rem;    /* 24px */
--space-10: 2rem;     /* 32px */
--space-12: 2rem;     /* 32px */
--space-16: 2.5rem;   /* 40px */
--space-20: 3rem;     /* 48px */
```

**Usage Guidelines:**
- Component padding: `var(--space-4)` to `var(--space-6)`
- Sections: `var(--space-12)` to `var(--space-16)` between
- Lists: `var(--space-2)` between items
- Cards: `var(--space-5)` internal padding

### Container Widths

```css
/* Standard container - Most pages */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Narrow container - Reading content */
.container-narrow {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Wide container - Demos */
.container-wide {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
```

### Border Radius

```css
--radius-sm: 4px;      /* Buttons, small cards */
--radius-md: 8px;      /* Cards, panels */
--radius-lg: 12px;     /* Large cards, modals */
--radius-full: 9999px; /* Pills, badges */
```

### Shadows (Subtle Elevation)

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
```

---

## Components

### Page Header (Academic Style)

**Home Page Header:**
```html
<section class="page-header">
  <div class="container">
    <h1>CPSC 3600: Computer Networks</h1>
    <div class="course-info">Clemson University | School of Computing</div>
    <p class="course-description">Course description...</p>
  </div>
</section>
```

**Styling:**
```css
.page-header {
  background: var(--color-background-alt);
  border-bottom: 3px solid var(--color-text);
  padding: var(--space-8) 0;
  margin-bottom: var(--space-10);
}

.page-header h1 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.course-info {
  font-size: var(--font-size-base);
  color: var(--color-text-light);
  margin-bottom: var(--space-4);
}
```

**Module Page Header:**
```html
<header class="module-header module-1">
  <div class="container">
    <div class="module-number">Module 1</div>
    <h1>The Big Picture</h1>
    <p class="module-description">Module description...</p>
  </div>
</header>
```

**Styling:**
```css
.module-header {
  background: linear-gradient(135deg,
    var(--color-module, var(--color-primary)) 0%,
    color-mix(in srgb, var(--color-module, var(--color-primary)) 80%, black) 100%
  );
  color: white;
  padding: var(--space-8) 0;
  margin-bottom: var(--space-12);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.module-number {
  display: inline-block;
  padding: var(--space-2) var(--space-4);
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}
```

### Module Cards (Home Page Only)

**HTML:**
```html
<article class="module-card">
  <div class="module-number">Module 1</div>
  <h3>The Big Picture</h3>
  <p>Brief description...</p>
  <div class="module-stats">
    <span>4 Lessons</span>
    <span>3 Demonstrations</span>
    <span>1 Practice Set</span>
  </div>
  <a href="./modules/module1-big-picture/" class="btn btn-primary">View Module</a>
</article>
```

**Styling:**
```css
.module-card {
  background: var(--color-background-alt);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-text-light);
  padding: var(--space-5);
  transition: border-color 0.2s ease;
}

.module-card:hover {
  border-left-color: var(--color-text);
  background: var(--color-background);
}

.module-card .module-number {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.module-card h3 {
  color: var(--color-text);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.module-card .btn-primary {
  background-color: var(--color-text);
  color: var(--color-background-alt);
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--font-weight-semibold);
}
```

### Activity Lists

**HTML:**
```html
<ul class="activity-list">
  <li>
    <a href="./lessons/01-internet-structure/">Internet Structure</a>
    <span class="time-estimate">15-20 min</span>
  </li>
</ul>
```

**Styling:**
```css
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.activity-list li {
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background: var(--color-background);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-module, var(--color-primary));
  transition: all var(--transition-base);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-list li:hover {
  transform: translateX(3px);
  box-shadow: var(--shadow-sm);
  border-left-width: 4px;
}

.activity-list a {
  color: var(--color-text);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  flex: 1;
}

.time-estimate {
  font-size: var(--font-size-sm);
  color: var(--color-text-light);
  white-space: nowrap;
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  background-color: var(--color-text);
  color: var(--color-background-alt);
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-primary:hover {
  background-color: var(--color-text-light);
  text-decoration: none;
}
```

**Secondary Button:**
```css
.btn-secondary {
  background-color: transparent;
  color: var(--color-text);
  padding: var(--space-3) var(--space-6);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
  transition: var(--transition-base);
}

.btn-secondary:hover {
  background-color: var(--color-background);
  border-color: var(--color-text);
}
```

### Breadcrumb Navigation

**HTML:**
```html
<nav aria-label="Breadcrumb" class="breadcrumb">
  <ol>
    <li><a href="../../index.html">Home</a></li>
    <li><a href="../index.html">Module 1: The Big Picture</a></li>
    <li aria-current="page">Internet Structure</li>
  </ol>
</nav>
```

**Styling:**
```css
.breadcrumb {
  margin-bottom: var(--space-6);
  font-size: var(--font-size-sm);
}

.breadcrumb ol {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.breadcrumb li {
  display: flex;
  align-items: center;
}

.breadcrumb li:not(:last-child)::after {
  content: "›";
  margin-left: var(--space-2);
  color: var(--color-text-light);
}

.breadcrumb a {
  color: var(--color-text-light);
  text-decoration: none;
}

.breadcrumb a:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.breadcrumb [aria-current="page"] {
  color: var(--color-text);
  font-weight: var(--font-weight-medium);
}
```

---

## Page Templates

### Home Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CPSC 3600: Computer Networks</title>
  <link rel="stylesheet" href="./shared/styles/main.css">
  <link rel="stylesheet" href="./style.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <section class="page-header" role="banner">
    <div class="container">
      <h1>CPSC 3600: Computer Networks</h1>
      <div class="course-info">Clemson University | School of Computing</div>
      <p class="course-description">Course description...</p>
    </div>
  </section>

  <main id="main-content" role="main">
    <section class="course-modules">
      <div class="container">
        <h2>Course Modules</h2>
        <div class="modules-list" id="modules-container">
          <!-- Module cards inserted by JavaScript -->
        </div>
      </div>
    </section>
  </main>

  <footer role="contentinfo">
    <div class="container">
      <p>CPSC 3600: Computer Networks | Clemson University</p>
    </div>
  </footer>

  <script type="module" src="./main.js"></script>
</body>
</html>
```

### Module Landing Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Module N: Title | CPSC 3600</title>
  <link rel="stylesheet" href="../../shared/styles/main.css">
  <link rel="stylesheet" href="../../shared/styles/module.css">
  <link rel="stylesheet" href="./moduleN.css">
</head>
<body class="module-N">
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header class="module-header" role="banner">
    <div class="container">
      <div class="module-number">Module N</div>
      <h1>Module Title</h1>
      <p class="module-description">Module description...</p>
    </div>
  </header>

  <main id="main-content" class="container" role="main">
    <nav aria-label="Breadcrumb" id="breadcrumb-container">
      <!-- Breadcrumb inserted by JavaScript -->
    </nav>

    <section class="module-content">
      <div class="content-section">
        <h2>📚 Lessons</h2>
        <p>Core conceptual content...</p>
        <ul class="activity-list" id="lessons-list">
          <!-- Lessons inserted by JavaScript -->
        </ul>
      </div>

      <div class="content-section">
        <h2>🔬 Demonstrations</h2>
        <p>Interactive visualizations...</p>
        <ul class="activity-list" id="demos-list">
          <!-- Demos inserted by JavaScript -->
        </ul>
      </div>

      <div class="content-section">
        <h2>✏️ Practice</h2>
        <p>Hands-on exercises...</p>
        <ul class="activity-list" id="practice-list">
          <!-- Practice activities inserted by JavaScript -->
        </ul>
      </div>
    </section>

    <section aria-labelledby="objectives-heading">
      <h2 id="objectives-heading">Learning Objectives</h2>
      <ul>
        <li>Objective 1...</li>
      </ul>
    </section>

    <nav class="module-navigation">
      <a href="../../index.html" class="btn btn-secondary">
        ← Back to Course Home
      </a>
      <a href="../moduleN+1/index.html" class="btn btn-primary">
        Next Module: Title →
      </a>
    </nav>
  </main>

  <footer role="contentinfo">
    <div class="container">
      <p>CPSC 3600: Computer Networks | Clemson University</p>
    </div>
  </footer>

  <script type="module" src="../../shared/components/Breadcrumb.js"></script>
  <script type="module" src="../../shared/components/ActivityList.js"></script>
  <script type="module" src="./moduleN.js"></script>
</body>
</html>
```

### Lesson Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lesson Title | Module N | CPSC 3600</title>
  <link rel="stylesheet" href="../../../../shared/styles/main.css">
  <link rel="stylesheet" href="../../../../shared/styles/lesson.css">
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <main id="main-content" class="container-narrow" role="main">
    <nav aria-label="Breadcrumb">
      <!-- Breadcrumb -->
    </nav>

    <article class="lesson">
      <header class="lesson-header">
        <h1>Lesson Title</h1>
        <div class="lesson-meta">
          <span>Module N</span>
          <span>15-20 min</span>
        </div>
      </header>

      <section class="learning-objectives">
        <h2>What You'll Learn</h2>
        <ul>
          <li>Objective 1...</li>
        </ul>
      </section>

      <section class="lesson-content">
        <!-- Lesson content -->
      </section>

      <section class="check-understanding">
        <h2>Check Your Understanding</h2>
        <!-- Questions -->
      </section>
    </article>

    <nav class="lesson-navigation">
      <a href="../" class="btn btn-secondary">← Back to Module</a>
      <a href="../02-next-lesson/" class="btn btn-primary">Next Lesson →</a>
    </nav>
  </main>

  <script type="module" src="./lesson.js"></script>
</body>
</html>
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

**Must-Have Features:**

1. **Skip Links**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

2. **ARIA Landmarks**
```html
<header role="banner">...</header>
<main role="main">...</main>
<nav role="navigation" aria-label="Breadcrumb">...</nav>
<footer role="contentinfo">...</footer>
```

3. **ARIA Labels**
```html
<h1 id="page-title">...</h1>
<section aria-labelledby="page-title">...</section>

<button aria-label="Descriptive action">Icon</button>
<span aria-hidden="true">🔬</span> <!-- Decorative only -->
```

4. **Keyboard Navigation**
- All interactive elements must be keyboard accessible (Tab, Enter, Space)
- Focus indicators must be visible (3px outline + 4px shadow)
- No keyboard traps

5. **Color Contrast**
- Body text: 7:1 (AAA) - `#1e293b` on `#ffffff`
- Secondary text: 4.5:1 (AA) - `#64748b` on `#ffffff`
- Interactive elements: 4.5:1 minimum

6. **Focus Indicators**
```css
*:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
}
```

7. **Screen Reader Utilities**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

8. **Reduced Motion**
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Code Examples

### Module-Specific Color Usage

**JavaScript:**
```javascript
// Module 1: The Big Picture
document.body.classList.add('module-1');
document.documentElement.style.setProperty('--color-module', '#2563eb');
```

**CSS:**
```css
/* Module class sets the color */
.module-1 { --color-module: var(--color-module1); }
.module-2 { --color-module: var(--color-module2); }
/* etc. */

/* Use --color-module for dynamic styling */
.activity-list li {
  border-left: 3px solid var(--color-module, var(--color-primary));
}

.module-header {
  background: linear-gradient(135deg, var(--color-module) 0%, ...);
}
```

### Responsive Design

**Mobile-First Breakpoints:**
```css
/* Mobile: 320px - 768px (default) */
.module-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .module-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .module-content {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-8);
  }
}
```

### Dynamic Content Loading

**Creating Activity Lists:**
```javascript
import { ActivityList } from '../../shared/components/ActivityList.js';

const lessonsList = document.getElementById('lessons-list');

moduleData.lessons.forEach(lesson => {
  const item = ActivityList.createItem({
    title: lesson.title,
    url: `./lessons/${lesson.id}/index.html`,
    estimatedTime: lesson.estimatedTime,
    isCompleted: false,
    onClick: () => {
      // Track activity
    }
  });
  lessonsList.appendChild(item);
});
```

---

## File Organization

### Required Stylesheets

**Every Page Must Include:**
```html
<!-- Global design system -->
<link rel="stylesheet" href="[path]/shared/styles/main.css">

<!-- Page-type specific styles -->
<link rel="stylesheet" href="[path]/shared/styles/module.css">    <!-- Module pages -->
<link rel="stylesheet" href="[path]/shared/styles/lesson.css">    <!-- Lesson pages -->
<link rel="stylesheet" href="[path]/shared/styles/demo.css">      <!-- Demo pages -->
<link rel="stylesheet" href="[path]/shared/styles/practice.css">  <!-- Practice pages -->

<!-- Page-specific overrides (optional) -->
<link rel="stylesheet" href="./custom.css">
```

### Required JavaScript

**Module Pages:**
```html
<script type="module" src="../../shared/components/Breadcrumb.js"></script>
<script type="module" src="../../shared/components/ActivityList.js"></script>
<script type="module" src="../../shared/components/ProgressTracker.js"></script>
<script type="module" src="./moduleN.js"></script>
```

---

## Quick Reference

### Do's ✅
- Use neutral gray/white palette
- Include skip links on every page
- Provide descriptive ARIA labels
- Use semantic HTML (`<article>`, `<section>`, `<nav>`)
- Test keyboard navigation
- Use `--color-module` for module-specific styling
- Include breadcrumb navigation
- Add proper meta tags (title, description)
- Use formal academic language
- Include time estimates for activities

### Don'ts ❌
- Don't use gradient backgrounds on home page
- Don't use colorful badges or accents on home page
- Don't use promotional/marketing language
- Don't use emoji icons in navigation
- Don't skip accessibility features
- Don't use inline styles
- Don't hard-code colors (use CSS variables)
- Don't forget responsive design
- Don't break keyboard navigation
- Don't use low-contrast colors

---

## Version History

- **v1.0** (2025-11-03) - Initial style guide created after academic redesign

---

## Questions?

For questions or clarifications about this style guide, refer to:
- [DESIGN_CHANGES_APPLIED.md](DESIGN_CHANGES_APPLIED.md) - Academic redesign rationale
- [REFACTORING_PLAN.md](REFACTORING_PLAN.md) - Overall project architecture
- [shared/styles/main.css](shared/styles/main.css) - Global design system implementation
