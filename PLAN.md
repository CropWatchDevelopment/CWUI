## CropWatch UI v2 Library Plan (Exact Visual Parity, CSS3-First, Svelte 5)

### Summary
This plan creates a new **separate `cropwatch-ui` repo** as the source of truth for reusable UI, then performs a **big-bang rewrite** in this app to consume it via **git subtree sync**.  
The new library will preserve current look/feel (dark baseline), add light mode through token mapping, use plain CSS3 (no Tailwind dependency inside library components), and keep all components reactive via Svelte 5 runes + SvelteKit patterns.
Use the Svelte MCP server for proper Svelte 5 coding standards, and do not ignore it.

Current codebase review highlights:
- You already have many equivalents (`CWTable`, `CWButton`, `CWDuration`, charts, dialog, toast, date picker), but APIs and styling conventions are inconsistent and Tailwind-coupled.
- i18n is not implemented today (many `en-US` hardcoded formatters and static `<html lang="en">`).
- Baseline quality debt exists (`npm run check` reports type issues across multiple routes/components; unit tests are partially blocked by missing Playwright browser install).

### Public APIs / Types (new library contract)
All exports use `Cw*` naming only.

- `CwButton`
  - Props: `variant: 'primary' | 'secondary' | 'ghost' | 'danger' | 'info'`, `size`, `loading`, `disabled`, `fullWidth`, native button attrs
  - Behavior: `loading => disabled + spinner`, focus-visible and AAA contrast tokens

- `CwChip`
  - Props: `tone: 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success'`, `size`, `variant: 'solid' | 'soft' | 'outline'`, `dismissible?`, `disabled?`
  - Behavior: compact status/tag UI with strong contrast, optional dismiss affordance, keyboard-focusable when interactive

- `CwCard`
  - Props: `title?`, `subtitle?`, `padded?`, `elevated?`
  - Slots: default content, optional header/action slot

- `CwInput`
  - Props: `type: 'text' | 'numeric' | 'email' | 'password' | 'devEui'`, `value` (bindable), `label`, `error`, `valid`, `disabled`, `leftSlot`, `rightSlot`
  - Behavior: validation states, left/right affordance zones, DevEUI normalization mode

- `CwSearchInput`
  - Props: `value` (bindable), `minChars=3`, `debounceMs=250`, `fetchSuggestions(query, signal)`, `mapSuggestionToLabel`, `mapSuggestionToValue`
  - Behavior: async dropdown, spinner while fetching, abort stale requests, keyboard navigation

- `CwDropdown`
  - Props: `options`, `value` (bindable), `placeholder`, `disabled`, `error`
  - Behavior: consistent trigger/listbox semantics and keyboard support

- `CwDuration`
  - Props: `from: Date | string | number`, `tickMs=1000`
  - Display rules:
    - `< 1m`: seconds
    - `< 1h`: minutes + seconds
    - `< 1d`: hours + minutes
    - `>= 1d`: days + hours

- `CwDataTable<T>`
  - Types:
    - `CwTableQuery = { page, pageSize, search, sort, filters, signal }`
    - `CwTableResult<T> = { rows: T[]; total: number; facets?: Record<string, string[]> }`
    - `CwColumnDef<T>` with typed cell renderers and click behavior
  - Props:
    - `columns`, `loadData(query) => Promise<CwTableResult<T>>`, `rowKey`, `onRowClick`, `emptyState`, `errorState`
  - Behavior: async loading, no-data, error, search, filter, sortable columns, row/line click, responsive modes

- `CwLineChart`
  - Props: `series[]`, `height`, `showGradient?`, `showLegend?`
  - Behavior: multi-line, legend click toggles series visibility, responsive SVG, optional gradient styling

- `CwDonutChart`
  - Props: `segments[]`, `size`, `thickness`, `showLegend`
  - Behavior: hover segment shows `value / total` and segment label

- `CwDialog`
  - Props: `open` (bindable), `title`, `closeOnBackdrop`, `closeOnEscape`
  - Slots: default content + explicit bottom action bar slot
  - Behavior: focus trap, ESC/backdrop close logic, accessible labeling

- `CwToast` system
  - `CwToastContainer` + `createCwToastContext`/`useCwToast`
  - Types: `tone: 'primary' | 'secondary' | 'info' | 'warning' | 'danger' | 'success'`
  - Defaults: auto-close `5000ms`, configurable duration, dismiss action, queue limit

- `CwDateTimeRangePicker`
  - Props:
    - `mode: 'single' | 'range'`
    - `granularity: 'year' | 'month' | 'day'`
    - `includeTime: boolean`
    - `value` (bindable)
    - `maxDate` default = local “today” ceiling
  - Behavior: drag range selection with hover preview, single-date mode, time include/exclude, never allow future date selection

### Repo and Integration Architecture
1. Create new repo `cropwatch-ui` (SvelteKit + Svelte 5 + TypeScript strict).
2. Structure:
   - `src/lib/components/*`
   - `src/lib/styles/tokens.css`
   - `src/lib/styles/theme-dark.css`
   - `src/lib/styles/theme-light.css`
   - `src/lib/styles/base.css`
   - `src/lib/index.ts` (single export barrel)
   - `src/routes` demo/sandbox pages for parity validation
3. Use **pure CSS3** inside library components (no Tailwind classes in library source).
4. Keep this app consuming library code via **git subtree copy** into `vendor/cropwatch-ui` plus Svelte alias (for deterministic sync).
5. Add sync script (`scripts/sync-cw-ui.sh`) to pull/update subtree and validate checks after sync.

### Theming and Visual Parity Strategy
1. Extract current dark visual tokens (colors, spacing, radii, shadows, typography, motion) into CSS custom properties.
2. Define semantic tokens (`--cw-surface`, `--cw-text`, `--cw-border`, `--cw-accent`, etc.) and component-level tokens.
   - Include standard tone tokens for `primary`, `secondary`, `info`, `warning`, `danger`, and `success`.
3. Set dark as canonical parity target first; create light theme by swapping token values only.
4. Theme switch mechanism via `data-theme="dark|light"` on root element; no component-level branching for palette logic.
5. Parity checkpoints use screenshot diffs against existing screens before the big-bang swap.

### Uniform Coding Standard
1. Svelte 5 runes only for new library code (`$state`, `$derived`, `$effect`, `$bindable`, `$props`).
2. No inline utility-framework class composition; reusable component classes and tokenized CSS only.
3. Strict typed props and exported types for every public component.
4. Standard file shape for all components:
   - typed props/types
   - state/derived/effects
   - handlers
   - markup
   - scoped style using tokens
5. Accessibility-first defaults (AAA target): keyboard flows, ARIA roles/labels, visible focus, contrast-safe tokens.

### Big-Bang Rewrite Execution (this app)
1. Freeze old `CW*` component API usage map and route inventory.
2. Implement full `Cw*` library set in `cropwatch-ui`.
3. Build parity demo routes in library repo for each component state matrix.
4. Sync subtree into this app.
5. Replace imports/usages in one branch-wide migration:
   - `CWButton` -> `CwButton`
   - `CWTable` -> `CwDataTable`
   - `CWDuration` -> `CwDuration`
   - etc.
6. Replace route-level Tailwind-dependent component internals only through new library usage (library-only CSS3 scope retained).
7. Remove deprecated `src/lib/components/CW*` usage paths once replacement passes acceptance.
8. Run full checks and fix type issues blocking release.

### Test Cases and Acceptance Scenarios
1. Unit tests per component state matrix:
   - default/loading/disabled/error/empty for each relevant component
   - chip tone matrix coverage for `primary`, `secondary`, `info`, `warning`, `danger`, and `success`
   - duration formatting thresholds
   - data table async lifecycle and abort behavior
   - search input min-char + debounced fetch + stale response rejection
2. Accessibility tests:
   - keyboard-only navigation for dropdown/dialog/date picker/table
   - screen reader labels/roles for charts and inputs
   - focus trap + escape handling in dialog
   - contrast assertions against AAA tokens
3. Visual regression:
   - baseline screenshots from current app for representative pages
   - compare post-migration screenshots in dark mode (must match intent closely)
   - verify light mode token map consistency
4. Integration tests:
   - reactive updates from SvelteKit data changes reflected in components
   - row click, filter, sort, pagination, and error recovery in `CwDataTable`
   - toast lifecycle timing and manual dismissal
5. Performance checks:
   - table render performance at high row counts
   - chart redraw performance on resize and visibility toggles

### Delivery Milestones
1. Milestone 1: Library foundation repo, tokens, theme system, coding standards, CI checks.
2. Milestone 2: Core primitives (`CwButton`, `CwChip`, `CwCard`, `CwInput`, `CwDropdown`, `CwDialog`, `CwToast`, `CwDuration`).
3. Milestone 3: Data and visualization components (`CwDataTable`, `CwSearchInput`, `CwLineChart`, `CwDonutChart`, `CwDateTimeRangePicker`).
4. Milestone 4: Big-bang app migration via subtree sync and import replacement.
5. Milestone 5: Stabilization (type-check debt cleanup, accessibility hardening, visual parity sign-off).

### Assumptions and Defaults Chosen
- Separate UI repo is required.
- Big-bang rewrite is required (no staged adapter migration).
- i18n implementation is fully deferred for this phase.
- Dark theme is canonical parity baseline; light theme is token-derived.
- Library components must be CSS3-only (no framework reliance internally).
- Component naming is `Cw*` only.
- Charts are native SVG + Svelte runes (no chart framework dependency in new library).
- `CwDataTable` uses provider-callback async contract.
- Accessibility target is strict AAA from the start.
- Browser support target is modern evergreen browsers.
- Consumption model is git subtree sync into this app.
