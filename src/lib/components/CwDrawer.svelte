<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { CwDrawerItem } from '../types/index.js';
	import CwSeparator from './CwSeparator.svelte';

	interface Props {
		/** Whether the drawer is expanded */
		open?: boolean;
		/** Height of the expanded panel (CSS value) */
		height?: string;
		/** Items shown in the collapsed bar */
		items?: CwDrawerItem[];
		/** Label shown in the collapsed header bar (left side) */
		label?: string;
		/** SVG path data for the header icon (16×16 viewBox) */
		icon?: string;
		/** Content rendered inside the expanded panel */
		children?: Snippet;
		/** Custom snippet rendered in the collapsed bar instead of the default items row */
		collapsed?: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		height = '20rem',
		items = [],
		label = '',
		icon,
		children,
		collapsed,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();

	/** Keeps panel content mounted while the close animation runs. */
	let contentMounted = $state(false);

	$effect(() => {
		if (open) contentMounted = true;
	});

	function toggle() {
		open = !open;
	}

	function handlePanelTransitionEnd(e: TransitionEvent) {
		if (e.target === e.currentTarget && e.propertyName === 'height' && !open) {
			contentMounted = false;
		}
	}

	const panelHeight = $derived(open ? `min(${height}, 60dvh)` : '0');

	/** Default icon – three horizontal lines (hamburger) */
	const defaultIcon = 'M3 4h10M3 8h10M3 12h10';
</script>

<div class={['cw-drawer', open && 'cw-drawer--open', className]}>
	<!-- Collapsed header bar — always visible. The toggle button's hit area is
	     stretched across the whole bar; the collapsed summary sits beside it
	     (not inside it) so custom snippets may contain their own controls. -->
	<div class="cw-drawer__header">
		<button
			type="button"
			class="cw-drawer__toggle"
			onclick={toggle}
			aria-expanded={open}
			aria-controls="{uid}-panel"
		>
			<svg class="cw-drawer__header-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path
					d={icon ?? defaultIcon}
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			{#if label}
				<span class="cw-drawer__header-label">{label}</span>
			{/if}
		</button>

		<!-- Collapsed items row (only when closed) -->
		{#if !open && (collapsed || items.length > 0)}
			<div class="cw-drawer__items">
				{#if collapsed}
					{@render collapsed()}
				{:else}
					{#each items as item (item.id)}
						<span class="cw-drawer__item">
							{#if item.icon}
								<svg
									class="cw-drawer__item-icon"
									viewBox="0 0 16 16"
									fill="none"
									aria-hidden="true"
								>
									<path
										d={item.icon}
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
							{#if item.tone}
								<span class="cw-drawer__item-dot cw-drawer__item-dot--{item.tone}"></span>
							{/if}
							<span class="cw-drawer__item-label">{item.label}</span>
						</span>
					{/each}
				{/if}
			</div>
		{/if}

		<svg
			class={['cw-drawer__chevron', open && 'cw-drawer__chevron--open']}
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path
				d="M4 10l4-4 4 4"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</div>

	<!-- Expanded panel -->
	<div
		id="{uid}-panel"
		class="cw-drawer__panel"
		style:height={panelHeight}
		inert={!open}
		ontransitionend={handlePanelTransitionEnd}
	>
		{#if open || contentMounted}
			<CwSeparator spacing="0" />
			<div class="cw-drawer__content">
				{#if children}
					{@render children()}
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	/* ── Container ────────────────────────── */
	.cw-drawer {
		display: flex;
		flex-direction: column;
		background-color: var(--cw-drawer-bg, var(--cw-bg-surface));
		border-top: 1px solid var(--cw-border-muted);
		font-family: var(--cw-font-family);
		flex-shrink: 0;
	}

	/* ── Header bar (always visible) ─────── */
	.cw-drawer__header {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		width: 100%;
		min-height: 2.75rem;
		padding: var(--cw-space-2) var(--cw-space-4);
		background-color: var(--cw-drawer-header-bg, color-mix(in srgb, var(--cw-bg-surface-elevated) 62%, var(--cw-bg-surface)));
		border: none;
		border-bottom: 1px solid var(--cw-drawer-header-border, var(--cw-border-muted));
		color: var(--cw-text-primary);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-drawer__header:hover {
		background-color: var(--cw-drawer-header-bg-hover, color-mix(in srgb, var(--cw-bg-surface-elevated) 76%, var(--cw-bg-surface)));
	}

	.cw-drawer__toggle {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		flex-shrink: 0;
		min-height: var(--cw-hit-target-min);
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}

	/* Stretch the toggle's hit area across the whole header bar. */
	.cw-drawer__toggle::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.cw-drawer__toggle:focus-visible {
		outline: none;
	}

	.cw-drawer__toggle:focus-visible::after {
		outline: var(--cw-focus-ring-width) solid var(--cw-focus-ring-color);
		outline-offset: calc(-1 * var(--cw-focus-ring-width));
	}

	.cw-drawer__header-icon {
		width: 1rem;
		height: 1rem;
		color: var(--cw-text-muted);
		flex-shrink: 0;
	}

	.cw-drawer__header-label {
		font-weight: var(--cw-font-semibold);
		white-space: nowrap;
	}

	/* ── Collapsed items row ─────────────── */
	.cw-drawer__items {
		position: relative;
		z-index: 1;
		/* Clicks on the summary fall through to the stretched toggle, while
		   interactive content inside a custom snippet stays usable. */
		pointer-events: none;
		display: flex;
		align-items: center;
		gap: var(--cw-space-4);
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		padding: 0 var(--cw-space-2);
	}

	.cw-drawer__items :global(:is(a, button, input, select, textarea, label, [tabindex])) {
		pointer-events: auto;
	}

	.cw-drawer__item {
		display: flex;
		align-items: center;
		gap: var(--cw-space-1);
		white-space: nowrap;
		color: var(--cw-text-secondary);
		font-size: var(--cw-text-sm);
	}

	.cw-drawer__item-icon {
		width: 0.875rem;
		height: 0.875rem;
		flex-shrink: 0;
	}

	.cw-drawer__item-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: var(--cw-radius-full);
		flex-shrink: 0;
	}

	.cw-drawer__item-dot--primary { background-color: var(--cw-tone-primary-solid-bg); }
	.cw-drawer__item-dot--secondary { background-color: var(--cw-tone-secondary-solid-bg); }
	.cw-drawer__item-dot--info { background-color: var(--cw-tone-info-solid-bg); }
	.cw-drawer__item-dot--warning { background-color: var(--cw-tone-warning-solid-bg); }
	.cw-drawer__item-dot--danger { background-color: var(--cw-tone-danger-solid-bg); }
	.cw-drawer__item-dot--success { background-color: var(--cw-tone-success-solid-bg); }

	.cw-drawer__item-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Chevron toggle ──────────────────── */
	.cw-drawer__chevron {
		width: 1rem;
		height: 1rem;
		color: var(--cw-text-muted);
		flex-shrink: 0;
		margin-left: auto;
		pointer-events: none;
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-drawer__chevron--open {
		transform: rotate(180deg);
	}

	.cw-drawer:not(.cw-drawer--open) .cw-drawer__header {
		padding-bottom: calc(var(--cw-space-2) + env(safe-area-inset-bottom, 0px));
	}

	/* ── Expanded panel ──────────────────── */
	.cw-drawer__panel {
		overflow: hidden;
		background-color: var(--cw-drawer-panel-bg, color-mix(in srgb, var(--cw-bg-muted) 40%, var(--cw-bg-surface)));
		transition: height var(--cw-duration-slow) var(--cw-ease-default);
	}

	.cw-drawer__content {
		padding: var(--cw-space-4);
		padding-bottom: calc(var(--cw-space-4) + env(safe-area-inset-bottom, 0px));
		overflow-y: auto;
		height: 100%;
	}
</style>
