# @cropwatchdevelopment/cwui

A production-ready **Svelte 5** component library built with pure CSS custom properties, dark/light theming, and AAA accessibility out of the box.

[![GitHub Packages](https://img.shields.io/badge/package-GitHub%20Packages-blue?logo=github)](https://github.com/CropWatchDevelopment/CWUI/packages)
[![Svelte 5](https://img.shields.io/badge/svelte-5-FF3E00?logo=svelte&logoColor=white)](https://svelte.dev)
[![License: MIT](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Publish to GitHub Packages](https://github.com/CropWatchDevelopment/CWUI/actions/workflows/publish.yml/badge.svg)](https://github.com/CropWatchDevelopment/CWUI/actions/workflows/publish.yml)
---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Theming](#theming)
- [Components](#components)
- [Types](#types)
- [Style Imports](#style-imports)
- [Development](#development)
- [Publishing](#publishing)

---

## Features

- **22 components** — buttons, inputs, tables, charts, navigation, and more
- **Svelte 5 runes** — `$state`, `$derived`, `$bindable`, `$props`, `Snippet`
- **Zero runtime dependencies** — pure CSS3 custom properties, no Tailwind required
- **Dark & light themes** — swap with `data-theme="dark|light"` on any ancestor
- **Fully typed** — TypeScript interfaces for every prop and shared type
- **Accessible** — ARIA patterns, keyboard navigation, focus management
- **Responsive** — breakpoint-aware components (SideNav, Header, DataTable)
- **Tree-shakable** — import only what you need

---

## Installation

### 1. Configure your `.npmrc`

GitHub Packages requires a scoped registry. Add this to your project's `.npmrc`:

```ini
@cropwatchdevelopment:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

> **Tip:** Generate a [Personal Access Token](https://github.com/settings/tokens) with the `read:packages` scope and set it as the `GITHUB_TOKEN` environment variable, or paste it directly (not recommended for shared repos).

### 2. Install the package

```bash
# npm
npm install @cropwatchdevelopment/cwui

# pnpm
pnpm add @cropwatchdevelopment/cwui

# yarn
yarn add @cropwatchdevelopment/cwui
```

### Peer dependency

This library requires **Svelte 5** (`^5.0.0`). Make sure your project already has it:

```bash
npm install svelte@^5
```

---

## Quick Start

### Import the base styles

In your root layout (`+layout.svelte` or `app.html`):

```svelte
<script>
  import '@cropwatchdevelopment/cwui/styles';
</script>
```

This loads the design tokens, dark theme (default), and light theme in one shot.

### Use a component

```svelte
<script>
  import { CwButton, CwInput, CwTooltip } from '@cropwatchdevelopment/cwui';
  import type { CwTone } from '@cropwatchdevelopment/cwui';

  let email = $state('');
</script>

<CwTooltip value="Enter your email address" tone="info">
  <CwInput
    label="Email"
    type="email"
    placeholder="user@example.com"
    bind:value={email}
  />
</CwTooltip>

<CwButton variant="primary" onclick={() => alert(email)}>
  Submit
</CwButton>
```

---

## Theming

The library ships with **dark** and **light** themes driven entirely by CSS custom properties.

### Switch themes

Set `data-theme` on any ancestor element (typically `<html>`):

```html
<html data-theme="dark">  <!-- or "light" -->
```

Or use the built-in `CwThemePicker` component:

```svelte
<script>
  import { CwThemePicker } from '@cropwatchdevelopment/cwui';
</script>

<CwThemePicker />
```

### Customize tokens

Override any CSS variable in your own stylesheet:

```css
:root {
  --cw-primary-500: #7c3aed;      /* Custom accent colour */
  --cw-radius-md: 0.5rem;          /* Rounder corners */
  --cw-font-family: 'Poppins', sans-serif;
}
```

### Available token categories

| Category | Examples |
|---|---|
| **Colors** | `--cw-gray-*`, `--cw-primary-*`, `--cw-danger-*`, `--cw-success-*`, `--cw-info-*`, `--cw-warning-*` |
| **Surfaces** | `--cw-bg-base`, `--cw-bg-surface`, `--cw-bg-elevated`, `--cw-bg-muted` |
| **Text** | `--cw-text-primary`, `--cw-text-secondary`, `--cw-text-muted` |
| **Borders** | `--cw-border-default`, `--cw-border-strong`, `--cw-border-muted` |
| **Spacing** | `--cw-space-0` through `--cw-space-16` |
| **Typography** | `--cw-text-xs` through `--cw-text-3xl`, `--cw-font-family`, `--cw-font-mono` |
| **Radii** | `--cw-radius-sm` through `--cw-radius-full` |
| **Shadows** | `--cw-shadow-sm` through `--cw-shadow-xl` |
| **Motion** | `--cw-duration-fast`, `--cw-duration-normal`, `--cw-duration-slow` |
| **Z-index** | `--cw-z-dropdown`, `--cw-z-sticky`, `--cw-z-overlay`, `--cw-z-modal`, `--cw-z-toast` |

---

## Components

### Form Controls

| Component | Description |
|---|---|
| **`CwButton`** | Themed button — `primary`, `secondary`, `ghost`, `danger`, `info` variants with `sm`/`md`/`lg` sizes, loading spinner, and full-width option |
| **`CwInput`** | Text input — supports `text`, `numeric`, `email`, `password`, `devEui` types. Left/right icon slots, automatic validation icons (✓/✗), error/valid/disabled states |
| **`CwDropdown`** | Custom select — keyboard-navigable ARIA combobox with search, error state, and label |
| **`CwSearchInput`** | Autocomplete search — async suggestions with debounce, keyboard nav, and abort signal |
| **`CwDateTimeRangePicker`** | Calendar picker — single or range mode, optional time fields, year/month/day granularity |

### Data Display

| Component | Description |
|---|---|
| **`CwDataTable<T>`** | Server-side data table — pagination or virtual scrolling, sorting, column search, external filters, page-size control, toolbar/row action slots, zebra striping |
| **`CwLineChart`** | SVG line chart — multiple series, gradient fill, responsive, auto-scaling axes |
| **`CwDonutChart`** | SVG donut chart — hover highlighting, center label, configurable thickness, legend |
| **`CwPPFDChart`** | Horizontal PPFD range gauge — low/optimal/high zones, crop target band, live reading marker, dynamic scaling |
| **`CwVPDChart`** | Temperature-by-RH VPD matrix — agriculture-style heatmap with selected target overlay and live climate cell |
| **`CwChip`** | Badge/tag — 6 tones × 3 variants (`solid`/`soft`/`outline`), dismissible |
| **`CwCalendar`** | Month calendar — bindable `year`/`month`, customizable day snippets, month-change callback, optional `minDate` / `maxDate` |
| **`CwDuration`** | Live elapsed time — auto-ticking `<time>` element from a start timestamp |
| **`CwListBox<T>`** | Selectable list — badges, end-text, custom item snippets, keyboard navigation |

### Layout & Navigation

| Component | Description |
|---|---|
| **`CwHeader`** | App header — responsive hamburger/logo/title, action slots, integrates with `CwSideNav` |
| **`CwSideNav`** | Side navigation — `open`/`mini`/`hidden` modes, responsive breakpoint auto-switching, icon+label items, header/footer snippets |
| **`CwDrawer`** | Bottom drawer — collapsed bar with item icons, expandable content panel |
| **`CwCard`** | Content card — optional title, subtitle, header/action snippets, elevation control |
| **`CwSeparator`** | Horizontal divider — configurable spacing |

### Overlay & Feedback

| Component | Description |
|---|---|
| **`CwDialog`** | Modal dialog — focus trap, backdrop/escape close, title + action snippets |
| **`CwTooltip`** | Hover tooltip — `top`/`bottom`/`left`/`right` position, 6 tone colors, arrow pointer |
| **`CwToastContainer`** | Toast notification system — context-based, auto-dismiss, 6 tones |
| **`CwProfileMenu`** | User profile dropdown — avatar (image or initials), menu items with separators and danger styling |
| **`CwThemePicker`** | Theme switcher — dark/light/system toggle, applies `data-theme` to `<html>` |

---

## Calendar

`CwCalendar` is a reusable month grid shell. Use it bare for a simple calendar, or add snippets when each day needs a label, trailing metadata, or richer body content.

### Core props

- `year` / `month`: Optional bindable month state. `month` is zero-based like `Date#getMonth()`.
- `onDateClick(date)`: Fires when an enabled day is clicked.
- `onMonthChange(year, month, displayedMonth)`: Fires after the previous/next month buttons change the visible month.
- `minDate` / `maxDate`: Prevent navigation and date clicks outside the allowed range.
- `dayHeader(date)` / `dayTrailing(date)` / `dayContent(date)`: Optional snippet props for custom day content.

### Example

```svelte
<script lang="ts">
  import { CwCalendar } from '@cropwatchdevelopment/cwui';

  let visibleYear = $state(new Date().getFullYear());
  let visibleMonth = $state(new Date().getMonth());
  let selectedDate = $state<Date | null>(null);

  const minDate = new Date(2026, 2, 10);
  const maxDate = new Date(2026, 4, 22);

  function weatherFor(date: Date) {
    const icons = ['☀️', '🌤️', '⛅', '🌧️', '🌦️', '☁️', '🌤️'];
    return { icon: icons[date.getDay()], high: 70 + (date.getDay() % 4) };
  }
</script>

<CwCalendar
  bind:year={visibleYear}
  bind:month={visibleMonth}
  {minDate}
  {maxDate}
  onDateClick={(date) => (selectedDate = date)}
  onMonthChange={(_year, _month, displayedMonth) => console.log(displayedMonth)}
>
  {#snippet dayHeader(date)}
    <span>{selectedDate?.toDateString() === date.toDateString() ? 'Selected' : 'Open day'}</span>
  {/snippet}

  {#snippet dayTrailing(date)}
    {@const weather = weatherFor(date)}
    <div style="display:grid;justify-items:end;gap:0.1rem">
      <span style="font-size:1.2rem">{weather.icon}</span>
      <span>{weather.high}°</span>
    </div>
  {/snippet}

  {#snippet dayContent(date)}
    <div>{date.toLocaleDateString()}</div>
  {/snippet}
</CwCalendar>
```

---

## Types

All types are exported from the main entry point:

```ts
import type {
  CwTone,           // 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success'
  CwButtonVariant,  // 'primary' | 'secondary' | 'ghost' | 'danger' | 'info'
  CwSize,           // 'sm' | 'md' | 'lg'
  CwChipVariant,    // 'solid' | 'soft' | 'outline'

  // DataTable
  CwTableQuery,
  CwTableResult,
  CwColumnDef,

  // Charts
  CwLineSeries,
  CwDonutSegment,
  CwPPFDStatus,
  CwPPFDTick,
  CwPPFDReading,
  CwVPDStatus,
  CwVPDStageBandTone,
  CwVPDTick,
  CwVPDStageBand,
  CwVPDReading,

  // Toast
  CwToastItem,

  // Date Picker
  CwDatePickerMode,
  CwDateGranularity,
  CwSingleDateValue,
  CwRangeDateValue,
  CwDateValue,

  // Layout / Nav
  CwDrawerItem,
  CwListBoxItem,
  CwProfileMenuItem,
  CwSideNavMode,
  CwSideNavSide,
  CwSideNavItem,
} from '@cropwatchdevelopment/cwui';
```

---

## Style Imports

Fine-grained CSS imports are available if you only need specific parts:

```ts
// All-in-one (tokens + both themes + resets)
import '@cropwatchdevelopment/cwui/styles';

// Individual layers
import '@cropwatchdevelopment/cwui/styles/tokens';      // Raw design tokens
import '@cropwatchdevelopment/cwui/styles/theme-dark';   // Dark theme mapping
import '@cropwatchdevelopment/cwui/styles/theme-light';  // Light theme mapping
```

---

## Usage Examples

### Toast System

```svelte
<!-- +layout.svelte -->
<script>
  import { CwToastContainer, createCwToastContext } from '@cropwatchdevelopment/cwui';
  createCwToastContext();
</script>

<CwToastContainer />
<slot />
```

```svelte
<!-- Any child component -->
<script>
  import { useCwToast, CwButton } from '@cropwatchdevelopment/cwui';
  const toast = useCwToast();
</script>

<CwButton onclick={() => toast.push({ tone: 'success', message: 'Saved!' })}>
  Save
</CwButton>
```

### Data Table

```svelte
<script>
  import { CwDataTable } from '@cropwatchdevelopment/cwui';
  import type { CwColumnDef, CwTableQuery, CwTableResult } from '@cropwatchdevelopment/cwui';

  interface Device { id: string; name: string; status: string; }

  let filters = $state<Record<string, string[]>>({});

  const columns: CwColumnDef<Device>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'status', header: 'Status' },
  ];

  async function loadDevices(query: CwTableQuery): Promise<CwTableResult<Device>> {
    const res = await fetch(`/api/devices?page=${query.page}&size=${query.pageSize}`);
    return res.json();
  }
</script>

<CwDataTable
  {columns}
  loadData={loadDevices}
  rowKey="id"
  filters={filters}
  virtualScroll
  virtualScrollHeight="24rem"
  virtualRowHeight={52}
/>
```

### Responsive App Shell

```svelte
<script>
  import { CwHeader, CwSideNav } from '@cropwatchdevelopment/cwui';
  import type { CwSideNavItem, CwSideNavMode } from '@cropwatchdevelopment/cwui';

  let mode = $state<CwSideNavMode>('open');

  const navItems: CwSideNavItem[] = [
    { id: 'home', label: 'Dashboard', href: '/', icon: 'M8 1.5L1 7h2v6h4V9h2v4h4V7h2L8 1.5z' },
    { id: 'devices', label: 'Devices', href: '/devices', icon: 'M3 3h10v8H3V3zm2 10h6' },
  ];
</script>

<div style="display:flex; height:100vh">
  <CwSideNav items={navItems} bind:mode responsive />
  <div style="flex:1; display:flex; flex-direction:column">
    <CwHeader title="My App" bind:sideNavMode={mode} onToggleNav={() => mode = mode === 'hidden' ? 'open' : 'hidden'} />
    <main style="flex:1; padding:1rem; overflow-y:auto">
      <slot />
    </main>
  </div>
</div>
```

---

## Development

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended, see `packageManager` in `package.json`)

### Getting started

```bash
git clone https://github.com/CropWatchDevelopment/CWUI.git
cd CWUI
pnpm install
pnpm dev          # Start dev server with demo pages at http://localhost:5173/demo
```

### Available scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start Vite dev server with live demo pages |
| `pnpm build` | Build the SvelteKit app + package the library |
| `pnpm package` | Build only the library to `dist/` |
| `pnpm check` | Run `svelte-check` for type errors |
| `pnpm preview` | Preview the production build |

### Project structure

```
src/
├── lib/
│   ├── components/     # All 22 Svelte 5 components
│   ├── styles/
│   │   ├── base.css          # Import aggregator
│   │   ├── tokens.css        # Raw design tokens
│   │   ├── theme-dark.css    # Dark theme semantic mapping
│   │   └── theme-light.css   # Light theme semantic mapping
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   └── index.ts              # Barrel export
├── routes/
│   └── demo/                 # Interactive demo pages for every component
└── app.html
```

---

## Publishing

Publishing happens automatically via GitHub Actions when you push a version tag:

```bash
# 1. Bump version in package.json
# 2. Commit the release
git add -A && git commit -m "chore: release v0.2.0"

# 3. Push the release commit
git push origin main

# 4. Tag the same commit
git tag v0.2.0

# 5. Push the tag to trigger publish
git push origin v0.2.0
```

The [publish workflow](.github/workflows/publish.yml) will build the library and publish to GitHub Packages.

---

## License

[MIT](./LICENSE) — CropWatch Development
