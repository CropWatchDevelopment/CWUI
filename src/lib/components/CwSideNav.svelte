<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwSideNavItem, CwSideNavMode, CwSideNavSide } from '../types/index.js';
	import CwSeparator from './CwSeparator.svelte';

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
		/** Snippet for the bottom area (e.g. a button, version text, user info) */
		footer?: Snippet;
		/** Compact footer for mini mode */
		footerMini?: Snippet;
	}

	let {
		items,
		mode = $bindable<CwSideNavMode>('open'),
		side = 'left',
		responsive = false,
		onselect,
		header,
		headerMini,
		footer,
		footerMini
	}: Props = $props();

	/** Track whether user has manually overridden the mode */
	let userOverride = $state(false);

	/** Detect viewport and set mode when responsive is enabled */
	$effect(() => {
		if (!responsive || typeof window === 'undefined') return;

		function applyResponsive() {
			if (userOverride) return;
			const w = window.innerWidth;
			if (w >= 1024) {
				mode = 'open';
			} else if (w >= 640) {
				mode = 'mini';
			} else {
				mode = 'hidden';
			}
		}

		// Set initial mode
		applyResponsive();

		function handleResize() {
			// Reset user override on resize so it re-adapts
			userOverride = false;
			applyResponsive();
		}

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function handleItemClick(item: CwSideNavItem) {
		if (item.disabled) return;
		onselect?.(item);
	}

	function handleItemKeydown(e: KeyboardEvent, item: CwSideNavItem) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleItemClick(item);
		}
	}

	/** Default placeholder icon (circle) when none is provided */
	const defaultIcon = 'M8 2a6 6 0 1 0 0 12A6 6 0 0 0 8 2';
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<nav
	class="cw-sidenav"
	class:cw-sidenav--open={mode === 'open'}
	class:cw-sidenav--mini={mode === 'mini'}
	class:cw-sidenav--hidden={mode === 'hidden'}
	class:cw-sidenav--right={side === 'right'}
	aria-label="Side navigation"
>
	<!-- Header / Logo -->
	{#if mode === 'open' && header}
		<div class="cw-sidenav__header">
			{@render header()}
		</div>
	{:else if mode === 'mini'}
		<div class="cw-sidenav__header cw-sidenav__header--mini">
			{#if headerMini}
				{@render headerMini()}
			{:else if header}
				{@render header()}
			{/if}
		</div>
	{/if}

	<!-- Navigation items -->
	<div class="cw-sidenav__items" role="list">
		{#each items as item (item.id)}
			{#if item.separator}
				<CwSeparator />
			{/if}

			{#if item.href}
				<a
					class="cw-sidenav__item"
					class:cw-sidenav__item--active={item.active}
					class:cw-sidenav__item--disabled={item.disabled}
					href={item.href}
					role="listitem"
					aria-current={item.active ? 'page' : undefined}
					title={mode === 'mini' ? item.label : undefined}
					onclick={() => handleItemClick(item)}
				>
					<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d={item.icon ?? defaultIcon} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					{#if mode === 'open'}
						<span class="cw-sidenav__label">{item.label}</span>
					{/if}
				</a>
			{:else}
				<button
					type="button"
					class="cw-sidenav__item"
					class:cw-sidenav__item--active={item.active}
					class:cw-sidenav__item--disabled={item.disabled}
					role="listitem"
					aria-current={item.active ? 'page' : undefined}
					title={mode === 'mini' ? item.label : undefined}
					disabled={item.disabled}
					onclick={() => handleItemClick(item)}
					onkeydown={(e) => handleItemKeydown(e, item)}
				>
					<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path d={item.icon ?? defaultIcon} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
					{#if mode === 'open'}
						<span class="cw-sidenav__label">{item.label}</span>
					{/if}
				</button>
			{/if}
		{/each}
	</div>

	<!-- Footer -->
	{#if mode === 'open' && footer}
		<div class="cw-sidenav__footer">
			{@render footer()}
		</div>
	{:else if mode === 'mini'}
		<div class="cw-sidenav__footer cw-sidenav__footer--mini">
			{#if footerMini}
				{@render footerMini()}
			{:else if footer}
				{@render footer()}
			{/if}
		</div>
	{/if}
</nav>

<style>
	/* ── Container ────────────────────────── */
	.cw-sidenav {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--cw-bg-surface);
		border-color: var(--cw-border-muted);
		border-style: solid;
		border-width: 0;
		font-family: var(--cw-font-family);
		overflow: hidden;
		transition:
			width var(--cw-duration-slow) var(--cw-ease-default),
			transform var(--cw-duration-slow) var(--cw-ease-default);
	}

	/* Side: left (default) gets right border */
	.cw-sidenav:not(.cw-sidenav--right) {
		border-right-width: 1px;
	}

	/* Side: right gets left border */
	.cw-sidenav--right {
		border-left-width: 1px;
	}

	/* ── Mode: open ──────────────────────── */
	.cw-sidenav--open {
		width: 14rem;
		flex-shrink: 0;
	}

	/* ── Mode: mini ──────────────────────── */
	.cw-sidenav--mini {
		width: 3.5rem;
		flex-shrink: 0;
	}

	/* ── Mode: hidden ────────────────────── */
	.cw-sidenav--hidden {
		width: 0;
		border-width: 0;
		overflow: hidden;
	}

	/* ── Header ───────────────────────────── */
	.cw-sidenav__header {
		padding: var(--cw-space-4);
		flex-shrink: 0;
	}

	.cw-sidenav__header--mini {
		padding: var(--cw-space-3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* ── Items list ───────────────────────── */
	.cw-sidenav__items {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: var(--cw-space-1);
	}

	/* ── Individual item ──────────────────── */
	.cw-sidenav__item {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-secondary);
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		text-align: left;
		text-decoration: none;
		white-space: nowrap;
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	/* Mini mode: center the icon */
	.cw-sidenav--mini .cw-sidenav__item {
		justify-content: center;
		padding: var(--cw-space-2);
	}

	.cw-sidenav__item:hover:not(.cw-sidenav__item--disabled) {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-sidenav__item--active {
		background-color: color-mix(in srgb, var(--cw-accent) 12%, transparent);
		color: var(--cw-accent-text);
	}

	.cw-sidenav__item--active:hover {
		background-color: color-mix(in srgb, var(--cw-accent) 18%, transparent);
	}

	.cw-sidenav__item--disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
	}

	.cw-sidenav__item:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px
			color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
	}

	/* ── Icon ─────────────────────────────── */
	.cw-sidenav__icon {
		width: 1.125rem;
		height: 1.125rem;
		flex-shrink: 0;
	}

	/* ── Label ────────────────────────────── */
	.cw-sidenav__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Footer ───────────────────────────── */
	.cw-sidenav__footer {
		flex-shrink: 0;
		padding: var(--cw-space-3) var(--cw-space-4);
		border-top: 1px solid var(--cw-border-muted);
		margin-top: auto;
	}

	.cw-sidenav__footer--mini {
		padding: var(--cw-space-2);
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
