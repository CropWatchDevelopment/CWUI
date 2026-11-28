<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import type { CwSelectAction, CwSize } from '../types/index.js';
	import CwSelectActions from './CwSelectActions.svelte';
	import { activeIndexFor, filterBySearch, firstEnabledIndex } from './cwSelectSearch.js';

	interface Option {
		label: string;
		value: string;
		disabled?: boolean;
	}

	interface CwDropdownLabels {
		/** Shown in the list when `options` is empty. */
		empty: string;
		/** Accessible label for the search field. Defaults to `searchPlaceholder`. */
		search: string;
	}

	interface Props {
		options: Option[];
		value?: string;
		name?: string;
		/** Native id placed on the trigger (and the label's `for`). Falls back to an auto-generated id. */
		id?: string;
		required?: boolean;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		disabled?: boolean;
		/** Helper text shown below the trigger. Replaced by `error` when set. */
		hint?: string;
		error?: string;
		label?: string;
		/** Accessible name when no visible `label` is rendered. */
		ariaLabel?: string;
		/** Control size. Matches CwInput / CwButton heights. */
		size?: CwSize;
		/** Override built-in English strings. */
		labels?: Partial<CwDropdownLabels>;
		/** Show a search field at the top of the open list that filters the options by their label. */
		searchable?: boolean;
		searchPlaceholder?: string;
		/** Shown in the list when the search finds nothing. */
		noResultsLabel?: string;
		/**
		 * Icon buttons shown inside the box, just left of the arrow (edit, delete, copy, …).
		 * They stay usable when the dropdown itself is `disabled`: disable them one by one.
		 */
		actions?: CwSelectAction[];
		/** Anything else to show inside the box, left of the arrow and after `actions`: a CwCopy, a CwButton, an icon. */
		rightSlot?: Snippet;
		onchange?: (value: string) => void;
		class?: string;
	}

	let {
		options,
		value = $bindable(''),
		name,
		id,
		required = false,
		placeholder = 'Select…',
		autocomplete,
		disabled = false,
		hint,
		error,
		label,
		ariaLabel,
		size = 'md',
		labels,
		searchable = false,
		searchPlaceholder = 'Search…',
		noResultsLabel = 'No matches',
		actions,
		rightSlot,
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const triggerId = $derived(id ?? `${uid}-trigger`);
	const text = $derived({ empty: 'No options', search: searchPlaceholder, ...labels });
	const describedBy = $derived(error ? `${uid}-error` : hint ? `${uid}-hint` : undefined);

	let open = $state(false);
	let rootRef = $state<HTMLDivElement | null>(null);
	let popoverRef = $state<HTMLDivElement | null>(null);
	let listboxRef = $state<HTMLUListElement | null>(null);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let searchInputRef = $state<HTMLInputElement | null>(null);
	let activeIndex = $state(-1);
	let listboxStyle = $state('');
	let query = $state('');
	// The actions sit on top of the trigger; this much room is kept free for them.
	let actionsWidth = $state(0);
	let typeahead = '';
	let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

	const selectedOption = $derived(options.find((o) => o.value === value));
	const displayText = $derived(selectedOption?.label ?? placeholder);
	/** The options in the open list: all of them, or the ones the search finds. */
	const visibleOptions = $derived(searchable ? filterBySearch(options, query) : options);
	const hasActions = $derived((actions?.length ?? 0) > 0 || !!rightSlot);
	const activeId = $derived(
		open && activeIndex >= 0 && activeIndex < visibleOptions.length ? `${uid}-option-${activeIndex}` : undefined
	);

	/** Opens the list. With a search field, `initialQuery` is what the user already typed on the trigger. */
	function openList(initialQuery = '') {
		if (disabled || open) return;
		query = searchable ? initialQuery : '';
		open = true;
		activeIndex = activeIndexFor(visibleOptions, value);
	}

	function close(returnFocus = false) {
		open = false;
		query = '';
		if (returnFocus) triggerRef?.focus();
	}

	function search(nextQuery: string) {
		query = nextQuery;
		activeIndex = activeIndexFor(visibleOptions, value);
		// The list just changed height: it may now fit below, or need to move up.
		requestAnimationFrame(updateListboxPosition);
	}

	function toggle() {
		if (open) close();
		else openList();
	}

	function select(opt: Option) {
		if (opt.disabled) return;
		value = opt.value;
		onchange?.(opt.value);
		close(true);
	}

	function move(step: 1 | -1) {
		const next = firstEnabledIndex(visibleOptions, activeIndex + step, step);
		if (next >= 0) activeIndex = next;
	}

	function selectActive() {
		const active = visibleOptions[activeIndex];
		if (activeIndex >= 0 && active) select(active);
	}

	function handleTypeahead(key: string) {
		clearTimeout(typeaheadTimer);
		typeahead += key.toLowerCase();
		typeaheadTimer = setTimeout(() => (typeahead = ''), 500);
		const start = Math.max(activeIndex, 0);
		const ordered = [...options.keys()].map((k) => (k + start + (typeahead.length === 1 ? 1 : 0)) % options.length);
		const match = ordered.find(
			(i) => !options[i].disabled && options[i].label.toLowerCase().startsWith(typeahead)
		);
		if (match !== undefined) {
			if (!open) openList();
			activeIndex = match;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (disabled) return;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				if (!open) openList();
				else move(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				if (!open) openList();
				else move(-1);
				break;
			case 'Home':
				if (!open) return;
				e.preventDefault();
				activeIndex = firstEnabledIndex(visibleOptions);
				break;
			case 'End':
				if (!open) return;
				e.preventDefault();
				activeIndex = firstEnabledIndex(visibleOptions, visibleOptions.length - 1, -1);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (!open) openList();
				else selectActive();
				break;
			case 'Escape':
				if (!open) return;
				e.preventDefault();
				close(true);
				break;
			case 'Tab':
				if (open) close();
				break;
			default:
				if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
					if (!searchable) {
						handleTypeahead(e.key);
					} else {
						// Typing on the trigger starts a search with that character.
						e.preventDefault();
						if (open) search(query + e.key);
						else openList(e.key);
					}
				}
		}
	}

	/** Keys in the search field. Space and the other characters stay text. */
	function handleSearchKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				move(1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				move(-1);
				break;
			case 'Home':
				e.preventDefault();
				activeIndex = firstEnabledIndex(visibleOptions);
				break;
			case 'End':
				e.preventDefault();
				activeIndex = firstEnabledIndex(visibleOptions, visibleOptions.length - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				selectActive();
				break;
			case 'Escape':
				e.preventDefault();
				close(true);
				break;
			case 'Tab':
				close();
				break;
		}
	}

	function updateListboxPosition() {
		if (!open || !triggerRef) return;

		const rect = triggerRef.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const listWidth = Math.round(rect.width);
		const listHeight = popoverRef?.offsetHeight ?? 0;
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		let left = rect.left;
		if (left + listWidth > viewportWidth - margin) {
			left = Math.max(margin, viewportWidth - margin - listWidth);
		}
		if (left < margin) left = margin;

		let top = rect.bottom + spacing;
		if (listHeight > 0 && top + listHeight > viewportHeight - margin) {
			const aboveTop = rect.top - spacing - listHeight;
			if (aboveTop >= margin) {
				top = aboveTop;
			} else {
				top = Math.max(margin, viewportHeight - margin - listHeight);
			}
		}

		listboxStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${listWidth}px;`;
	}

	$effect(() => {
		if (!open || !popoverRef) return;

		const raf = requestAnimationFrame(() => {
			updateListboxPosition();
			// With a search field, typing goes there; the trigger keeps focus otherwise.
			if (searchable && searchInputRef) {
				searchInputRef.focus();
				// After a character typed on the trigger, go on typing behind it.
				const end = searchInputRef.value.length;
				searchInputRef.setSelectionRange(end, end);
			}
		});

		const handleViewportChange = () => updateListboxPosition();
		// Close on outside pointerdown without swallowing the click, so the
		// user's click still reaches whatever they pressed.
		const handlePointerDown = (event: PointerEvent) => {
			if (rootRef && !rootRef.contains(event.target as Node)) close();
		};
		// Close when focus leaves the component (e.g. Tab out of the search field).
		const handleFocusOut = (event: FocusEvent) => {
			const next = event.relatedTarget as Node | null;
			if (next && rootRef && !rootRef.contains(next)) close();
		};
		const root = rootRef;
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);
		document.addEventListener('pointerdown', handlePointerDown, true);
		root?.addEventListener('focusout', handleFocusOut);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
			document.removeEventListener('pointerdown', handlePointerDown, true);
			root?.removeEventListener('focusout', handleFocusOut);
		};
	});

	// Scroll active option into view
	$effect(() => {
		if (open && listboxRef && activeIndex >= 0) {
			listboxRef.querySelector(`#${CSS.escape(`${uid}-option-${activeIndex}`)}`)?.scrollIntoView({
				block: 'nearest'
			});
		}
	});
</script>

<div
	bind:this={rootRef}
	class="cw-dropdown cw-dropdown--{size} {className}"
	class:cw-dropdown--error={!!error}
	class:cw-dropdown--disabled={disabled}
>
	{#if label}
		<label class="cw-dropdown__label" id="{uid}-label" for={triggerId}>
			{label}{#if required}<span class="cw-dropdown__required" aria-hidden="true">&nbsp;*</span>{/if}
		</label>
	{/if}

	{#if name || required}
		<input
			class="cw-dropdown__native-input"
			type="text"
			{name}
			value={value}
			required={required && !disabled}
			{autocomplete}
			{disabled}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}

	<div class="cw-dropdown__control">
		<button
			bind:this={triggerRef}
			id={triggerId}
			type="button"
			class="cw-dropdown__trigger"
			class:cw-dropdown__trigger--open={open}
			class:cw-dropdown__trigger--placeholder={!selectedOption}
			{disabled}
			role="combobox"
			aria-expanded={open}
			aria-haspopup="listbox"
			aria-controls="{uid}-listbox"
			aria-activedescendant={searchable ? undefined : activeId}
			aria-labelledby={label ? `${uid}-label ${triggerId}` : undefined}
			aria-label={label ? undefined : ariaLabel}
			aria-required={required || undefined}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			onclick={toggle}
			onkeydown={handleKeydown}
		>
			<span class="cw-dropdown__text">{displayText}</span>
			{#if hasActions}
				<!-- Room for the actions, which lie on top of the trigger: a button cannot contain buttons. -->
				<span class="cw-dropdown__actions-space" style:width="{actionsWidth}px" aria-hidden="true"></span>
			{/if}
			<svg class="cw-dropdown__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
				<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
		{#if hasActions}
			<span class="cw-dropdown__actions" bind:offsetWidth={actionsWidth}>
				<CwSelectActions {actions} content={rightSlot} {size} onengage={() => close()} />
			</span>
		{/if}
	</div>

	{#if open}
		<div bind:this={popoverRef} class="cw-dropdown__popover" style={listboxStyle}>
			{#if searchable}
				<div class="cw-dropdown__search-wrap">
					<input
						bind:this={searchInputRef}
						value={query}
						type="text"
						class="cw-dropdown__search"
						placeholder={searchPlaceholder}
						aria-label={text.search}
						role="combobox"
						aria-expanded="true"
						aria-controls="{uid}-listbox"
						aria-autocomplete="list"
						aria-activedescendant={activeId}
						autocomplete="off"
						spellcheck="false"
						oninput={(event) => search(event.currentTarget.value)}
						onkeydown={handleSearchKeydown}
					/>
				</div>
			{/if}
			<ul
				bind:this={listboxRef}
				id="{uid}-listbox"
				class="cw-dropdown__listbox"
				role="listbox"
				aria-labelledby={label ? `${uid}-label` : undefined}
				aria-label={label ? undefined : ariaLabel}
			>
				{#each visibleOptions as opt, i (opt.value)}
					<!-- Focus stays on the trigger, or on the search field (aria-activedescendant); options are pointer targets only. -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						id="{uid}-option-{i}"
						role="option"
						class="cw-dropdown__option"
						class:cw-dropdown__option--active={i === activeIndex}
						class:cw-dropdown__option--selected={opt.value === value}
						class:cw-dropdown__option--disabled={opt.disabled}
						aria-selected={opt.value === value}
						aria-disabled={opt.disabled || undefined}
						onclick={() => select(opt)}
						onpointermove={() => {
							if (!opt.disabled) activeIndex = i;
						}}
					>
						<span class="cw-dropdown__option-label">{opt.label}</span>
						{#if opt.value === value}
							<svg class="cw-dropdown__check" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						{/if}
					</li>
				{:else}
					<li class="cw-dropdown__empty" role="presentation">
						{options.length === 0 ? text.empty : noResultsLabel}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if error}
		<p class="cw-dropdown__message cw-dropdown__message--error" id="{uid}-error">{error}</p>
	{:else if hint}
		<p class="cw-dropdown__message" id="{uid}-hint">{hint}</p>
	{/if}
</div>

<style>
	.cw-dropdown {
		--_h: var(--cw-control-h-md);
		--_px: var(--cw-control-px-md);
		--_fs: var(--cw-control-text-md);
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-dropdown--sm {
		--_h: var(--cw-control-h-sm);
		--_px: var(--cw-control-px-sm);
		--_fs: var(--cw-control-text-sm);
	}

	.cw-dropdown--lg {
		--_h: var(--cw-control-h-lg);
		--_px: var(--cw-control-px-lg);
		--_fs: var(--cw-control-text-lg);
	}

	.cw-dropdown__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-dropdown__required {
		color: var(--cw-tone-danger-text);
	}

	.cw-dropdown__native-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		padding: 0;
		border: 0;
	}

	.cw-dropdown__control {
		position: relative;
		display: flex;
	}

	.cw-dropdown__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		width: 100%;
		min-height: var(--_h);
		padding: 0 var(--_px);
		font-family: var(--cw-font-family);
		font-size: var(--_fs);
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-control-radius);
		cursor: pointer;
		text-align: left;
		transition: border-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__trigger:hover:not(:disabled) {
		border-color: var(--cw-control-border-hover);
	}

	.cw-dropdown__trigger:focus-visible,
	.cw-dropdown__trigger--open {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-dropdown__trigger--placeholder {
		color: var(--cw-control-placeholder);
	}

	.cw-dropdown__text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-dropdown__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-text-muted);
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__trigger--open .cw-dropdown__chevron {
		transform: rotate(180deg);
	}

	/* ── Actions inside the box ──────────── */
	.cw-dropdown__actions-space {
		flex-shrink: 0;
	}

	/* On top of the trigger, between the text and the arrow. */
	.cw-dropdown__actions {
		position: absolute;
		top: 0;
		bottom: 0;
		/* Trigger border + padding + arrow + gap: exactly over the room kept for them. */
		right: calc(1px + var(--_px) + 1rem + var(--cw-space-2));
		display: flex;
		align-items: center;
	}

	/* ── Popover: optional search, then the list ── */
	.cw-dropdown__popover {
		position: fixed;
		z-index: var(--cw-z-popover);
		display: flex;
		flex-direction: column;
		max-height: 15rem;
		background-color: var(--cw-popover-bg);
		border: 1px solid var(--cw-popover-border);
		border-radius: var(--cw-popover-radius);
		box-shadow: var(--cw-elevation-popover);
		overflow: hidden;
	}

	.cw-dropdown__search-wrap {
		flex-shrink: 0;
		padding: var(--cw-space-1);
		border-bottom: 1px solid var(--cw-border-muted);
	}

	.cw-dropdown__search {
		width: 100%;
		box-sizing: border-box;
		min-height: var(--cw-control-h-sm);
		padding: 0 var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-control-text);
		background-color: var(--cw-control-bg);
		border: 1px solid var(--cw-control-border);
		border-radius: var(--cw-radius-md);
		caret-color: var(--cw-focus-ring-color, currentColor);
	}

	.cw-dropdown__search::placeholder {
		color: var(--cw-control-placeholder);
	}

	.cw-dropdown__search:focus-visible {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-dropdown__listbox {
		flex: 1;
		min-height: 0;
		margin: 0;
		padding: var(--cw-space-1);
		list-style: none;
		overflow-y: auto;
	}

	.cw-dropdown__option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		min-height: var(--cw-option-min-h);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-dropdown__option-label {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.cw-dropdown__option--active {
		background-color: var(--cw-option-hover-bg);
	}

	.cw-dropdown__option--selected {
		color: var(--cw-option-selected-text);
		font-weight: var(--cw-font-medium);
	}

	.cw-dropdown__option--disabled {
		color: var(--cw-text-disabled);
		cursor: not-allowed;
	}

	.cw-dropdown__check {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-option-selected-text);
	}

	.cw-dropdown__empty {
		padding: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		text-align: center;
	}

	/* ── States ──────────────────────────── */
	.cw-dropdown--error .cw-dropdown__trigger,
	.cw-dropdown--error .cw-dropdown__trigger:hover:not(:disabled) {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-dropdown--disabled .cw-dropdown__trigger {
		color: var(--cw-text-disabled);
		background-color: var(--cw-control-bg-readonly);
		border-color: var(--cw-border-muted);
		cursor: not-allowed;
	}

	.cw-dropdown--disabled .cw-dropdown__label {
		color: var(--cw-text-disabled);
	}

	.cw-dropdown__message {
		margin: 0;
		font-size: var(--cw-text-xs);
		color: var(--cw-text-muted);
	}

	.cw-dropdown__message--error {
		color: var(--cw-tone-danger-text);
	}
</style>
