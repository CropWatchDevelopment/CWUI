<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type GroupKey = string | number;

	interface Option {
		label: string;
		value: string;
		disabled?: boolean;
		/** Key linking this option to a group defined in `groups`. Options whose group key isn't found render ungrouped at the end. */
		group?: GroupKey;
	}

	interface Group {
		/** Matches `Option.group`. */
		value: GroupKey;
		/** Heading text rendered above the options in this group. */
		label: string;
	}

	interface SelectedItem {
		id: string;
		label: string;
	}

	interface Props {
		options: Option[];
		/** Optional group definitions. When provided, options are rendered under group headings in the order given. Options whose `group` key is missing from this list render ungrouped at the end. */
		groups?: Group[];
		value?: SelectedItem[];
		name?: string;
		/** Native id placed on the trigger (and the label's `for`). Falls back to an auto-generated id. */
		id?: string;
		required?: boolean;
		placeholder?: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		disabled?: boolean;
		error?: string;
		label?: string;
		/** Maximum number of selected chip labels to render in the trigger before collapsing into "+N more". Ignored when `showAllSelectedItems` is true. */
		maxVisibleChips?: number;
		/** When true, render every selected chip in the trigger and let it wrap — overrides `maxVisibleChips`. */
		showAllSelectedItems?: boolean;
		/** Show a "Clear all" action inside the listbox when at least one item is selected. */
		clearable?: boolean;
		clearLabel?: string;
		/** Max height of the open dropdown listbox. Accepts any CSS length (e.g. `"22rem"`, `"400px"`). Defaults to `15rem`. */
		dropdownHeight?: string;
		/** Render a search field at the top of the dropdown that filters options by their label and group label. */
		searchable?: boolean;
		searchPlaceholder?: string;
		/** Text shown inside the dropdown when the search query yields no matches. */
		noResultsLabel?: string;
		onchange?: (value: SelectedItem[]) => void;
		class?: string;
	}

	let {
		options,
		groups,
		value = $bindable<SelectedItem[]>([]),
		name,
		id,
		required = false,
		placeholder = 'Select…',
		autocomplete,
		disabled = false,
		error,
		label,
		maxVisibleChips = 3,
		showAllSelectedItems = false,
		clearable = true,
		clearLabel = 'Clear all',
		dropdownHeight = '15rem',
		searchable = true,
		searchPlaceholder = 'Search…',
		noResultsLabel = 'No matches',
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();
	const triggerId = $derived(id ?? `${uid}-trigger`);

	let open = $state(false);
	let listboxRef = $state<HTMLUListElement | null>(null);
	let triggerRef = $state<HTMLDivElement | null>(null);
	let searchInputRef = $state<HTMLInputElement | null>(null);
	let activeIndex = $state(-1);
	let listboxStyle = $state('');
	let query = $state('');

	const selectedIds = $derived(new Set(value.map((v) => v.id)));
	const visibleChips = $derived(showAllSelectedItems ? value : value.slice(0, maxVisibleChips));
	const overflowCount = $derived(
		showAllSelectedItems ? 0 : Math.max(0, value.length - maxVisibleChips)
	);

	type DisplayItem =
		| { kind: 'header'; key: string; label: string; groupValue: GroupKey; groupIndex: number }
		| { kind: 'option'; opt: Option; optionIndex: number; groupIndex: number };

	const displayBuild = $derived.by(() => {
		const items: DisplayItem[] = [];
		const flat: Option[] = [];
		const q = query.trim().toLowerCase();
		const matches = (text: string) => !q || text.toLowerCase().includes(q);

		if (!groups || groups.length === 0) {
			for (const opt of options) {
				if (!matches(opt.label)) continue;
				items.push({ kind: 'option', opt, optionIndex: flat.length, groupIndex: -1 });
				flat.push(opt);
			}
			return { items, flat };
		}

		const seen = new Set<string>();
		let visibleGroupIndex = 0;
		for (const group of groups) {
			const groupOpts = options.filter((o) => o.group === group.value);
			if (groupOpts.length === 0) continue;
			// Reserve every option whose group is known so we don't leak it into the ungrouped tail when filtered out.
			for (const o of groupOpts) seen.add(o.value);

			const groupHeaderMatches = q.length > 0 && group.label.toLowerCase().includes(q);
			const optsToShow = groupHeaderMatches
				? groupOpts
				: groupOpts.filter((o) => matches(o.label));
			if (optsToShow.length === 0) continue;

			items.push({
				kind: 'header',
				key: `g-${String(group.value)}`,
				label: group.label,
				groupValue: group.value,
				groupIndex: visibleGroupIndex
			});
			for (const opt of optsToShow) {
				items.push({
					kind: 'option',
					opt,
					optionIndex: flat.length,
					groupIndex: visibleGroupIndex
				});
				flat.push(opt);
			}
			visibleGroupIndex++;
		}

		for (const opt of options) {
			if (seen.has(opt.value)) continue;
			if (!matches(opt.label)) continue;
			items.push({
				kind: 'option',
				opt,
				optionIndex: flat.length,
				groupIndex: visibleGroupIndex
			});
			flat.push(opt);
		}

		return { items, flat };
	});

	const displayOptions = $derived(displayBuild.flat);
	const displayItems = $derived(displayBuild.items);

	function openListbox() {
		if (disabled) return;
		open = true;
		const firstSelected = displayOptions.findIndex((o) => selectedIds.has(o.value));
		activeIndex = firstSelected >= 0 ? firstSelected : 0;
	}

	function closeListbox() {
		open = false;
		query = '';
	}

	function toggle() {
		if (disabled) return;
		if (open) closeListbox();
		else openListbox();
	}

	function toggleOption(opt: Option) {
		if (opt.disabled) return;
		const isSelected = selectedIds.has(opt.value);
		const next = isSelected
			? value.filter((v) => v.id !== opt.value)
			: [...value, { id: opt.value, label: opt.label }];
		value = next;
		onchange?.(next);
	}

	function clearAll() {
		if (value.length === 0) return;
		value = [];
		onchange?.(value);
		triggerRef?.focus();
	}

	function groupOptionsFor(groupValue: GroupKey) {
		return options.filter((o) => o.group === groupValue);
	}

	function selectAllInGroup(e: Event, groupValue: GroupKey) {
		e.stopPropagation();
		const selectable = groupOptionsFor(groupValue).filter(
			(o) => !o.disabled && !selectedIds.has(o.value)
		);
		if (selectable.length === 0) return;
		const next = [...value, ...selectable.map((o) => ({ id: o.value, label: o.label }))];
		value = next;
		onchange?.(next);
	}

	function clearAllInGroup(e: Event, groupValue: GroupKey) {
		e.stopPropagation();
		const groupValueIds = new Set(groupOptionsFor(groupValue).map((o) => o.value));
		const next = value.filter((v) => !groupValueIds.has(v.id));
		if (next.length === value.length) return;
		value = next;
		onchange?.(next);
	}

	function groupSelectionState(groupValue: GroupKey): 'none' | 'some' | 'all' {
		const groupOpts = groupOptionsFor(groupValue).filter((o) => !o.disabled);
		if (groupOpts.length === 0) return 'none';
		let selected = 0;
		for (const o of groupOpts) if (selectedIds.has(o.value)) selected++;
		if (selected === 0) return 'none';
		if (selected === groupOpts.length) return 'all';
		return 'some';
	}

	function removeChip(e: Event, id: string) {
		e.stopPropagation();
		value = value.filter((v) => v.id !== id);
		onchange?.(value);
	}

	function handleTriggerKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Enter':
			case ' ':
			case 'ArrowDown':
				e.preventDefault();
				if (!open) openListbox();
				break;
			case 'Escape':
				if (open) closeListbox();
				break;
		}
	}

	function activateOption(delta: number) {
		if (displayOptions.length === 0) {
			activeIndex = -1;
			return;
		}
		const next = activeIndex < 0 ? 0 : activeIndex + delta;
		activeIndex = Math.max(0, Math.min(displayOptions.length - 1, next));
	}

	function handleNavKey(e: KeyboardEvent): boolean {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activateOption(1);
				return true;
			case 'ArrowUp':
				e.preventDefault();
				activateOption(-1);
				return true;
			case 'Home':
				e.preventDefault();
				activeIndex = 0;
				return true;
			case 'End':
				e.preventDefault();
				activeIndex = displayOptions.length - 1;
				return true;
			case 'Enter':
				e.preventDefault();
				if (activeIndex >= 0 && !displayOptions[activeIndex]?.disabled) {
					toggleOption(displayOptions[activeIndex]);
				}
				return true;
			case 'Escape':
				e.preventDefault();
				closeListbox();
				triggerRef?.focus();
				return true;
			case 'Tab':
				closeListbox();
				return true;
		}
		return false;
	}

	function handleListKeydown(e: KeyboardEvent) {
		if (e.key === ' ') {
			e.preventDefault();
			if (activeIndex >= 0 && !displayOptions[activeIndex]?.disabled) {
				toggleOption(displayOptions[activeIndex]);
			}
			return;
		}
		handleNavKey(e);
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		// Space must remain a literal character in the search field, so we only handle the navigation keys.
		handleNavKey(e);
	}

	function handleBackdropClick() {
		closeListbox();
	}

	function updateListboxPosition() {
		if (!open || !triggerRef) return;

		const rect = triggerRef.getBoundingClientRect();
		const margin = 8;
		const spacing = 6;
		const listWidth = Math.round(rect.width);
		const listHeight = listboxRef?.offsetHeight ?? 0;
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

		listboxStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${listWidth}px;--cw-multiselect-dropdown-height:${dropdownHeight};`;
	}

	$effect(() => {
		if (!open || !listboxRef) return;

		const raf = requestAnimationFrame(() => {
			updateListboxPosition();
			if (searchable && searchInputRef) {
				searchInputRef.focus();
			} else {
				listboxRef?.focus();
			}
		});

		const handleViewportChange = () => updateListboxPosition();
		window.addEventListener('resize', handleViewportChange);
		window.addEventListener('scroll', handleViewportChange, true);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener('resize', handleViewportChange);
			window.removeEventListener('scroll', handleViewportChange, true);
		};
	});

	// Reposition + clamp activeIndex when filtering changes the list length.
	$effect(() => {
		query;
		if (!open) return;
		if (displayOptions.length === 0) {
			activeIndex = -1;
		} else if (activeIndex < 0 || activeIndex >= displayOptions.length) {
			activeIndex = 0;
		}
		requestAnimationFrame(() => updateListboxPosition());
	});

	$effect(() => {
		if (open && listboxRef && activeIndex >= 0) {
			const items = listboxRef.querySelectorAll('[role="option"]');
			items[activeIndex]?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="cw-multiselect__backdrop" onclick={handleBackdropClick} onkeydown={() => {}}></div>
{/if}

<div
	class="cw-multiselect {className}"
	class:cw-multiselect--error={!!error}
	class:cw-multiselect--disabled={disabled}
>
	{#if label}
		<label class="cw-multiselect__label" id="{uid}-label" for={triggerId}>{label}</label>
	{/if}

	{#if name || required}
		<input
			class="cw-multiselect__native-input"
			type="text"
			{name}
			value={value.map((v) => v.id).join(',')}
			required={required && !disabled && value.length === 0}
			{autocomplete}
			{disabled}
			tabindex="-1"
			aria-hidden="true"
		/>
	{/if}

	<div
		bind:this={triggerRef}
		id={triggerId}
		class="cw-multiselect__trigger"
		class:cw-multiselect__trigger--open={open}
		class:cw-multiselect__trigger--placeholder={value.length === 0}
		role="combobox"
		tabindex={disabled ? -1 : 0}
		aria-expanded={open}
		aria-haspopup="listbox"
		aria-controls="{uid}-listbox"
		aria-disabled={disabled || undefined}
		aria-labelledby={label ? `${uid}-label` : undefined}
		onclick={toggle}
		onkeydown={handleTriggerKeydown}
	>
		{#if value.length === 0}
			<span class="cw-multiselect__text cw-multiselect__text--placeholder">{placeholder}</span>
		{:else}
			<span class="cw-multiselect__chips">
				{#each visibleChips as chip (chip.id)}
					<span class="cw-multiselect__chip">
						<span class="cw-multiselect__chip-label">{chip.label}</span>
						{#if !disabled}
							<button
								type="button"
								class="cw-multiselect__chip-remove"
								tabindex="-1"
								aria-label="Remove {chip.label}"
								onclick={(e) => removeChip(e, chip.id)}
							>
								<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
								</svg>
							</button>
						{/if}
					</span>
				{/each}
				{#if overflowCount > 0}
					<span class="cw-multiselect__chip cw-multiselect__chip--overflow">+{overflowCount} more</span>
				{/if}
			</span>
		{/if}
		<svg class="cw-multiselect__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</div>

	{#if open}
		<ul
			bind:this={listboxRef}
			id="{uid}-listbox"
			class="cw-multiselect__listbox"
			style={listboxStyle}
			role="listbox"
			tabindex="-1"
			aria-multiselectable="true"
			aria-labelledby={label ? `${uid}-label` : undefined}
			onkeydown={handleListKeydown}
		>
			{#if searchable}
				<li class="cw-multiselect__search-wrap" role="presentation">
					<input
						bind:this={searchInputRef}
						bind:value={query}
						type="text"
						class="cw-multiselect__search"
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						autocomplete="off"
						spellcheck="false"
						onkeydown={handleSearchKeydown}
					/>
				</li>
			{/if}
			{#if displayItems.length === 0}
				<li class="cw-multiselect__empty" role="presentation">{noResultsLabel}</li>
			{/if}
			{#each displayItems as item (item.kind === 'header' ? item.key : item.opt.value)}
				{#if item.kind === 'header'}
					{@const state = groupSelectionState(item.groupValue)}
					<li
						class="cw-multiselect__group-header"
						class:cw-multiselect__group-header--alt={item.groupIndex % 2 === 1}
						role="presentation"
					>
						<span class="cw-multiselect__group-header-label">{item.label}</span>
						<span class="cw-multiselect__group-actions">
							<button
								type="button"
								class="cw-multiselect__group-action"
								tabindex="-1"
								disabled={state === 'all'}
								aria-label="Select all in {item.label}"
								title="Select all"
								onclick={(e) => selectAllInGroup(e, item.groupValue)}
							>
								<svg viewBox="0 -960 960 960" aria-hidden="true">
									<path
										d="m424-312 282-282-56-56-226 226-114-114-56 56 170 170ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
										fill="currentColor"
									/>
								</svg>
							</button>
							<button
								type="button"
								class="cw-multiselect__group-action"
								tabindex="-1"
								disabled={state === 'none'}
								aria-label="Clear all in {item.label}"
								title="Clear all"
								onclick={(e) => clearAllInGroup(e, item.groupValue)}
							>
								<svg viewBox="0 -960 960 960" aria-hidden="true">
									<path
										d="M280-440h400v-80H280v80Zm-80 320q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"
										fill="currentColor"
									/>
								</svg>
							</button>
						</span>
					</li>
				{:else}
					{@const opt = item.opt}
					{@const i = item.optionIndex}
					{@const isSelected = selectedIds.has(opt.value)}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<li
						role="option"
						class="cw-multiselect__option"
						class:cw-multiselect__option--active={i === activeIndex}
						class:cw-multiselect__option--selected={isSelected}
						class:cw-multiselect__option--disabled={opt.disabled}
						class:cw-multiselect__option--alt={item.groupIndex % 2 === 1}
						aria-selected={isSelected}
						aria-disabled={opt.disabled || undefined}
						onclick={() => toggleOption(opt)}
					>
						<span class="cw-multiselect__checkbox" aria-hidden="true">
							{#if isSelected}
								<svg viewBox="0 0 16 16" fill="none">
									<path d="M3.5 8.5l3 3 6-7" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							{/if}
						</span>
						<span class="cw-multiselect__option-label">{opt.label}</span>
					</li>
				{/if}
			{/each}

			{#if clearable && value.length > 0}
				<li class="cw-multiselect__separator" role="separator"></li>
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					role="option"
					aria-selected="false"
					class="cw-multiselect__clear"
					onclick={clearAll}
				>
					{clearLabel}
				</li>
			{/if}
		</ul>
	{/if}

	{#if error}
		<p class="cw-multiselect__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.cw-multiselect {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--cw-space-1);
		width: 100%;
	}

	.cw-multiselect__label {
		font-size: var(--cw-text-sm);
		font-weight: var(--cw-font-medium);
		color: var(--cw-text-secondary);
	}

	.cw-multiselect__native-input {
		position: absolute;
		inset: 0;
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		padding: 0;
		border: 0;
	}

	.cw-multiselect__trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		width: 100%;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-strong);
		border-radius: var(--cw-radius-md);
		cursor: pointer;
		min-height: 2.375rem;
		text-align: left;
		transition:
			border-color var(--cw-duration-fast) var(--cw-ease-default),
			box-shadow var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-multiselect__trigger:focus-visible {
		border-color: var(--cw-focus-ring-color);
		box-shadow:
			0 0 0 var(--cw-focus-ring-width) color-mix(in srgb, var(--cw-focus-ring-color) 35%, transparent),
			0 0 8px color-mix(in srgb, var(--cw-focus-ring-color) 15%, transparent);
	}

	.cw-multiselect__trigger--open {
		border-color: var(--cw-focus-ring-color);
	}

	.cw-multiselect__text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-multiselect__text--placeholder {
		color: var(--cw-text-muted);
	}

	.cw-multiselect__chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--cw-space-1);
		flex: 1;
		min-width: 0;
	}

	.cw-multiselect__chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.125rem 0.375rem 0.125rem 0.5rem;
		font-size: var(--cw-text-xs);
		color: var(--cw-accent-text);
		background-color: color-mix(in srgb, var(--cw-accent) 12%, transparent);
		border: 1px solid color-mix(in srgb, var(--cw-accent) 30%, transparent);
		border-radius: var(--cw-radius-sm);
		max-width: 100%;
	}

	.cw-multiselect__chip--overflow {
		padding: 0.125rem 0.5rem;
		color: var(--cw-text-secondary);
		background-color: var(--cw-bg-muted);
		border-color: var(--cw-border-default);
	}

	.cw-multiselect__chip-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-multiselect__chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 0.875rem;
		height: 0.875rem;
		padding: 0;
		color: inherit;
		background: transparent;
		border: 0;
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
	}

	.cw-multiselect__chip-remove:hover {
		background-color: color-mix(in srgb, var(--cw-accent) 20%, transparent);
	}

	.cw-multiselect__chip-remove svg {
		width: 0.75rem;
		height: 0.75rem;
	}

	.cw-multiselect__chevron {
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		transition: transform var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-multiselect__trigger--open .cw-multiselect__chevron {
		transform: rotate(180deg);
	}

	/* ── Listbox ─────────────────────────── */
	.cw-multiselect__backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--cw-z-overlay);
	}

	.cw-multiselect__listbox {
		position: fixed;
		z-index: calc(var(--cw-z-overlay) + 1);
		padding: var(--cw-space-1);
		margin: 0;
		list-style: none;
		background-color: var(--cw-bg-elevated);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-md);
		box-shadow: var(--cw-shadow-lg);
		max-height: var(--cw-multiselect-dropdown-height, 15rem);
		overflow-y: auto;
		outline: none;
	}

	.cw-multiselect__search-wrap {
		position: sticky;
		top: calc(var(--cw-space-1) * -1);
		z-index: 1;
		margin: calc(var(--cw-space-1) * -1) calc(var(--cw-space-1) * -1) var(--cw-space-1);
		padding: var(--cw-space-1) var(--cw-space-1) var(--cw-space-1);
		background-color: var(--cw-bg-elevated);
		border-bottom: 1px solid var(--cw-border-muted);
		list-style: none;
	}

	.cw-multiselect__search {
		width: 100%;
		box-sizing: border-box;
		padding: var(--cw-space-2) var(--cw-space-3);
		font-family: var(--cw-font-family);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		background-color: var(--cw-bg-surface);
		border: 1px solid var(--cw-border-default);
		border-radius: var(--cw-radius-sm);
		outline: none;
		caret-color: var(--cw-focus-ring-color, currentColor);
	}

	.cw-multiselect__search::placeholder {
		color: var(--cw-text-muted);
	}

	.cw-multiselect__search:focus-visible {
		border-color: var(--cw-focus-ring-color);
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 25%, transparent);
	}

	.cw-multiselect__empty {
		padding: var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-muted);
		text-align: center;
		list-style: none;
	}

	.cw-multiselect__option {
		display: flex;
		align-items: center;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-text-primary);
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		transition: background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-multiselect__option--alt {
		background-color: color-mix(in srgb, var(--cw-text-primary) 5%, transparent);
		border-radius: 0;
		margin-left: calc(var(--cw-space-1) * -1);
		margin-right: calc(var(--cw-space-1) * -1);
		padding-left: calc(var(--cw-space-3) + var(--cw-space-1));
		padding-right: calc(var(--cw-space-3) + var(--cw-space-1));
	}

	.cw-multiselect__option:hover,
	.cw-multiselect__option--active {
		background-color: var(--cw-bg-muted);
	}

	.cw-multiselect__option--selected {
		color: var(--cw-accent-text);
	}

	.cw-multiselect__option--disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cw-multiselect__option-label {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-multiselect__checkbox {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		flex-shrink: 0;
		color: var(--cw-accent);
		border: 1px solid var(--cw-border-strong);
		border-radius: var(--cw-radius-sm);
		background-color: var(--cw-bg-surface);
	}

	.cw-multiselect__option--selected .cw-multiselect__checkbox {
		border-color: var(--cw-accent);
		background-color: color-mix(in srgb, var(--cw-accent) 12%, transparent);
	}

	.cw-multiselect__checkbox svg {
		width: 0.875rem;
		height: 0.875rem;
	}

	.cw-multiselect__separator {
		height: 1px;
		margin: var(--cw-space-1) 0;
		background-color: var(--cw-border-muted);
		list-style: none;
	}

	.cw-multiselect__group-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--cw-space-2);
		padding: var(--cw-space-2) var(--cw-space-3) var(--cw-space-1);
		font-size: var(--cw-text-xs);
		font-weight: var(--cw-font-semibold);
		color: var(--cw-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		list-style: none;
		cursor: default;
		user-select: none;
	}

	.cw-multiselect__group-header--alt {
		background-color: color-mix(in srgb, var(--cw-text-primary) 5%, transparent);
		margin-left: calc(var(--cw-space-1) * -1);
		margin-right: calc(var(--cw-space-1) * -1);
		padding-left: calc(var(--cw-space-3) + var(--cw-space-1));
		padding-right: calc(var(--cw-space-3) + var(--cw-space-1));
	}

	.cw-multiselect__group-header-label {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.cw-multiselect__group-actions {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.cw-multiselect__group-action {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		color: var(--cw-text-muted);
		background: transparent;
		border: 0;
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		transition:
			color var(--cw-duration-fast) var(--cw-ease-default),
			background-color var(--cw-duration-fast) var(--cw-ease-default);
	}

	.cw-multiselect__group-action:hover:not(:disabled) {
		color: var(--cw-accent);
		background-color: var(--cw-bg-muted);
	}

	.cw-multiselect__group-action:focus-visible {
		outline: none;
		color: var(--cw-accent);
		box-shadow: 0 0 0 var(--cw-focus-ring-width)
			color-mix(in srgb, var(--cw-focus-ring-color) 35%, transparent);
	}

	.cw-multiselect__group-action:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.cw-multiselect__group-action svg {
		width: 1rem;
		height: 1rem;
	}

	.cw-multiselect__group-header + .cw-multiselect__group-header,
	.cw-multiselect__option + .cw-multiselect__group-header {
		margin-top: var(--cw-space-1);
	}

	.cw-multiselect__clear {
		padding: var(--cw-space-2) var(--cw-space-3);
		font-size: var(--cw-text-sm);
		color: var(--cw-tone-danger-text);
		border-radius: var(--cw-radius-sm);
		cursor: pointer;
		text-align: center;
	}

	.cw-multiselect__clear:hover {
		background-color: var(--cw-bg-muted);
	}

	/* ── Error state ─────────────────────── */
	.cw-multiselect--error .cw-multiselect__trigger {
		border-color: var(--cw-tone-danger-border);
	}

	.cw-multiselect--disabled .cw-multiselect__trigger {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.cw-multiselect__error {
		font-size: var(--cw-text-xs);
		color: var(--cw-tone-danger-text);
		margin: 0;
	}
</style>
