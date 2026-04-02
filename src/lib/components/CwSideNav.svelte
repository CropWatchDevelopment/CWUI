<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		CwSideNavIcon,
		CwSideNavItem,
		CwSideNavMode,
		CwSideNavSide,
		CwViewSize
	} from '../types/index.js';
	import CwSeparator from './CwSeparator.svelte';
	import { getCwViewSize } from '../utils/cwViewSize.js';

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
		class: className = ''
	}: Props = $props();

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
	/** Temporary expansion state when hovering mini mode */
	let hoverExpanded = $state(false);
	/** Internal active fallback when items are not externally controlled */
	let selectedItemId = $state<string | undefined>(undefined);

	const hasExplicitActiveItem = $derived.by(() =>
		items.some((item) => item.active === true)
	);

	const displayMode = $derived.by<CwSideNavMode>(() =>
		mode === 'mini' && hoverExpanded ? 'open' : mode
	);

	/** Detect viewport width for phone detection (always) */
	$effect(() => {
		if (typeof window === 'undefined') return;
		const check = () => { isPhone = getCwViewSize(window.innerWidth) === 'phone'; };
		check();
		window.addEventListener('resize', check);
		return () => window.removeEventListener('resize', check);
	});

	/** Detect viewport and set mode when responsive is enabled */
	$effect(() => {
		if (!responsive || typeof window === 'undefined') return;

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

	/** Toggle the sidenav: close on phone, open/mini on tablet+ */
	function toggleNav() {
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
	}

	function handleAnchorClick(event: MouseEvent, item: CwSideNavItem) {
		if (item.disabled) {
			event.preventDefault();
			return;
		}
		selectedItemId = item.id;
		onselect?.(item);
	}

	function handleNavMouseEnter() {
		if (mode === 'mini') {
			hoverExpanded = true;
		}
	}

	function handleNavMouseLeave() {
		hoverExpanded = false;
	}

	$effect(() => {
		if (mode !== 'mini' && hoverExpanded) {
			hoverExpanded = false;
		}
	});

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

<!-- svelte-ignore a11y_no_static_element_interactions -->
<nav
	class="cw-sidenav {className}"
	class:cw-sidenav--open={displayMode === 'open'}
	class:cw-sidenav--mini={displayMode === 'mini'}
	class:cw-sidenav--hidden={displayMode === 'hidden'}
	class:cw-sidenav--right={side === 'right'}
	onmouseenter={handleNavMouseEnter}
	onmouseleave={handleNavMouseLeave}
	aria-label="Side navigation"
>
	<!-- Header / Logo -->
	{#if displayMode === 'open' && header}
		<div class="cw-sidenav__header">
			<div class="cw-sidenav__header-row">
				<div class="cw-sidenav__header-content">
					{@render header()}
				</div>
				<button
					class="cw-sidenav__toggle"
					type="button"
					onclick={toggleNav}
					aria-label={isPhone ? 'Close navigation' : 'Collapse navigation'}
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
	{:else if displayMode === 'mini'}
		<div class="cw-sidenav__header cw-sidenav__header--mini">
			<button
				class="cw-sidenav__toggle cw-sidenav__toggle--mini"
				type="button"
				onclick={toggleNav}
				aria-label="Expand navigation"
			>
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			</button>
		</div>
	{/if}

	{#if aboveContent && displayMode !== 'mini'}
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

			{#if showGroup && displayMode === 'open'}
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
						title={displayMode === 'mini' ? itemLabel : undefined}
						onclick={(event) => handleAnchorClick(event, item)}
					>
						{#if itemIcon.kind === 'path'}
							<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d={itemIcon.value} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							<img class="cw-sidenav__icon cw-sidenav__icon--asset" src={itemIcon.value} alt="" aria-hidden="true" />
						{/if}
						{#if displayMode === 'open'}
							<span class="cw-sidenav__label">{itemLabel}</span>
						{/if}
					</a>
				{:else}
					<button
						type="button"
						class="cw-sidenav__item"
						title={displayMode === 'mini' ? itemLabel : undefined}
						disabled={item.disabled}
						onclick={() => handleItemClick(item)}
					>
						{#if itemIcon.kind === 'path'}
							<svg class="cw-sidenav__icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d={itemIcon.value} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{:else}
							<img class="cw-sidenav__icon cw-sidenav__icon--asset" src={itemIcon.value} alt="" aria-hidden="true" />
						{/if}
						{#if displayMode === 'open'}
							<span class="cw-sidenav__label">{itemLabel}</span>
						{/if}
					</button>
				{/if}

				{#if displayMode === 'open' && hasTrailing}
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
	{#if displayMode === 'open' && footer}
		<div class="cw-sidenav__footer">
			{@render footer()}
		</div>
	{:else if displayMode === 'mini'}
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
	.cw-sidenav {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--cw-sidenav-bg);
		border-color: var(--cw-border-muted);
		border-style: solid;
		border-width: 0;
		font-family: var(--cw-font-family);
		color: var(--cw-sidenav-item-text);
		overflow: hidden;
		transition:
			width var(--cw-duration-slow) var(--cw-ease-default),
			transform var(--cw-duration-slow) var(--cw-ease-default);
	}

	.cw-sidenav:not(.cw-sidenav--right) {
		border-right-width: 1px;
	}

	.cw-sidenav--right {
		border-left-width: 1px;
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
	}

	.cw-sidenav__header {
		padding: var(--cw-space-4);
		flex-shrink: 0;
	}

	.cw-sidenav__header--mini {
		height: 5rem;
		padding: var(--cw-space-3);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cw-sidenav__header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.cw-sidenav__header-content {
		height: 3rem;
		min-width: 0;
		flex: 1;
	}

	.cw-sidenav__toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		background: none;
		border: none;
		border-radius: var(--cw-radius-md);
		color: var(--cw-text-muted);
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-sidenav__toggle:hover {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-sidenav__toggle:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
	}

	.cw-sidenav__toggle svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-sidenav__toggle--mini {
		width: 2rem;
		height: 2rem;
	}

	.cw-sidenav__toggle--mini svg {
		width: 1.125rem;
		height: 1.125rem;
	}

	.cw-sidenav__above-content {
		padding: 0 var(--cw-space-3) var(--cw-space-2);
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
		font-size: 0.625rem;
		font-weight: var(--cw-font-bold);
		text-transform: uppercase;
		letter-spacing: 0.075em;
		color: var(--cw-sidenav-group-text);
		user-select: none;
	}

	.cw-sidenav__item-row {
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
		outline: none;
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
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
		font-size: 0.6875rem;
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
