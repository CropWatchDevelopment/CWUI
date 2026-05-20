<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Option {
		label: string;
		value: string;
		disabled?: boolean;
	}

	interface SelectedItem {
		id: string;
		label: string;
	}

	interface Props {
		options: Option[];
		value?: SelectedItem[];
		name?: string;
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
		onchange?: (value: SelectedItem[]) => void;
		class?: string;
	}

	let {
		options,
		value = $bindable<SelectedItem[]>([]),
		name,
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
		onchange,
		class: className = ''
	}: Props = $props();

	const uid = $props.id();

	let open = $state(false);
	let listboxRef = $state<HTMLUListElement | null>(null);
	let triggerRef = $state<HTMLDivElement | null>(null);
	let activeIndex = $state(-1);
	let listboxStyle = $state('');

	const selectedIds = $derived(new Set(value.map((v) => v.id)));
	const visibleChips = $derived(showAllSelectedItems ? value : value.slice(0, maxVisibleChips));
	const overflowCount = $derived(
		showAllSelectedItems ? 0 : Math.max(0, value.length - maxVisibleChips)
	);

	function toggle() {
		if (disabled) return;
		open = !open;
		if (open) {
			const firstSelected = options.findIndex((o) => selectedIds.has(o.value));
			activeIndex = firstSelected >= 0 ? firstSelected : 0;
		}
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
				if (!open) {
					open = true;
					const firstSelected = options.findIndex((o) => selectedIds.has(o.value));
					activeIndex = firstSelected >= 0 ? firstSelected : 0;
				}
				break;
			case 'Escape':
				open = false;
				break;
		}
	}

	function handleListKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = Math.min(activeIndex + 1, options.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = Math.max(activeIndex - 1, 0);
				break;
			case 'Home':
				e.preventDefault();
				activeIndex = 0;
				break;
			case 'End':
				e.preventDefault();
				activeIndex = options.length - 1;
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				if (activeIndex >= 0 && !options[activeIndex].disabled) {
					toggleOption(options[activeIndex]);
				}
				break;
			case 'Escape':
				e.preventDefault();
				open = false;
				triggerRef?.focus();
				break;
			case 'Tab':
				open = false;
				break;
		}
	}

	function handleBackdropClick() {
		open = false;
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

		listboxStyle = `left:${Math.round(left)}px;top:${Math.round(top)}px;width:${listWidth}px;`;
	}

	$effect(() => {
		if (!open || !listboxRef) return;

		const raf = requestAnimationFrame(() => {
			updateListboxPosition();
			listboxRef?.focus();
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
		<label class="cw-multiselect__label" id="{uid}-label" for="{uid}-trigger">{label}</label>
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
		id="{uid}-trigger"
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
			{#each options as opt, i (opt.value)}
				{@const isSelected = selectedIds.has(opt.value)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<li
					role="option"
					class="cw-multiselect__option"
					class:cw-multiselect__option--active={i === activeIndex}
					class:cw-multiselect__option--selected={isSelected}
					class:cw-multiselect__option--disabled={opt.disabled}
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
		max-height: 15rem;
		overflow-y: auto;
		outline: none;
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
