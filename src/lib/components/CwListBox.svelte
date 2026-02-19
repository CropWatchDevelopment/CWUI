<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { CwListBoxItem } from '../types/index.js';
	import CwChip from './CwChip.svelte';

	interface Props {
		/** List items to display */
		items: CwListBoxItem<T>[];
		/** Currently selected value(s). Bind for reactive selection. */
		value?: T | null;
		/** Optional heading rendered above the list */
		heading?: string;
		/** Callback when an item is selected */
		onselect?: (item: CwListBoxItem<T>) => void;
		/** Optional snippet to render a custom icon/badge on the left side */
		itemIcon?: Snippet<[CwListBoxItem<T>]>;
		/** Optional snippet to render custom content on the right side */
		itemEnd?: Snippet<[CwListBoxItem<T>]>;
		class?: string;
	}

	let {
		items,
		value = $bindable<T | null>(null),
		heading,
		onselect,
		itemIcon,
		itemEnd,
		class: className = ''
	}: Props = $props();

	function select(item: CwListBoxItem<T>) {
		if (item.disabled) return;
		value = item.value;
		onselect?.(item);
	}

	function handleKeydown(e: KeyboardEvent, item: CwListBoxItem<T>) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			select(item);
		}
	}
</script>

<div class="cw-listbox {className}" role="listbox" aria-label={heading ?? 'List'}>
	{#if heading}
		<div class="cw-listbox__heading">{heading}</div>
	{/if}

	{#each items as item (item.value)}
		<button
			type="button"
			class="cw-listbox__item"
			class:cw-listbox__item--active={value === item.value}
			class:cw-listbox__item--disabled={item.disabled}
			role="option"
			aria-selected={value === item.value}
			disabled={item.disabled}
			onclick={() => select(item)}
			onkeydown={(e) => handleKeydown(e, item)}
		>
			<!-- Left side: icon/badge -->
			<span class="cw-listbox__item-start">
				{#if itemIcon}
					{@render itemIcon(item)}
				{:else if item.badge}
					<CwChip
						label={item.badge}
						tone={item.badgeTone ?? 'secondary'}
						variant="solid"
						size="sm"
					/>
				{/if}
			</span>

			<!-- Label -->
			<span class="cw-listbox__label">{item.label}</span>

			<!-- Right side: endText or custom snippet -->
			<span class="cw-listbox__item-end">
				{#if itemEnd}
					{@render itemEnd(item)}
				{:else if item.endText}
					<span class="cw-listbox__count">{item.endText}</span>
				{/if}
			</span>
		</button>
	{/each}
</div>

<style>
	.cw-listbox {
		display: flex;
		flex-direction: column;
		gap: 1px;
		font-family: var(--cw-font-family);
	}

	.cw-listbox__heading {
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.cw-listbox__item {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
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
		transition:
			background-color var(--cw-duration-fast) var(--cw-ease-default),
			color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-listbox__item:hover:not(:disabled) {
		background-color: var(--cw-bg-muted);
		color: var(--cw-text-primary);
	}

	.cw-listbox__item--active {
		background-color: color-mix(in srgb, var(--cw-accent) 12%, transparent);
		color: var(--cw-text-primary);
	}

	.cw-listbox__item--active:hover {
		background-color: color-mix(in srgb, var(--cw-accent) 18%, transparent);
	}

	.cw-listbox__item--disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
	}

	.cw-listbox__item:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px
			color-mix(in srgb, var(--cw-focus-ring-color) 40%, transparent);
	}

	/* ── Badge (left) ────────────────────── */
	.cw-listbox__item-start {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
	}

	/* ── Label ────────────────────────────── */
	.cw-listbox__label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* ── End (right) ─────────────────────── */
	.cw-listbox__item-end {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		margin-left: auto;
	}

	.cw-listbox__count {
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-muted);
		font-variant-numeric: tabular-nums;
		min-width: 1.5rem;
		text-align: right;
	}

	.cw-listbox__item--active .cw-listbox__count {
		color: var(--cw-text-secondary);
	}
</style>
