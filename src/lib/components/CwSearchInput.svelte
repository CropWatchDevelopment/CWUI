<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CwSize } from '../types/index.js';
	import CwInput from './CwInput.svelte';
	import CwSpinner from './CwSpinner.svelte';

	interface CwSearchInputLabels {
		/** Shown when a search returns no suggestions. */
		noResults: string;
		/** Shown when `fetchSuggestions` rejects. */
		error: string;
		/** Clear-button label forwarded to CwInput. */
		clear: string;
	}

	interface Props {
		value?: string;
		name?: string;
		/** Native id forwarded to the underlying `<input>`. */
		id?: string;
		required?: boolean;
		minChars?: number;
		debounceMs?: number;
		fetchSuggestions?: (query: string, signal: AbortSignal) => Promise<unknown[]>;
		mapSuggestionToLabel?: (item: unknown) => string;
		mapSuggestionToValue?: (item: unknown) => string;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		label?: string;
		/** Accessible name when no visible `label` is shown (e.g. a nav search box). */
		ariaLabel?: string;
		/** Helper text shown below the field. Replaced by `error` when set. */
		hint?: string;
		/** Validation error for the field itself (not the suggestion fetch). */
		error?: string;
		clearable?: boolean;
		disabled?: boolean;
		/** Control size. Matches CwInput. */
		size?: CwSize;
		/** Override built-in English strings. */
		labels?: Partial<CwSearchInputLabels>;
		oninput?: (value: string) => void;
		onselect?: (value: string, item: unknown) => void;
		class?: string;
	}

	let {
		value = $bindable(''),
		name,
		id,
		required = false,
		minChars = 3,
		debounceMs = 250,
		fetchSuggestions,
		mapSuggestionToLabel = (item: unknown) => String(item),
		mapSuggestionToValue = (item: unknown) => String(item),
		placeholder = 'Search…',
		autocomplete = 'off',
		label,
		ariaLabel,
		hint,
		error,
		clearable = true,
		disabled = false,
		size = 'md',
		labels,
		oninput,
		onselect,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const listboxId = `${uid}-listbox`;
	const text = $derived({
		noResults: 'No results found',
		error: 'Couldn’t load suggestions. Try again.',
		clear: 'Clear',
		...labels
	});

	let query = $state(value);
	// $state.raw: the array is only ever replaced wholesale, and deep-proxying
	// consumer-owned suggestion objects would break their === identity when
	// handed back through onselect.
	let suggestions = $state.raw<unknown[]>([]);
	let loading = $state(false);
	let fetchFailed = $state(false);
	let open = $state(false);
	let activeIndex = $state(-1);
	let rootRef = $state<HTMLDivElement | null>(null);
	let listboxRef = $state<HTMLUListElement | null>(null);
	let listboxStyle = $state('');

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	const activeId = $derived(
		open && activeIndex >= 0 && activeIndex < suggestions.length ? `${uid}-option-${activeIndex}` : undefined
	);

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
		fetchFailed = false;
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
				fetchFailed = false;
				open = true;
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				if (pendingQuery !== query) return;
				suggestions = [];
				fetchFailed = true;
				open = true;
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
				if (suggestions.length) activeIndex = (activeIndex + 1) % suggestions.length;
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (suggestions.length) {
					activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
				}
				break;
			case 'Home':
				if (!suggestions.length) return;
				e.preventDefault();
				activeIndex = 0;
				break;
			case 'End':
				if (!suggestions.length) return;
				e.preventDefault();
				activeIndex = suggestions.length - 1;
				break;
			case 'Enter':
				if (activeIndex >= 0) {
					e.preventDefault();
					selectItem(suggestions[activeIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				activeIndex = -1;
				break;
			case 'Tab':
				open = false;
				break;
		}
	}

	function handleBlur() {
		// Options keep focus in the input via pointerdown.preventDefault,
		// so a real blur means the user moved on.
		open = false;
		activeIndex = -1;
	}

	function updateListboxPosition() {
		const anchor = rootRef?.querySelector<HTMLElement>('.cw-input__wrapper');
		if (!open || !anchor) return;

		const rect = anchor.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const listHeight = listboxRef?.offsetHeight ?? 0;
		let top = rect.bottom + spacing;
		if (listHeight > 0 && top + listHeight > window.innerHeight - margin) {
			const aboveTop = rect.top - spacing - listHeight;
			top = aboveTop >= margin ? aboveTop : Math.max(margin, window.innerHeight - margin - listHeight);
		}
		const left = Math.max(margin, Math.min(rect.left, window.innerWidth - margin - rect.width));
		listboxStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${Math.round(rect.width)}px;`;
	}

	$effect(() => {
		if (!open || !listboxRef) return;
		const raf = requestAnimationFrame(updateListboxPosition);
		const handleViewportChange = () => updateListboxPosition();
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);
		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
		};
	});

	$effect(() => {
		if (open && listboxRef && activeIndex >= 0) {
			listboxRef
				.querySelector(`#${CSS.escape(`${uid}-option-${activeIndex}`)}`)
				?.scrollIntoView({ block: 'nearest' });
		}
	});

	onDestroy(() => {
		clearPendingSuggestions();
	});
</script>

<div bind:this={rootRef} class="cw-search-input {className}">
	<CwInput
		type="text"
		bind:value={query}
		{name}
		{id}
		{required}
		{label}
		{hint}
		{error}
		{disabled}
		{size}
		{placeholder}
		{autocomplete}
		{clearable}
		labels={{ clear: text.clear }}
		role={fetchSuggestions ? 'combobox' : undefined}
		aria-autocomplete={fetchSuggestions ? 'list' : undefined}
		aria-expanded={fetchSuggestions ? open : undefined}
		aria-controls={fetchSuggestions ? listboxId : undefined}
		aria-activedescendant={activeId}
		aria-busy={loading || undefined}
		aria-label={ariaLabel}
		oninput={handleInput}
		onkeydown={handleKeydown}
		onblur={handleBlur}
	>
		{#snippet leftSlot()}
			{#if loading}
				<CwSpinner size="sm" />
			{:else}
				<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
					<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			{/if}
		{/snippet}
	</CwInput>

	{#if open}
		<!-- pointerdown.preventDefault keeps focus in the input so blur doesn't close the list mid-click. -->
		<ul
			bind:this={listboxRef}
			id={listboxId}
			class="cw-search-input__listbox"
			style={listboxStyle}
			role="listbox"
			aria-label={label ?? ariaLabel}
			onpointerdown={(event) => event.preventDefault()}
		>
			{#each suggestions as item, i (i)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					id="{uid}-option-{i}"
					class="cw-search-input__option"
					class:cw-search-input__option--active={i === activeIndex}
					role="option"
					aria-selected={i === activeIndex}
					onclick={() => selectItem(item)}
					onpointermove={() => (activeIndex = i)}
				>
					{mapSuggestionToLabel(item)}
				</li>
			{:else}
				<li
					class="cw-search-input__status"
					class:cw-search-input__status--error={fetchFailed}
					role="presentation"
				>
					{fetchFailed ? text.error : text.noResults}
				</li>
			{/each}
		</ul>
	{/if}

	<p class="cw-search-input__live" aria-live="polite">
		{#if open && !loading}
			{fetchFailed ? text.error : suggestions.length === 0 ? text.noResults : ''}
		{/if}
	</p>
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
		position: fixed;
		z-index: var(--cw-z-popover);
		padding: var(--cw-space-1);
		list-style: none;
		background-color: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
		max-height: 15rem;
		overflow-y: auto;
	}

	.cw-search-input__option {
		display: flex;
		align-items: center;
		min-height: var(--cw-option-min-h);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-search-input__option--active {
		background-color: var(--cw-option-hover-bg);
	}

	.cw-search-input__status {
		padding: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		text-align: center;
	}

	.cw-search-input__status--error {
		color: var(--cw-tone-danger-text);
	}

	.cw-search-input__live {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
