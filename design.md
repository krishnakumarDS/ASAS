# SAP Portal - Complete Design System & UI/UX Guidelines

## Table of Contents
1. [Design System Overview](#design-system-overview)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components & Styling](#components--styling)
6. [Animations & Transitions](#animations--transitions)
7. [Responsive Design](#responsive-design)
8. [Dark Mode](#dark-mode)
9. [Implementation Guide](#implementation-guide)

---

## Design System Overview

The SAP Portal uses a **modern, accessible design system** built on:
- **CSS Custom Properties (Variables)** for theming and maintenance
- **CSS Modules** for component-scoped styling
- **Responsive Fluidity** with `clamp()` functions for scalable sizing
- **Elevation System** with layered shadows for depth hierarchy
- **Glassmorphism Effects** for overlay components
- **Smooth Micro-interactions** for user feedback

**Key Design Philosophy:**
- Clean, professional aesthetic with warm neutrals
- Teal/emerald accent color for brand identity
- Accessibility-first approach with WCAG compliance
- Reduced motion support for inclusive experience
- Data-driven visual hierarchy using typography and color

---

## Color Palette

### Light Mode (Default)

#### Background Colors
```css
--bg-primary: #faf9f7;      /* Main page background - warm light beige */
--bg-secondary: #ffffff;    /* Card/panel backgrounds */
--bg-tertiary: #f2efe9;     /* Subtle fills, light sections */
--bg-hover: #f5f2ec;        /* Hover state backgrounds */
--bg-elevated: #ffffff;     /* Elevated surfaces (modals, popovers) */
```

#### Text Colors
```css
--text-primary: #23221f;    /* Main body text - dark gray/black */
--text-secondary: #5c5a54;  /* Secondary text - 50-60% opacity effect */
--text-tertiary: #8f8c83;   /* Disabled/placeholder text - lighter gray */
--text-inverse: #faf9f7;    /* Text on dark/accent backgrounds */
```

#### Brand Accent (Teal)
```css
--accent-50: #e0f2ef;       /* Very light teal - background tints */
--accent-100: #b8e1da;      /* Light teal - subtle highlights */
--accent-500: #009685;      /* Teal - interactive elements */
--accent-600: #007564;      /* Dark teal - PRIMARY BRAND COLOR */
--accent-700: #005a4d;      /* Darkest teal - borders, strong states */
```

#### Semantic Status Colors
```css
--color-success: #10b981;       /* Green (emerald) - completion, positive */
--color-success-bg: #e6f7ef;    /* Light green background - 12% tint */

--color-warning: #f59e0b;       /* Amber/Yellow - caution, attention */
--color-warning-bg: #fdf1d7;    /* Light amber background - 12% tint */

--color-danger: #d64545;        /* Red - errors, destructive actions */
--color-danger-bg: #fbe7e7;     /* Light red background - 12% tint */

--color-info: #3b82f6;          /* Blue - informational, secondary actions */
--color-info-bg: #e3eefd;       /* Light blue background - 12% tint */

--color-neutral: #8f8c83;       /* Gray - neutral, secondary elements */
--color-neutral-bg: #eeece6;    /* Light gray background - 12% tint */
```

#### Border Colors
```css
--border-light: #e6e2d9;    /* Light borders - inputs, subtle dividers */
--border-medium: #d9d4c8;   /* Medium borders - cards, panels */
--border-strong: #b7b1a4;   /* Strong borders - active states, emphasis */
```

#### Gradient & Glass Effects
```css
--glass-bg: color-mix(in srgb, var(--bg-secondary) 78%, transparent);
--glass-border: color-mix(in srgb, var(--border-light) 64%, transparent);
```

### Color Usage Guidelines

| Element | Color | Use Case |
|---------|-------|----------|
| Primary CTA Button | `--accent-600` | Main actions, primary CTAs |
| Secondary Button | `--bg-secondary` + `--border-medium` | Alternative actions |
| Success Badge | `--color-success` | Completed, active, positive states |
| Warning Badge | `--color-warning` | In progress, pending, caution states |
| Danger Badge | `--color-danger` | Failed, deleted, destructive actions |
| Info Badge | `--color-info` | Information, secondary status |
| Card Background | `--bg-secondary` | Content containers |
| Page Background | `--bg-primary` | Main page surface |
| Form Input | `--bg-primary` + `--border-light` | Input fields |
| Input Focus | `--border-medium` + `--accent-50` bg | Active input state |

### Dark Mode Color Overrides
When `html.dark` class is applied:
```css
--bg-primary: #0a0a09;        /* Very dark background */
--bg-secondary: #141413;      /* Slightly lighter dark background */
--bg-tertiary: #1d1c1a;       /* Dark tertiary surface */
--text-primary: #f5f2ec;      /* Light text */
--text-secondary: #b7b1a4;    /* Light gray text */
--accent-600: #34bfac;        /* Lighter teal for contrast */
--color-success: #34d399;     /* Brighter green on dark */
/* All shadow opacities increased for visibility */
```

---

## Typography

### Font Stack
```css
--font-heading: 'Space Grotesk', sans-serif;    /* Bold, geometric, modern */
--font-body: 'DM Sans', sans-serif;             /* Clean, highly readable */
--font-mono: 'JetBrains Mono', monospace;       /* Technical, code-like values */
```

### Font Loading (Google Fonts)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

#### Eyebrow/Labels
```css
font-size: 10px - 11.5px;
font-weight: 600 - 800;
letter-spacing: 0.08em - 0.14em;
text-transform: uppercase;
color: var(--text-secondary);
line-height: 1.4;
```
**Usage:** Section headers, metadata labels, badge text

#### Body Text (Default)
```css
font-size: 14px;
font-weight: 400;
line-height: 1.55;  /* 21.7px line height */
color: var(--text-primary);
font-family: var(--font-body);
```
**Usage:** Paragraph text, descriptions, form inputs

#### Secondary Text
```css
font-size: 13px - 12px;
color: var(--text-secondary);
font-weight: 400;
line-height: 1.5;
```
**Usage:** Helper text, subtext, metadata

#### Headings
Responsive sizing using `clamp()`:
```css
h1 { font-size: clamp(30px, 4vw, 48px); font-weight: 700; }
h2 { font-size: clamp(24px, 3.5vw, 36px); font-weight: 700; }
h3 { font-size: clamp(18px, 2.8vw, 28px); font-weight: 600; }
h4 { font-size: 18px; font-weight: 600; }
h5 { font-size: 16px; font-weight: 600; }
h6 { font-size: 14px; font-weight: 600; }
```

#### Display/Numbers (Data-Focused)
```css
font-size: clamp(42px, 6vw, 64px);     /* Large KPI numbers */
font-weight: 700 - 600;
font-family: var(--font-mono);         /* Monospace for alignment */
letter-spacing: -0.02em;
color: var(--text-primary);
```
**Usage:** Statistics, large metrics, counts

---

## Spacing & Layout

### Spacing Scale
```css
/* Consistent spacing increments */
4px, 6px, 8px, 10px, 12px, 14px, 16px, 18px, 20px, 22px, 24px, 28px, 32px, 36px, 40px
```

### Header & Sidebar Dimensions
```css
--header-height: 52px;
--sidebar-collapsed: clamp(68px, 6vw, 82px);      /* Width when collapsed */
--sidebar-expanded: clamp(240px, 20vw, 296px);    /* Width when expanded */
```

### Responsive Content Padding
```css
/* Desktop (1440px+) */
padding: clamp(16px, 2vw, 28px) clamp(12px, 2vw, 32px);  /* vertical horizontal */

/* Tablet (768px - 1023px) */
padding: 18px 14px;

/* Mobile (< 768px) */
padding: 14px 12px;
```

### Grid Systems

#### 2-Column Grid (Form/Detail Layouts)
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
gap: 20px;
```
**Usage:** Form sections, detail panels, side-by-side content

#### 3-Column Grid (Statistics/Cards)
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
gap: 16px;

@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 640px) {
  grid-template-columns: 1fr;
}
```

#### 4-Column Grid (Summary Cards/KPIs)
```css
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 16px;

@media (max-width: 1440px) {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1024px) {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

#### Auto-Fit Responsive Grid
```css
display: grid;
grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
gap: 16px;
```
**Usage:** Flexible card layouts, image galleries, flexible content

---

## Components & Styling

### Button Styles

#### Primary Button (`.liquid-btn`)
```css
/* Background & Text */
background-color: var(--accent-600);
color: white;
border: none;

/* Typography */
font-size: 14px;
font-weight: 600;
letter-spacing: 0.02em;

/* Spacing & Shape */
padding: 10px 16px;
border-radius: var(--radius-md);
cursor: pointer;

/* Transitions */
transition: all var(--transition-base);

/* Hover State */
&:hover {
  background-color: var(--accent-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  /* Gradient shimmer effect (optional) */
  background-image: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
  background-position: 0% 0%;
  animation: shimmerSwipe 0.6s linear;
}

/* Active State */
&:active {
  transform: scale(0.97);
  box-shadow: var(--shadow-sm);
}

/* Disabled State */
&:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### Secondary Button (`.secondary-btn`)
```css
background-color: var(--bg-secondary);
color: var(--text-primary);
border: 1px solid var(--border-medium);

padding: 10px 16px;
border-radius: var(--radius-md);
font-size: 14px;
font-weight: 600;

transition: all var(--transition-base);

&:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}

&:active {
  transform: scale(0.98);
}
```

#### Ghost/Icon Button (`.ghost-btn`)
```css
background: transparent;
color: var(--text-secondary);
border: none;
cursor: pointer;

width: 36px;
height: 36px;
border-radius: 50%;

display: flex;
align-items: center;
justify-content: center;

transition: all 200ms ease;

&:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  transform: scale(1.04);
}

&:active {
  transform: scale(0.96);
}
```

### Card Components

#### Base Card Styling
```css
background-color: var(--bg-secondary);
border: 1px solid var(--border-light);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);
padding: 20px;

transition: all var(--transition-base);

&:hover {
  border-color: var(--border-medium);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}
```

#### Elevated Card (Hero/Featured)
```css
background-color: var(--bg-secondary);
border: 1px solid var(--border-light);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-lg);
padding: 24px;

position: relative;
overflow: hidden;

/* Animated gradient background (optional) */
background: linear-gradient(135deg, var(--accent-50) 0%, var(--bg-secondary) 100%);

&::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, var(--accent-500) 0%, transparent 70%);
  opacity: 0.05;
  top: -100px;
  right: -100px;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}
```

### Form Input Styling

#### Text Input
```css
input {
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--border-medium);
    background-color: var(--bg-secondary);
  }
  
  &:focus {
    outline: none;
    border-color: var(--accent-600);
    background-color: var(--accent-50);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-600) 15%, transparent);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background-color: var(--bg-tertiary);
    color: var(--text-tertiary);
    cursor: not-allowed;
  }
}
```

#### Textarea
```css
textarea {
  font-family: var(--font-body);
  font-size: 14px;
  padding: 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  min-height: 80px;
  resize: vertical;
  
  transition: all var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--accent-600);
    background-color: var(--accent-50);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-600) 15%, transparent);
  }
}
```

#### Select Dropdown
```css
select {
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 12px 10px 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  
  /* Custom dropdown arrow */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235c5a54' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 20px;
  padding-right: 36px;
  appearance: none;
  
  &:focus {
    outline: none;
    border-color: var(--accent-600);
    background-color: var(--accent-50);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-600) 15%, transparent);
  }
}
```

### Badge Variants

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid;
  white-space: nowrap;
}

.badge-success {
  background-color: color-mix(in srgb, var(--color-success) 14%, transparent);
  color: var(--color-success);
  border-color: color-mix(in srgb, var(--color-success) 28%, transparent);
}

.badge-warning {
  background-color: color-mix(in srgb, var(--color-warning) 14%, transparent);
  color: var(--color-warning);
  border-color: color-mix(in srgb, var(--color-warning) 28%, transparent);
}

.badge-danger {
  background-color: color-mix(in srgb, var(--color-danger) 14%, transparent);
  color: var(--color-danger);
  border-color: color-mix(in srgb, var(--color-danger) 28%, transparent);
}

.badge-info {
  background-color: color-mix(in srgb, var(--color-info) 14%, transparent);
  color: var(--color-info);
  border-color: color-mix(in srgb, var(--color-info) 28%, transparent);
}

.badge-neutral {
  background-color: color-mix(in srgb, var(--color-neutral) 14%, transparent);
  color: var(--color-neutral);
  border-color: color-mix(in srgb, var(--color-neutral) 28%, transparent);
}
```

### Modal/Dialog Styling

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(10, 15, 30, 0.52);
  backdrop-filter: blur(14px) saturate(0.85);
  z-index: 1000;
  animation: fadeIn 200ms ease;
}

.modal-panel {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-height: 92vh;
  overflow-y: auto;
  
  /* Size variants */
  &.size-sm { max-width: 420px; }
  &.size-md { max-width: 680px; }  /* Default */
  &.size-lg { max-width: 960px; }
  &.size-xl { max-width: 1180px; }
  
  /* Mobile adjustments */
  @media (max-width: 768px) {
    max-width: 100%;
    margin: 0 12px;
    border-radius: 16px 16px 0 0;
    max-height: 90vh;
  }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-light);
  
  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: var(--text-primary);
  }
}

.modal-body {
  padding: 20px 24px;
  color: var(--text-primary);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

### Border Radius Scale

```css
--radius-sm: 6px;       /* Small buttons, compact components */
--radius-md: 10px;      /* Standard - inputs, small cards */
--radius-lg: 14px;      /* Default - cards, modals, panels */
--radius-xl: 20px;      /* Large - hero sections, feature cards */
--radius-pill: 999px;   /* Fully rounded - badges, pills */
```

---

## Animations & Transitions

### Transition Variables
```css
--transition-fast: 120ms ease;
--transition-base: 220ms cubic-bezier(0.4, 0, 0.2, 1);  /* Quad in-out easing */
```

### Page Reveal Animation
```css
@keyframes pageReveal {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.995);
    filter: blur(1px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

/* Applied to page containers */
animation: pageReveal 0.4s var(--transition-base);
```

### Form Staggered Reveal
```css
@keyframes formReveal {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Applied with staggered delays */
animation: formReveal 0.3s var(--transition-base);
animation-delay: calc(0.04s * var(--index, 0));

/* Individual delays: 0.04s, 0.1s, 0.16s, etc. */
```

### Shimmer Loading Effect
```css
@keyframes shimmer {
  0%, 100% {
    background-position: -1000px 0;
  }
  50% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary),
    color-mix(in srgb, var(--bg-tertiary) 70%, var(--accent-600)),
    var(--bg-tertiary)
  );
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite;
  border-radius: var(--radius-md);
}
```

### Progress Bar Shimmer
```css
@keyframes shimmerMove {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}

@keyframes shimmerFlow {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-bar {
  background: linear-gradient(
    90deg,
    var(--accent-500),
    color-mix(in srgb, var(--accent-500) 60%, white),
    var(--accent-500)
  );
  background-size: 200% 100%;
  animation: shimmerMove 2s infinite;
}
```

### Floating Animation (Hero Blobs)
```css
@keyframes heroFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-14px, -14px) scale(1.05);
  }
}

.hero-blob {
  animation: heroFloat 14s ease-in-out infinite;
  animation-direction: var(--direction, normal);
  animation-delay: var(--delay, 0s);
}

/* Multiple blobs with different timings */
.blob-1 { animation-duration: 14s; animation-direction: normal; }
.blob-2 { animation-duration: 18s; animation-direction: reverse; }
.blob-3 { animation-duration: 16s; animation-direction: normal; }
```

### Pulsing Status Indicator
```css
@keyframes heroPulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.06);
    opacity: 1;
  }
}

.pulse-dot {
  animation: heroPulse 12s ease-in-out infinite;
}
```

### Outward Pulse (Radar Effect)
```css
@keyframes pulseDot {
  0% {
    box-shadow: 0 0 0 0 rgba(15, 64, 36, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(15, 64, 36, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(15, 64, 36, 0);
  }
}

.status-indicator {
  animation: pulseDot 1.8s ease-out infinite;
}
```

### Slide Down Alert
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-banner {
  animation: slideDown 0.3s ease-out;
}
```

### Navigation Indicator
```css
@keyframes navIndicatorIn {
  from {
    transform: scaleY(0.2);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

.nav-active-indicator {
  animation: navIndicatorIn 240ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Reduced Motion Support
```css
@media (prefers-reduce-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoint Reference

| Breakpoint | Width | Device | Grid Behavior |
|------------|-------|--------|---------------|
| `xl` | 1440px+ | Large Desktop | 4-column, 3-column layouts |
| `lg` | 1024px - 1439px | Desktop | 3-column, 2-column layouts |
| `md` | 960px - 1023px | Tablet Landscape | Single row becomes 2 rows |
| `sm` | 768px - 959px | Tablet Portrait | 2-column → single column |
| `xs` | 520px - 767px | Small Phone | Full-width single column |
| `2xs` | < 520px | Small Phone | Extra padding removal |

### Fluid Sizing with `clamp()`

```css
/* Responsive font sizes */
h1 { font-size: clamp(30px, 4vw, 48px); }
h2 { font-size: clamp(24px, 3.5vw, 36px); }

/* Responsive spacing */
padding: clamp(16px, 2vw, 28px) clamp(12px, 2vw, 32px);
gap: clamp(12px, 1.5vw, 20px);

/* Responsive display text */
.large-metric {
  font-size: clamp(42px, 6vw, 64px);
}

/* Sidebar widths */
width: clamp(240px, 20vw, 296px);  /* Expanded */
width: clamp(68px, 6vw, 82px);     /* Collapsed */
```

### Media Query Structure

```css
/* Default: Mobile-first design (520px+) */
.component {
  display: grid;
  grid-template-columns: 1fr;
  padding: 14px 12px;
}

/* Tablet (768px+) */
@media (min-width: 768px) {
  .component {
    grid-template-columns: repeat(2, 1fr);
    padding: 18px 14px;
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component {
    grid-template-columns: repeat(4, 1fr);
    padding: clamp(16px, 2vw, 28px) clamp(12px, 2vw, 32px);
  }
}

/* Large Desktop (1440px+) */
@media (min-width: 1440px) {
  .component {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1920px;
    margin: 0 auto;
  }
}
```

### Touch Target Sizing
```css
/* Minimum 44px touch targets on mobile */
.button,
.icon-button,
input {
  min-height: 44px;
  min-width: 44px;
}

/* Spacing between interactive elements */
gap: 8px minimum on mobile;
gap: 12px minimum on tablet+;
```

---

## Dark Mode

### Implementation
Dark mode is activated by adding the `.dark` class to the `<html>` element:
```html
<html class="dark">
```

Or using CSS variable override:
```javascript
document.documentElement.classList.toggle('dark');
```

### Dark Mode Color Overrides

```css
/* Apply these overrides when html.dark is active */
html.dark {
  /* Backgrounds */
  --bg-primary: #0a0a09;
  --bg-secondary: #141413;
  --bg-tertiary: #1d1c1a;
  --bg-hover: #252420;
  
  /* Text */
  --text-primary: #f5f2ec;
  --text-secondary: #b7b1a4;
  --text-tertiary: #7a7668;
  
  /* Accent adjustments */
  --accent-50: #051f1a;
  --accent-100: #0d3d35;
  --accent-500: #2d9d91;
  --accent-600: #34bfac;    /* Lighter for visibility */
  --accent-700: #47d1bd;
  
  /* Status colors (brightened) */
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
  --color-info: #60a5fa;
  
  /* Borders */
  --border-light: #2a2824;
  --border-medium: #3a3530;
  --border-strong: #4a443c;
  
  /* Shadows - increased opacity */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 20px 40px -12px rgba(0, 0, 0, 0.6);
  --shadow-xl: 0 28px 70px -24px rgba(0, 0, 0, 0.7);
}
```

### Dark Mode Specific Styling

```css
/* Glassmorphism in dark mode */
html.dark .modal-backdrop {
  background-color: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(16px) saturate(0.9);
}

/* Image/illustration opacity adjustments */
html.dark img[data-theme="light"] {
  opacity: 0.85;
  filter: brightness(0.95);
}

/* Gradient adjustments */
html.dark .hero-section {
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--accent-600) 20%, var(--bg-primary)),
    var(--bg-secondary)
  );
}
```

---

## Implementation Guide

### Step 1: Set Up Design Tokens

Create `src/styles/tokens.css` with all CSS custom properties:

```css
:root {
  /* Colors */
  --bg-primary: #faf9f7;
  --bg-secondary: #ffffff;
  /* ... (all color variables) ... */
  
  /* Typography */
  --font-heading: 'Space Grotesk', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Border Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 14px rgba(15, 23, 42, 0.08);
  --shadow-lg: 0 20px 40px -12px rgba(15, 23, 42, 0.18);
  --shadow-xl: 0 28px 70px -24px rgba(15, 23, 42, 0.24);
  
  /* Transitions */
  --transition-fast: 120ms ease;
  --transition-base: 220ms cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Layout */
  --header-height: 52px;
  --sidebar-collapsed: clamp(68px, 6vw, 82px);
  --sidebar-expanded: clamp(240px, 20vw, 296px);
}
```

### Step 2: Import Fonts

Add to your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Step 3: Global Styles

Create `src/index.css`:

```css
@import url('src/styles/tokens.css');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.55;
}

/* Global button styles */
button {
  font-family: inherit;
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.liquid-btn {
  background-color: var(--accent-600);
  color: white;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
}

.liquid-btn:hover {
  background-color: var(--accent-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Form styles */
input, textarea, select {
  font-family: inherit;
  font-size: 14px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  transition: all var(--transition-base);
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--accent-600);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-600) 15%, transparent);
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--bg-primary);
}

::-webkit-scrollbar-thumb {
  background-color: var(--border-medium);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--border-strong);
}
```

### Step 4: Create Component Modules

Use CSS Modules for component-scoped styling:

```css
/* src/components/Button.module.css */
.button {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.primary {
  background-color: var(--accent-600);
  color: white;
}

.primary:hover {
  background-color: var(--accent-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}

.secondary:hover {
  border-color: var(--border-strong);
  background-color: var(--bg-tertiary);
}
```

### Step 5: Apply to Components

```jsx
// src/components/Button.jsx
import styles from './Button.module.css';

export function Button({ variant = 'primary', children, ...props }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

### Step 6: Dark Mode Toggle

```jsx
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    
    if (newValue) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem('theme') === 'dark';
    setIsDark(saved);
    if (saved) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <button onClick={toggleTheme}>
      {isDark ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
```

---

## Quick Reference

### Most-Used Utility Classes

```css
/* Display & Layout */
.flex { display: flex; }
.grid { display: grid; }
.flex-col { flex-direction: column; }
.gap-sm { gap: 8px; }
.gap-md { gap: 16px; }
.gap-lg { gap: 24px; }

/* Padding/Margin */
.p-sm { padding: 8px; }
.p-md { padding: 16px; }
.p-lg { padding: 24px; }
.m-sm { margin: 8px; }
.m-md { margin: 16px; }

/* Text */
.text-center { text-align: center; }
.text-sm { font-size: 12px; }
.text-base { font-size: 14px; }
.text-lg { font-size: 18px; }
.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }

/* Colors */
.text-primary { color: var(--text-primary); }
.text-secondary { color: var(--text-secondary); }
.bg-primary { background-color: var(--bg-primary); }
.bg-secondary { background-color: var(--bg-secondary); }

/* Elevation */
.shadow-sm { box-shadow: var(--shadow-sm); }
.shadow-md { box-shadow: var(--shadow-md); }
.shadow-lg { box-shadow: var(--shadow-lg); }

/* Rounded corners */
.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-pill { border-radius: var(--radius-pill); }
```

---

## Accessibility Standards

The design system follows WCAG 2.1 Level AA standards:

- **Color Contrast**: All text meets 4.5:1 contrast ratio minimum
- **Focus Visible**: All interactive elements have visible focus states
- **Touch Targets**: Minimum 44px × 44px on mobile devices
- **Motion**: Respects `prefers-reduce-motion` preference
- **Semantics**: Proper heading hierarchy, ARIA labels where needed
- **Keyboard Navigation**: Full keyboard support for all interactions

---

## Design System Files Checklist

When replicating this design system, ensure you have:

- [ ] `tokens.css` - All CSS custom properties
- [ ] `index.css` - Global styles and base element styling
- [ ] Font imports from Google Fonts (DM Sans, Space Grotesk, JetBrains Mono)
- [ ] CSS Modules for component scoping
- [ ] Button variants (liquid-btn, secondary-btn, ghost-btn)
- [ ] Form input styling with focus states
- [ ] Modal/dialog backdrop and panel styles
- [ ] Badge component variants (success, warning, danger, info, neutral)
- [ ] Animation keyframes (pageReveal, shimmer, pulse, float, etc.)
- [ ] Media query breakpoints (768px, 1024px, 1440px)
- [ ] Dark mode CSS variable overrides
- [ ] Shadow elevation system
- [ ] Border radius scale
- [ ] Responsive grid systems
- [ ] Transition and easing variables

---

## Design Tools & Resources

### Figma Design File
If you have a Figma file associated with this project, use it as the source of truth for:
- Exact color codes
- Component dimensions
- Spacing measurements
- Typography specifications
- Interaction patterns

### Code Reference Files
- `/src/styles/tokens.css` - Master token definitions
- `/src/index.css` - Global styles
- `/src/components/*.module.css` - Component styling examples
- `/src/screens/*.module.css` - Layout and screen patterns

### Browser DevTools
Use Chrome DevTools to inspect:
- Computed CSS variables: Inspector → Styles → :root
- Animation performance: Performance tab
- Responsive behavior: Device toolbar
- Dark mode testing: Emulate CSS media feature prefers-color-scheme

---

## Version History

- **v1.0** (Current) - Complete design system with light/dark themes, animations, responsive design

---

## Support & Questions

For questions about implementing this design system:
1. Check existing component implementations in `/src/components/`
2. Review screen layouts in `/src/screens/`
3. Inspect CSS modules for specific styling patterns
4. Refer to tokens.css for all design variable definitions

---

*This Design.md is a comprehensive guide for replicating the SAP Portal UI/UX design system. All color codes, spacing, typography, animations, and component styles are documented for consistent implementation across projects.*
