<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import CwInput from './CwInput.svelte';
	import CwSpinner from './CwSpinner.svelte';

	interface Props {
		value?: string;
		name?: string;
		required?: boolean;
		minChars?: number;
		debounceMs?: number;
		fetchSuggestions?: (query: string, signal: AbortSignal) => Promise<unknown[]>;
		mapSuggestionToLabel?: (item: unknown) => string;
		mapSuggestionToValue?: (item: unknown) => string;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		label?: string;
		clearable?: boolean;
		disabled?: boolean;
		oninput?: (value: string) => void;
		onselect?: (value: string, item: unknown) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		name,
		required = false,
		minChars = 3,
		debounceMs = 250,
		fetchSuggestions,
		mapSuggestionToLabel = (item: unknown) => String(item),
		mapSuggestionToValue = (item: unknown) => String(item),
		placeholder = 'Search...',
		autocomplete = 'off',
		label,
		clearable = true,
		disabled = false,
		oninput,
		onselect,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	let query = $state(value);
	let suggestions = $state<unknown[]>([]);
	let loading = $state(false);
	let open = $state(false);
	let activeIndex = $state(-1);

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function clearPendingSuggestions() {
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	}

	function resetSuggestions() {
		suggestions = [];
		open = false;
		loading = false;
		activeIndex = -1;
	}

	function handleInput() {
		value = query;
		oninput?.(query);
		activeIndex = -1;

		if (!fetchSuggestions) {
			resetSuggestions();
			return;
		}

		clearPendingSuggestions();

		if (query.length < minChars) {
			resetSuggestions();
			return;
		}

		const pendingQuery = query;
		loading = true;
		debounceTimer = setTimeout(async () => {
			abortController = new AbortController();
			try {
				const results = await fetchSuggestions(pendingQuery, abortController.signal);
				if (pendingQuery !== query) return;
				suggestions = results;
				open = results.length > 0;
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				suggestions = [];
				open = false;
			} finally {
				if (pendingQuery === query) {
					loading = false;
				}
			}
		}, debounceMs);
	}

	function selectItem(item: unknown) {
		const nextLabel = mapSuggestionToLabel(item);
		const nextValue = mapSuggestionToValue(item);
		query = nextLabel;
		value = nextValue;
		open = false;
		suggestions = [];
		activeIndex = -1;
		onselect?.(nextValue, item);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = Math.min(activeIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = Math.max(activeIndex - 1, 0);
				break;
			case 'Enter':
				e.preventDefault();
				if (activeIndex >= 0) {
					selectItem(suggestions[activeIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				break;
		}
	}

	function handleBlur() {
		setTimeout(() => {
			open = false;
		}, 150);
	}

	onDestroy(() => {
		clearPendingSuggestions();
	});

</script>

<div class="cw-search-input {className}">
	<CwInput
		type="text"
		bind:value={query}
		{name}
		{required}
		{label}
		{disabled}
		{placeholder}
		{autocomplete}
		{clearable}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	>
		{#snippet leftSlot()}
			{#if loading}
				<CwSpinner size="md" />
			{:else}
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
					<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			{/if}
		{/snippet}
	</CwInput>

	{#if open && suggestions.length > 0}
		<ul id="{uid}-listbox" class="cw-search-input__listbox" role="listbox">
			{#each suggestions as item, i (i)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id="{uid}-option-{i}"
					class="cw-search-input__option"
					class:cw-search-input__option--active={i === activeIndex}
					role="option"
					aria-selected={i === activeIndex}
					onclick={() => selectItem(item)}
				>
					{mapSuggestionToLabel(item)}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.cw-search-input {
		position: relative;
		width: 100%;
	}

	.cw-search-input :global(.cw-input__slot--left svg) {
		width: 1rem;
		height: 1rem;
	}

	.cw-search-input__listbox {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		z-index: var(--cw-z-dropdown);
		margin-top: var(--cw-space-1);
		padding: var(--cw-space-1);
		list-style: none;
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		box-shadow: var(--cw-shadow-lg);
		max-height: 15rem;
		overflow-y: auto;
	}

	.cw-search-input__option {
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-search-input__option:hover,
	.cw-search-input__option--active {
		background-color: var(--cw-bg-muted);
	}
</style>
