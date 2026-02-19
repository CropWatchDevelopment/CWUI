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

	function toggle() {
		open = !open;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle();
		}
	}

	/** Default icon – three horizontal lines (hamburger) */
	const defaultIcon = 'M3 4h10M3 8h10M3 12h10';
</script>

<div
	class="cw-drawer {className}"
	class:cw-drawer--open={open}
>
	<!-- Collapsed header bar — always visible -->
	<button
		type="button"
		class="cw-drawer__header"
		onclick={toggle}
		onkeydown={handleKeydown}
		aria-expanded={open}
	>
		<div class="cw-drawer__header-left">
			<svg class="cw-drawer__header-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d={icon ?? defaultIcon} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			{#if label}
				<span class="cw-drawer__header-label">{label}</span>
			{/if}
		</div>

		<!-- Collapsed items row (only when closed) -->
		{#if !open && (collapsed || items.length > 0)}
			<div class="cw-drawer__items">
				{#if collapsed}
					{@render collapsed()}
				{:else}
					{#each items as item (item.id)}
						<span class="cw-drawer__item" class:cw-drawer__item--has-tone={!!item.tone}>
							{#if item.icon}
								<svg class="cw-drawer__item-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d={item.icon} stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
			class="cw-drawer__chevron"
			class:cw-drawer__chevron--open={open}
			viewBox="0 0 16 16"
			fill="none"
			aria-hidden="true"
		>
			<path d="M4 10l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>

	<!-- Expanded panel -->
	<div
		class="cw-drawer__panel"
		style:height={open ? height : '0'}
	>
		{#if open}
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
		background-color: var(--cw-bg-surface);
		border-top: 1px solid var(--cw-border-muted);
		font-family: var(--cw-font-family);
		flex-shrink: 0;
	}

	/* ── Header bar (always visible) ─────── */
	.cw-drawer__header {
		display: flex;
		align-items: center;
		gap: var(--cw-space-3);
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-4);
		background: none;
		border: none;
		color: var(--cw-text-primary);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-drawer__header:hover {
		background-color: var(--cw-bg-muted);
	}

	.cw-drawer__header:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
	}

	.cw-drawer__header-left {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		flex-shrink: 0;
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
		display: flex;
		align-items: center;
		gap: var(--cw-space-4);
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		padding: 0 var(--cw-space-2);
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

	.cw-drawer__item-dot--primary { background-color: var(--cw-primary-500); }
	.cw-drawer__item-dot--secondary { background-color: var(--cw-gray-400); }
	.cw-drawer__item-dot--info { background-color: var(--cw-info-500); }
	.cw-drawer__item-dot--warning { background-color: var(--cw-warning-500); }
	.cw-drawer__item-dot--danger { background-color: var(--cw-danger-500); }
	.cw-drawer__item-dot--success { background-color: var(--cw-success-500); }

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
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-drawer__chevron--open {
		transform: rotate(180deg);
	}

	/* ── Expanded panel ──────────────────── */
	.cw-drawer__panel {
		overflow: hidden;
		transition: height var(--cw-duration-slow) var(--cw-ease-default);
	}

	.cw-drawer__content {
		padding: var(--cw-space-4);
		overflow-y: auto;
		height: 100%;
	}
</style>
