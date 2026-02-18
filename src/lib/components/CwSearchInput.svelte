<script lang="ts">
	interface Props {
		value?: string;
		minChars?: number;
		debounceMs?: number;
		fetchSuggestions: (query: string, signal: AbortSignal) => Promise<unknown[]>;
		mapSuggestionToLabel?: (item: unknown) => string;
		mapSuggestionToValue?: (item: unknown) => string;
		placeholder?: string;
		label?: string;
		onselect?: (value: string, item: unknown) => void;
	}

	let {
		value = $bindable(''),
		minChars = 3,
		debounceMs = 250,
		fetchSuggestions,
		mapSuggestionToLabel = (item: unknown) => String(item),
		mapSuggestionToValue = (item: unknown) => String(item),
		placeholder = 'Search…',
		label,
		onselect
	}: Props = $props();

	const uid = $props.id();

	let query = $state('');
	let suggestions = $state<unknown[]>([]);
	let loading = $state(false);
	let open = $state(false);
	let activeIndex = $state(-1);
	let inputRef = $state<HTMLInputElement | null>(null);

	let abortController: AbortController | null = null;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		query = target.value;
		value = query;
		activeIndex = -1;

		if (debounceTimer) clearTimeout(debounceTimer);
		if (abortController) abortController.abort();

		if (query.length < minChars) {
			suggestions = [];
			open = false;
			loading = false;
			return;
		}

		loading = true;
		debounceTimer = setTimeout(async () => {
			abortController = new AbortController();
			try {
				const results = await fetchSuggestions(query, abortController.signal);
				suggestions = results;
				open = results.length > 0;
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') return;
				suggestions = [];
				open = false;
			} finally {
				loading = false;
			}
		}, debounceMs);
	}

	function selectItem(item: unknown) {
		const label = mapSuggestionToLabel(item);
		const val = mapSuggestionToValue(item);
		query = label;
		value = val;
		open = false;
		suggestions = [];
		onselect?.(val, item);
		inputRef?.focus();
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
		// Delay to allow click on suggestion
		setTimeout(() => {
			open = false;
		}, 150);
	}
</script>

<div class="cw-search-input">
	{#if label}
		<label class="cw-search-input__label" for="{uid}-input">{label}</label>
	{/if}

	<div class="cw-search-input__wrapper">
		<span class="cw-search-input__icon" aria-hidden="true">
			{#if loading}
				<svg viewBox="0 0 24 24" fill="none" class="cw-spin">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" opacity="0.25" />
					<path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
				</svg>
			{:else}
				<svg viewBox="0 0 16 16" fill="none">
					<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
					<path d="M10.5 10.5L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
				</svg>
			{/if}
		</span>

		<input
			bind:this={inputRef}
			id="{uid}-input"
			class="cw-search-input__field"
			type="text"
			role="combobox"
			{placeholder}
			value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onblur={handleBlur}
			aria-expanded={open}
			aria-controls="{uid}-listbox"
			aria-activedescendant={activeIndex >= 0 ? `${uid}-option-${activeIndex}` : undefined}
			autocomplete="off"
		/>
	</div>

	{#if open && suggestions.length > 0}
		<ul id="{uid}-listbox" class="cw-search-input__listbox" role="listbox">
			{#each suggestions as item, i}
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
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-search-input__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-search-input__wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.cw-search-input__icon {
		position: absolute;
		left: var(--cw-space-3);
		display: flex;
		align-items: center;
		width: 1rem;
		height: 1rem;
		color: var(--cw-text-muted);
		pointer-events: none;
	}

	.cw-search-input__icon svg {
		width: 100%;
		height: 100%;
	}

	.cw-search-input__field {
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3) var(--cw-space-2) var(--cw-space-10);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		outline: none;
		min-height: 2.25rem;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-search-input__field::placeholder {
		color: var(--cw-text-muted);
	}

	.cw-search-input__field:focus {
		border-color: var(--cw-focus-ring-color);
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 25%, transparent);
	}

	/* ── Listbox ─────────────────────────── */
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
