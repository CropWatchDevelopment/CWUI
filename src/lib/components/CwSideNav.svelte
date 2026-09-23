<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type {
		CwSideNavIcon,
		CwSideNavItem,
		CwSideNavMode,
		CwSideNavSide,
		CwViewSize
	} from '../types/index.js';
	import CwSeparator from './CwSeparator.svelte';
	import { CW_VIEW_SIZE_BREAKPOINTS, getCwViewSize } from '../utils/cwViewSize.js';

	interface Props {
		/** Navigation items */
		items: CwSideNavItem[];
		/** Current display mode */
		mode?: CwSideNavMode;
		/** Which side of the screen */
		side?: CwSideNavSide;
		/** Enable responsive auto-mode: open >= 1024px, mini 640-1023px, hidden < 640px */
		responsive?: boolean;
		/** Callback when an item is selected */
		onselect?: (item: CwSideNavItem) => void;
		/** Snippet for the header/logo area (open mode shows full, mini shows icon-only) */
		header?: Snippet;
		/** Compact header for mini mode (falls back to header if not provided) */
		headerMini?: Snippet;
		/** Snippet for content above the navigation items (e.g. user profile) */
		aboveContent?: Snippet;
		/** Optional right-side renderer for each item in open mode */
		itemTrailing?: Snippet<[CwSideNavItem]>;
		/** Snippet for the bottom area (e.g. a button, version text, user info) */
		footer?: Snippet;
		/** Compact footer for mini mode */
		footerMini?: Snippet;
		/** Accessible name for the navigation landmark */
		ariaLabel?: string;
		/** Accessible labels for the built-in toggle buttons */
		labels?: {
			close?: string;
			collapse?: string;
			expand?: string;
		};
		class?: string;
	}

	let {
		items,
		mode = $bindable<CwSideNavMode>('open'),
		side = 'left',
		responsive = false,
		onselect,
		header,
		headerMini,
		aboveContent,
		itemTrailing,
		footer,
		footerMini,
		ariaLabel = 'Side navigation',
		labels = {},
		class: className = ''
	}: Props = $props();

	const resolvedLabels = $derived({
		close: labels.close ?? 'Close navigation',
		collapse: labels.collapse ?? 'Collapse navigation',
		expand: labels.expand ?? 'Expand navigation'
	});

	type ResolvedSideNavIcon =
		| { kind: 'path'; value: string }
		| { kind: 'asset'; value: string };

	/** Default placeholder icon (circle) when none is provided */
	const defaultIcon = 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2';
	const pathStartPattern = /^[MmLlHhVvCcSsQqTtAa]/;
	const pathCharPattern = /^[MmZzLlHhVvCcSsQqTtAa0-9.,\-\s]+$/;

	/** Track whether user has manually overridden the mode */
	let userOverride = $state(false);

	/** Track phone-sized viewport for close button vs toggle */
	let isPhone = $state(false);
	/** Internal active fallback when items are not externally controlled */
	let selectedItemId = $state<string | undefined>(undefined);

	const hasExplicitActiveItem = $derived.by(() =>
		items.some((item) => item.active === true)
	);

	/*
	 * Breakpoints follow CW_VIEW_SIZE_BREAKPOINTS (phone <= 640, tablet <= 1024).
	 * matchMedia `change` only fires when a breakpoint is actually crossed, so
	 * the mobile address bar showing/hiding during scroll (which fires `resize`)
	 * no longer snaps a user-opened nav shut.
	 */
	const PHONE_QUERY = `(max-width: ${CW_VIEW_SIZE_BREAKPOINTS.phoneMax}px)`;
	const TABLET_QUERY = `(max-width: ${CW_VIEW_SIZE_BREAKPOINTS.tabletMax}px)`;

	/** Detect phone-sized viewport (always) */
	$effect(() => {
		if (typeof window === 'undefined' || !window.matchMedia) return;
		const phoneMql = window.matchMedia(PHONE_QUERY);
		const check = () => {
			isPhone = phoneMql.matches;
		};
		check();
		phoneMql.addEventListener('change', check);
		return () => phoneMql.removeEventListener('change', check);
	});

	/** Set mode from the viewport when responsive is enabled */
	$effect(() => {
		if (!responsive || typeof window === 'undefined' || !window.matchMedia) return;

		function applyResponsive() {
			if (userOverride) return;
			const viewSize: CwViewSize = getCwViewSize(window.innerWidth);
			if (viewSize === 'desktop') {
				mode = 'open';
			} else if (viewSize === 'tablet') {
				mode = 'mini';
			} else {
				mode = 'hidden';
			}
		}

		// untrack() so the effect depends only on `responsive`, not `userOverride`.
		untrack(() => applyResponsive());

		function handleBreakpointChange() {
			// A real breakpoint change resets any manual override so the nav re-adapts.
			userOverride = false;
			applyResponsive();
		}

		const queries = [window.matchMedia(PHONE_QUERY), window.matchMedia(TABLET_QUERY)];
		for (const mql of queries) mql.addEventListener('change', handleBreakpointChange);
		return () => {
			for (const mql of queries) mql.removeEventListener('change', handleBreakpointChange);
		};
	});

	/* ── Phone overlay (off-canvas drawer) ─────────────────── */
	let navEl = $state<HTMLElement | null>(null);

	/** False during SSR / first paint, before the viewport has been measured. */
	let hydrated = $state(false);
	$effect(() => {
		hydrated = true;
	});

	/** On phones an open nav floats over the page instead of taking layout space. */
	const isOverlay = $derived(isPhone && mode === 'open');

	$effect(() => {
		if (!isOverlay) return;
		const returnFocusEl =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const target = navEl?.querySelector<HTMLElement>(
			'.cw-sidenav__items a:not([aria-disabled="true"]), .cw-sidenav__items button:not(:disabled), .cw-sidenav__toggle'
		);
		target?.focus();

		const root = document.documentElement;
		const previousOverflow = root.style.overflow;
		root.style.overflow = 'hidden';

		return () => {
			root.style.overflow = previousOverflow;
			if (returnFocusEl && returnFocusEl.isConnected) returnFocusEl.focus();
		};
	});

	function closeOverlay() {
		userOverride = true;
		mode = 'hidden';
	}

	const overlayFocusableSelector =
		'a[href]:not([tabindex="-1"]), button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

	function handleNavKeydown(event: KeyboardEvent) {
		if (!isOverlay) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closeOverlay();
			return;
		}
		if (event.key === 'Tab' && navEl) {
			const focusables = Array.from(
				navEl.querySelectorAll<HTMLElement>(overlayFocusableSelector)
			).filter((el) => el.offsetParent !== null);
			if (focusables.length === 0) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		}
	}

	/* ── Mini-mode tooltip (shown on hover AND keyboard focus) ─ */
	let miniTip = $state<{ label: string; top: number; left: number; right: number } | null>(
		null
	);

	function showMiniTip(event: Event, label: string) {
		if (mode !== 'mini') return;
		const el = event.currentTarget as HTMLElement;
		const rect = el.getBoundingClientRect();
		miniTip = {
			label,
			top: rect.top + rect.height / 2,
			left: rect.right,
			right: window.innerWidth - rect.left
		};
	}

	function hideMiniTip() {
		miniTip = null;
	}

	$effect(() => {
		if (mode !== 'mini') miniTip = null;
	});

	/** Toggle the sidenav: close on phone, open/mini on tablet+ */
	function toggleNav() {
		hideMiniTip();
		userOverride = true;
		if (isPhone) {
			mode = 'hidden';
		} else {
			mode = mode === 'open' ? 'mini' : 'open';
		}
	}

	function resolveItemLabel(item: CwSideNavItem) {
		return item.title ?? item.label;
	}

	function resolveItemHref(item: CwSideNavItem) {
		if (item.href) return item.href;
		return typeof item.goto === 'string' ? item.goto : undefined;
	}

	function isSvgPathData(value: string) {
		return pathStartPattern.test(value) && pathCharPattern.test(value);
	}

	function hasDefaultSvgExport(value: unknown): value is { default: string } {
		return !!value && typeof value === 'object' && 'default' in value && typeof value.default === 'string';
	}

	function extractIconValue(icon: CwSideNavIcon | undefined): string | undefined {
		if (!icon) return undefined;
		if (typeof icon === 'string') return icon;

		if ('path' in icon && typeof icon.path === 'string') return icon.path;
		if ('src' in icon && typeof icon.src === 'string') return icon.src;

		const [firstValue] = Object.values(icon);
		if (typeof firstValue === 'string') return firstValue;
		if (hasDefaultSvgExport(firstValue)) return firstValue.default;

		return undefined;
	}

	function resolveItemIcon(item: CwSideNavItem): ResolvedSideNavIcon {
		const iconValue = extractIconValue(item.icon)?.trim();
		if (!iconValue) return { kind: 'path', value: defaultIcon };
		if (isSvgPathData(iconValue)) return { kind: 'path', value: iconValue };
		return { kind: 'asset', value: iconValue };
	}

	async function runItemGoto(item: CwSideNavItem) {
		if (typeof item.goto !== 'function') return;
		await item.goto();
	}

	function isItemActive(item: CwSideNavItem) {
		if (item.active) return true;
		if (hasExplicitActiveItem) return false;
		return selectedItemId === item.id;
	}

	async function handleItemClick(item: CwSideNavItem) {
		if (item.disabled) return;
		selectedItemId = item.id;
		await runItemGoto(item);
		onselect?.(item);
		if (isOverlay) closeOverlay();
	}

	function handleAnchorClick(event: MouseEvent, item: CwSideNavItem) {
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		selectedItemId = item.id;
		onselect?.(item);
		if (isOverlay) closeOverlay();
	}

	$effect(() => {
		const explicitActiveItem = items.find((item) => item.active);
		if (explicitActiveItem) {
			if (selectedItemId !== explicitActiveItem.id) {
				selectedItemId = explicitActiveItem.id;
			}
			return;
		}

		if (selectedItemId && !items.some((item) => item.id === selectedItemId)) {
			selectedItemId = undefined;
		}
	});

</script>

{#if isOverlay}
	<div class="cw-sidenav__scrim" aria-hidden="true" onclick={closeOverlay}></div>
{/if}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
	bind:this={navEl}
	class={[
		'cw-sidenav',
		mode === 'open' && 'cw-sidenav--open',
		mode === 'mini' && 'cw-sidenav--mini',
		mode === 'hidden' && 'cw-sidenav--hidden',
		side === 'right' && 'cw-sidenav--right',
		isOverlay && 'cw-sidenav--overlay',
		responsive && !hydrated && 'cw-sidenav--pending',
		className
	]}
	aria-label={ariaLabel}
	inert={mode === 'hidden'}
	onkeydown={handleNavKeydown}
>
	<!-- Header / Logo -->
	{#if mode === 'open' && header}
		<div class="cw-sidenav__header">
			<div class="cw-sidenav__header-row">
				<div class="cw-sidenav__header-content">
					{@render header()}
				</div>
				<button
					class="cw-sidenav__toggle"
					type="button"
					onclick={toggleNav}
					aria-label={isPhone ? resolvedLabels.close : resolvedLabels.collapse}
				>
					<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
						{#if isPhone}
							<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						{:else}
							<path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
						{/if}
					</svg>
				</button>
			</div>
		</div>
	{:else if mode === 'open' && isOverlay}
		<div class="cw-sidenav__bare-toggle">
			<button
				class="cw-sidenav__toggle cw-sidenav__toggle--plain"
				type="button"
				onclick={toggleNav}
				aria-label={resolvedLabels.close}
			>
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	{:else if mode === 'mini'}
		<div class="cw-sidenav__header cw-sidenav__header--mini">
			<button
				class="cw-sidenav__toggle cw-sidenav__toggle--mini"
				type="button"
				onclick={toggleNav}
				aria-label={resolvedLabels.expand}
			>
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	{/if}

	{#if aboveContent && mode !== 'mini'}
		<div class="cw-sidenav__above-content">
			{@render aboveContent()}
		</div>
	{/if}
	<!-- Navigation items -->
	<div class="cw-sidenav__items">
		{#each items as item, i (item.id)}
			{@const prevGroup = i > 0 ? items[i - 1].group : undefined}
			{@const showGroup = item.group && item.group !== prevGroup}
			{@const itemHref = resolveItemHref(item)}
			{@const itemLabel = resolveItemLabel(item)}
			{@const itemIcon = resolveItemIcon(item)}
			{@const hasTrailing = itemTrailing || item.trailingSnippet || item.trailing !== undefined}

			{#if (item.separator || showGroup) && i > 0}
				<CwSeparator spacing="var(--cw-space-3)" />
			{/if}

			{#if showGroup && mode === 'open'}
				<span class="cw-sidenav__group-label">{item.group}</span>
			{/if}

			<div
				class="cw-sidenav__item-row"
				class:cw-sidenav__item-row--active={isItemActive(item)}
				class:cw-sidenav__item-row--disabled={item.disabled}
			>
				{#if itemHref}
					<a
						class="cw-sidenav__item"
						href={itemHref}
						target={item.openExternalTab ? '_blank' : undefined}
						rel={item.openExternalTab ? 'noopener noreferrer' : undefined}
						aria-current={isItemActive(item) ? 'page' : undefined}
						aria-disabled={item.disabled ? 'true' : undefined}
						tabindex={item.disabled ? -1 : undefined}
						aria-label={mode === 'mini' ? itemLabel : undefined}
						onclick={(event) => handleAnchorClick(event, item)}
						onmouseenter={(event) => showMiniTip(event, itemLabel)}
						onmouseleave={hideMiniTip}
						onfocus={(event) => showMiniTip(event, itemLabel)}
						onblur={hideMiniTip}
					>
						{#if itemIcon.kind === 'path'}
							<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d={itemIcon.value} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							<img class="cw-sidenav__icon cw-sidenav__icon--asset" src={itemIcon.value} alt="" aria-hidden="true" />
						{/if}
						{#if mode === 'open'}
							<span class="cw-sidenav__label">{itemLabel}</span>
						{/if}
					</a>
				{:else}
					<button
						type="button"
						class="cw-sidenav__item"
						aria-label={mode === 'mini' ? itemLabel : undefined}
						aria-current={isItemActive(item) ? 'page' : undefined}
						disabled={item.disabled}
						onclick={() => handleItemClick(item)}
						onmouseenter={(event) => showMiniTip(event, itemLabel)}
						onmouseleave={hideMiniTip}
						onfocus={(event) => showMiniTip(event, itemLabel)}
						onblur={hideMiniTip}
					>
						{#if itemIcon.kind === 'path'}
							<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d={itemIcon.value} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							<img class="cw-sidenav__icon cw-sidenav__icon--asset" src={itemIcon.value} alt="" aria-hidden="true" />
						{/if}
						{#if mode === 'open'}
							<span class="cw-sidenav__label">{itemLabel}</span>
						{/if}
					</button>
				{/if}

				{#if mode === 'open' && hasTrailing}
					<div class="cw-sidenav__trailing">
						{#if itemTrailing}
							{@render itemTrailing(item)}
						{:else if item.trailingSnippet}
							{@render item.trailingSnippet()}
						{:else if item.trailing !== undefined}
							<span class="cw-sidenav__trailing-pill">{item.trailing}</span>
						{/if}
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Footer -->
	{#if mode === 'open' && footer}
		<div class="cw-sidenav__footer">
			{@render footer()}
		</div>
	{:else if mode === 'mini' && footerMini}
		<!-- The full footer is not reused in mini mode: it overflows the 3.5rem rail. -->
		<div class="cw-sidenav__footer cw-sidenav__footer--mini">
			{@render footerMini()}
		</div>
	{/if}
</nav>

{#if miniTip}
	<div
		class="cw-sidenav__tip"
		style:top="{miniTip.top}px"
		style:left={side === 'right' ? undefined : `${miniTip.left}px`}
		style:right={side === 'right' ? `${miniTip.right}px` : undefined}
		aria-hidden="true"
	>
		{miniTip.label}
	</div>
{/if}

<style>
	.cw-sidenav {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--cw-sidenav-bg);
		font-family: var(--cw-font-family);
		color: var(--cw-sidenav-item-text);
		overflow: hidden;
		transition:
			width var(--cw-duration-slow) var(--cw-ease-default),
			transform var(--cw-duration-slow) var(--cw-ease-default);
	}

	.cw-sidenav {
		border-inline-end: 1px solid var(--cw-border-muted);
	}

	.cw-sidenav--right {
		border-inline-end: none;
		border-inline-start: 1px solid var(--cw-border-muted);
	}

	.cw-sidenav--open {
		width: 17.5rem;
		flex-shrink: 0;
	}

	.cw-sidenav--mini {
		width: 3.5rem;
		flex-shrink: 0;
	}

	.cw-sidenav--hidden {
		width: 0;
		border-width: 0;
		overflow: hidden;
		/* Hide after the width transition so hidden links can't be focused or read. */
		visibility: hidden;
		transition:
			width var(--cw-duration-slow) var(--cw-ease-default),
			visibility 0s linear var(--cw-duration-slow);
	}

	/* Server-rendered markup can't know the viewport yet. On small screens,
	   keep a responsive nav out of the layout until the breakpoint effect has
	   picked the real mode, so phones don't flash an in-flow open nav. */
	@media (max-width: 1024px) {
		.cw-sidenav--pending {
			display: none;
		}
	}

	/* ── Phone: off-canvas overlay ─────────── */
	.cw-sidenav--overlay {
		position: fixed;
		inset-block: 0;
		inset-inline-start: 0;
		z-index: var(--cw-z-modal);
		width: min(17.5rem, calc(100vw - 3rem));
		padding-bottom: env(safe-area-inset-bottom, 0px);
		box-shadow: var(--cw-elevation-modal);
		animation: cw-sidenav-slide-in var(--cw-duration-slow) var(--cw-ease-out);
	}

	.cw-sidenav--overlay.cw-sidenav--right {
		inset-inline-start: auto;
		inset-inline-end: 0;
		animation-name: cw-sidenav-slide-in-right;
	}

	.cw-sidenav__scrim {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-overlay);
		background: var(--cw-scrim);
		animation: cw-sidenav-fade-in var(--cw-duration-normal) var(--cw-ease-out);
	}

	@keyframes cw-sidenav-slide-in {
		from {
			transform: translateX(-100%);
		}
	}

	@keyframes cw-sidenav-slide-in-right {
		from {
			transform: translateX(100%);
		}
	}

	@keyframes cw-sidenav-fade-in {
		from {
			opacity: 0;
		}
	}

	.cw-sidenav__bare-toggle {
		display: flex;
		justify-content: flex-end;
		padding: var(--cw-space-2);
		flex-shrink: 0;
	}

	/* ── Mini-mode tooltip ─────────────────── */
	.cw-sidenav__tip {
		position: fixed;
		z-index: var(--cw-z-tooltip);
		transform: translate(var(--cw-space-2), -50%);
		padding: var(--cw-space-1) var(--cw-space-2);
		border-radius: var(--cw-radius-md);
		background: var(--cw-tone-secondary-solid-bg);
		color: var(--cw-tone-secondary-solid-text);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		white-space: nowrap;
		pointer-events: none;
		box-shadow: var(--cw-elevation-popover);
	}

	.cw-sidenav__header {
		height: 5rem;
		padding: 0;
		flex-shrink: 0;
		background-color: var(--cw-header-bg);
		color: var(--cw-header-fg);
	}

	.cw-sidenav__header--mini {
		height: 5rem;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--cw-header-bg);
		color: var(--cw-header-fg);
		border-bottom: 2px solid var(--cw-border-muted);
	}

	.cw-sidenav__header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 2px solid var(--cw-border-muted);
		width: 100%;
		height: 100%;
		padding: 0 var(--cw-space-4);
	}

	.cw-sidenav__header-content {
		display: flex;
		align-items: center;
		min-width: 0;
		flex: 1;
	}

	.cw-sidenav__toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		color: var(--cw-header-fg);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-sidenav__toggle:hover {
		background-color: color-mix(in srgb, var(--cw-header-fg) 20%, transparent);
		color: var(--cw-header-fg);
	}

	.cw-sidenav__toggle:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: calc(-1 * var(--cw-focus-ring-width));
	}

	.cw-sidenav__toggle--plain {
		color: var(--cw-sidenav-item-text);
	}

	.cw-sidenav__toggle--plain:hover {
		background-color: var(--cw-sidenav-item-hover-bg);
		color: var(--cw-sidenav-item-text-hover);
	}

	.cw-sidenav__toggle svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-sidenav__toggle--mini {
		width: 2.75rem;
		height: 2.75rem;
	}

	.cw-sidenav__toggle--mini svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	.cw-sidenav__above-content {
		padding: var(--cw-space-2) var(--cw-space-3) var(--cw-space-2);
		border-bottom: 1px solid color-mix(in srgb, var(--cw-border-muted) 65%, transparent);
	}

	.cw-sidenav__items {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		padding: var(--cw-space-2);
	}

	.cw-sidenav__group-label {
		padding: var(--cw-space-2) var(--cw-space-2) var(--cw-space-1);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-bold);
		text-transform: uppercase;
		letter-spacing: 0.075em;
		color: var(--cw-sidenav-group-text);
		user-select: none;
	}

	.cw-sidenav__item-row {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		border-radius: var(--cw-radius-md);
		color: var(--cw-sidenav-item-text);
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-sidenav__item-row:hover:not(.cw-sidenav__item-row--disabled) {
		background-color: var(--cw-sidenav-item-hover-bg);
		color: var(--cw-sidenav-item-text-hover);
	}

	.cw-sidenav__item-row--active {
		background-color: var(--cw-sidenav-item-active-bg);
		color: var(--cw-sidenav-item-active-text);
	}

	/* Leading bar so the active item isn't signalled by colour alone. */
	.cw-sidenav__item-row--active::before {
		content: '';
		position: absolute;
		inset-block: var(--cw-space-2);
		inset-inline-start: 0;
		width: 3px;
		border-radius: var(--cw-radius-full);
		background: var(--cw-accent);
	}

	.cw-sidenav__item-row--active:hover {
		background-color: var(--cw-sidenav-item-active-bg-hover);
	}

	.cw-sidenav__item-row--disabled {
		color: var(--cw-text-disabled);
	}

	.cw-sidenav__item {
		display: inline-flex;
		align-items: center;
		gap: var(--cw-space-3);
		flex: 1;
		min-width: 0;
		padding: var(--cw-space-2) var(--cw-space-2);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: inherit;
		background: none;
		border: none;
		cursor: pointer;
		text-align: left;
		text-decoration: none;
		white-space: nowrap;
	}

	.cw-sidenav__item[aria-disabled='true'] {
		pointer-events: none;
	}

	.cw-sidenav__item:disabled {
		cursor: not-allowed;
	}

	.cw-sidenav__item:focus-visible {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: calc(-1 * var(--cw-focus-ring-width));
		border-radius: var(--cw-radius-md);
	}

	.cw-sidenav__icon {
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
	}

	.cw-sidenav__icon--asset {
		object-fit: contain;
	}

	.cw-sidenav__label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.cw-sidenav__trailing {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: var(--cw-space-2);
		flex-shrink: 0;
	}

	.cw-sidenav__trailing-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.35rem;
		height: 1.35rem;
		padding: 0 var(--cw-space-2);
		border-radius: var(--cw-radius-full);
		border: 1px solid var(--cw-sidenav-trailing-border);
		background: var(--cw-sidenav-trailing-bg);
		color: var(--cw-sidenav-trailing-text);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		line-height: 1;
	}

	.cw-sidenav__item-row--active .cw-sidenav__trailing-pill {
		border-color: var(--cw-sidenav-trailing-active-border);
		background: var(--cw-sidenav-trailing-active-bg);
	}

	.cw-sidenav--mini .cw-sidenav__item-row {
		justify-content: center;
	}

	.cw-sidenav--mini .cw-sidenav__item {
		justify-content: center;
		padding: var(--cw-space-2);
	}

	.cw-sidenav__footer {
		flex-shrink: 0;
		padding: var(--cw-space-3) var(--cw-space-4);
		border-top: 1px solid color-mix(in srgb, var(--cw-border-muted) 65%, transparent);
		margin-top: auto;
	}

	.cw-sidenav__footer--mini {
		padding: var(--cw-space-2);
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (min-width: 1024px) {
		.cw-sidenav__item {
			font-size: var(--cw-text-base);
		}

		.cw-sidenav__icon {
			width: 1.25rem;
			height: 1.25rem;
		}
	}
</style>
