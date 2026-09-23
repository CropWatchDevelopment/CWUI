<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { CwListBoxItem } from '../types/index.js';
	import CwChip from './CwChip.svelte';

	interface Props {
		/** List items to display */
		items: CwListBoxItem<T>[];
		/** Currently selected value(s). Bind for reactive selection. */
		value?: T | null;
		/** Optional heading rendered above the list (also labels the listbox). */
		heading?: string;
		/** Accessible name used when no `heading` is shown. */
		ariaLabel?: string;
		/** Text shown when `items` is empty. */
		emptyText?: string;
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
		ariaLabel = 'Options',
		emptyText = 'No items',
		onselect,
		itemIcon,
		itemEnd,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let listRef = $state<HTMLDivElement | null>(null);
	/** Index of the item that currently owns tabindex=0 (roving tabindex). */
	let focusIndex = $state(-1);

	const tabStop = $derived.by(() => {
		if (focusIndex >= 0 && focusIndex < items.length && !items[focusIndex]?.disabled) return focusIndex;
		const selected = items.findIndex((item) => item.value === value && !item.disabled);
		return selected >= 0 ? selected : items.findIndex((item) => !item.disabled);
	});

	function select(item: CwListBoxItem<T>) {
		if (item.disabled) return;
		value = item.value;
		onselect?.(item);
	}

	function focusItem(index: number) {
		focusIndex = index;
		listRef?.querySelectorAll<HTMLButtonElement>('[role="option"]')[index]?.focus();
	}

	function nextEnabled(start: number, step: 1 | -1) {
		for (let i = start; i >= 0 && i < items.length; i += step) {
			if (!items[i].disabled) return i;
		}
		return -1;
	}

	function handleKeydown(event: KeyboardEvent, index: number) {
		let target = -1;
		switch (event.key) {
			case 'ArrowDown':
				target = nextEnabled(index + 1, 1);
				break;
			case 'ArrowUp':
				target = nextEnabled(index - 1, -1);
				break;
			case 'Home':
				target = nextEnabled(0, 1);
				break;
			case 'End':
				target = nextEnabled(items.length - 1, -1);
				break;
			default:
				return;
		}
		event.preventDefault();
		if (target >= 0) focusItem(target);
	}
</script>

<div class="cw-listbox {className}">
	{#if heading}
		<div class="cw-listbox__heading" id="{uid}-heading">{heading}</div>
	{/if}

	<div
		bind:this={listRef}
		class="cw-listbox__list"
		role="listbox"
		aria-labelledby={heading ? `${uid}-heading` : undefined}
		aria-label={heading ? undefined : ariaLabel}
	>
		{#each items as item, index (item.value)}
			<button
				type="button"
				class="cw-listbox__item"
				class:cw-listbox__item--active={value === item.value}
				class:cw-listbox__item--disabled={item.disabled}
				role="option"
				aria-selected={value === item.value}
				disabled={item.disabled}
				tabindex={index === tabStop ? 0 : -1}
				onclick={() => select(item)}
				onfocus={() => (focusIndex = index)}
				onkeydown={(event) => handleKeydown(event, index)}
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
	{#if items.length === 0}
		<p class="cw-listbox__empty">{emptyText}</p>
	{/if}
</div>

<style>
	.cw-listbox {
		display: flex;
		flex-direction: column;
		font-family: var(--cw-font-family);
	}

	.cw-listbox__list {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.cw-listbox__heading {
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-secondary);
	}

	.cw-listbox__empty {
		margin: 0;
		padding: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		text-align: center;
	}

	.cw-listbox__item {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		width: 100%;
		min-height: var(--cw-option-min-h);
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
		background-color: var(--cw-option-hover-bg);
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
		outline-offset: calc(var(--cw-focus-ring-width) * -1);
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
